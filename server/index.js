import "dotenv/config";
import cors from "cors";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { google } from "googleapis";
import nodemailer from "nodemailer";
import { authenticateOdoo, executeKw, fetchOdooReportPdf } from "./odoo.js";
import { getSetting, recordOwnershipDb, setSetting, usersDb } from "./store.js";

const app = express();
const port = Number.parseInt(process.env.PORT ?? "3001", 10);
const jwtSecret = process.env.APP_JWT_SECRET || "change-me-in-production";
const appOrigin = process.env.APP_ORIGIN || "http://localhost:5173";
const smtpEnabled = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const googleDriveEnabled = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_DRIVE_FOLDER_ID);
const rolePermissions = {
  admin: { manageUsers: true, manageSettings: true, writeAccounting: true },
  accountant: { manageUsers: false, manageSettings: false, writeAccounting: true },
  viewer: { manageUsers: false, manageSettings: false, writeAccounting: false },
};

const mailTransport = smtpEnabled
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT ?? "587", 10),
      secure: String(process.env.SMTP_SECURE ?? "false") === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const googleAuth = googleDriveEnabled
  ? new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/drive"],
    })
  : null;

const drive = googleAuth ? google.drive({ version: "v3", auth: googleAuth }) : null;

app.use(
  cors({
    origin: appOrigin,
    credentials: false,
  }),
);
app.use(express.json({ limit: "1mb" }));

function getPermissions(role) {
  return rolePermissions[role] ?? rolePermissions.viewer;
}

async function getDocumentPdf(settings, kind, recordId) {
  const map = {
    invoice: {
      filename: `invoice-${recordId}.pdf`,
      reportNames: ["account.report_invoice_with_payments", "account.report_invoice", "account.account_invoices"],
    },
    bill: {
      filename: `bill-${recordId}.pdf`,
      reportNames: ["account.report_invoice_with_payments", "account.report_invoice", "account.account_invoices"],
    },
    sale_order: {
      filename: `sale-order-${recordId}.pdf`,
      reportNames: ["sale.action_report_saleorder", "sale.report_saleorder"],
    },
    purchase_order: {
      filename: `purchase-order-${recordId}.pdf`,
      reportNames: ["purchase.report_purchasequotation", "purchase.report_purchaseorder"],
    },
  };

  const config = map[kind];
  if (!config) {
    throw new Error("Unsupported document type.");
  }

  const buffer = await fetchOdooReportPdf(settings, config.reportNames, recordId);
  return { buffer, filename: config.filename };
}

async function uploadPdfToGoogleDrive(filename, buffer) {
  if (!drive) {
    throw new Error("Google Drive is not configured on the server.");
  }

  const file = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      mimeType: "application/pdf",
    },
    media: {
      mimeType: "application/pdf",
      body: Buffer.from(buffer),
    },
    fields: "id,webViewLink,webContentLink,name",
    supportsAllDrives: true,
  });

  if (String(process.env.GOOGLE_DRIVE_SHARE_PUBLIC ?? "false") === "true") {
    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
      supportsAllDrives: true,
    });
  }

  return file.data;
}

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    odooUserId: user.odooUserId || null,
    mustChangePassword: Boolean(user.mustChangePassword),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

const ACCOUNTANT_VISIBLE_MODELS = new Set([
  "sale.order",
  "purchase.order",
  "account.move",
  "res.partner",
  "product.product",
  "product.pricelist",
  "account.journal",
  "account.account",
]);

const ACCOUNTANT_OPEN_MODELS = new Set([
  "res.partner",
  "product.product",
  "product.pricelist",
  "account.journal",
  "account.account",
]);

async function resolveOdooGroupIds(settings, externalIds) {
  if (!externalIds.length) {
    return [];
  }

  const orDomain = [];
  for (const externalId of externalIds) {
    const [module, name] = externalId.split(".");
    if (!module || !name) {
      continue;
    }
    if (orDomain.length) {
      orDomain.push("|");
    }
    orDomain.push("&", ["module", "=", module], ["name", "=", name]);
  }

  const rows = await executeKw(settings, "ir.model.data", "search_read", [orDomain], {
    fields: ["res_id", "module", "name"],
    limit: externalIds.length + 10,
  });

  return Array.from(new Set(rows.map((row) => Number(row.res_id)).filter(Boolean)));
}

async function findOdooUserByEmail(settings, email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  const loginMatches = await executeKw(settings, "res.users", "search_read", [[["login", "=", normalizedEmail]]], {
    fields: ["id", "name", "login", "email", "groups_id", "active"],
    limit: 1,
  });
  if (loginMatches[0]) {
    return loginMatches[0];
  }

  const emailMatches = await executeKw(settings, "res.users", "search_read", [[["email", "=", normalizedEmail]]], {
    fields: ["id", "name", "login", "email", "groups_id", "active"],
    limit: 1,
  });
  return emailMatches[0] ?? null;
}

async function ensureOdooUserForAppUser(settings, user) {
  const requiredGroupIds = await resolveOdooGroupIds(settings, [
    "base.group_user",
    "account.group_account_user",
    "sales_team.group_sale_salesman",
    "purchase.group_purchase_user",
  ]);

  const existing = await findOdooUserByEmail(settings, user.email);
  if (existing) {
    const mergedGroups = Array.from(new Set([...(existing.groups_id ?? []), ...requiredGroupIds]));
    await executeKw(settings, "res.users", "write", [[Number(existing.id)], {
      name: user.name,
      login: user.email,
      email: user.email,
      active: true,
      ...(mergedGroups.length ? { groups_id: [[6, 0, mergedGroups]] } : {}),
    }]);
    return Number(existing.id);
  }

  const createdUserId = await executeKw(settings, "res.users", "create", [[{
    name: user.name,
    login: user.email,
    email: user.email,
    active: true,
    notification_type: "inbox",
    ...(requiredGroupIds.length ? { groups_id: [[6, 0, requiredGroupIds]] } : {}),
  }]]);

  return Number(createdUserId);
}

async function getOwnedRecordIds(userId, model) {
  const rows = await recordOwnershipDb.find({ userId, model });
  return new Set(rows.map((row) => Number(row.recordId)).filter(Boolean));
}

async function rememberRecordOwnership({ userId, odooUserId, email, model, recordId }) {
  await recordOwnershipDb.update(
    { userId, model, recordId: Number(recordId) },
    {
      $set: {
        userId,
        odooUserId: odooUserId || null,
        email,
        model,
        recordId: Number(recordId),
      },
    },
    { upsert: true },
  );
}

function isAccountantScopedUser(user) {
  return user?.role === "accountant";
}

async function filterScopedRows(user, model, rows) {
  if (!isAccountantScopedUser(user)) {
    return rows;
  }

  if (!ACCOUNTANT_VISIBLE_MODELS.has(model)) {
    return [];
  }

  if (ACCOUNTANT_OPEN_MODELS.has(model)) {
    return rows;
  }

  const ownedIds = await getOwnedRecordIds(user._id, model);
  const odooUserId = Number(user.odooUserId || 0);

  return rows.filter((row) => {
    const recordId = Number(row.id || 0);
    if (ownedIds.has(recordId)) {
      return true;
    }

    if (model === "sale.order" || model === "purchase.order") {
      return Number(row.user_id?.[0] || 0) === odooUserId;
    }

    if (model === "account.move") {
      return Number(row.invoice_user_id?.[0] || row.user_id?.[0] || 0) === odooUserId;
    }

    return false;
  });
}

async function readVisibleRows(settings, user, { model, domain = [], fields = [], order = "write_date desc", limit = 10 }) {
  if (!isAccountantScopedUser(user)) {
    return executeKw(settings, model, "search_read", [domain], { fields, limit, order });
  }

  const scopedFields = Array.from(new Set(["id", "user_id", "invoice_user_id", ...fields]));
  const rows = await readAllRecords(settings, model, domain, scopedFields, order, 200);
  const filteredRows = await filterScopedRows(user, model, rows);
  return filteredRows.slice(0, Number(limit));
}

async function countVisibleRows(settings, user, { model, domain = [] }) {
  if (!isAccountantScopedUser(user)) {
    return executeKw(settings, model, "search_count", [domain]);
  }

  const rows = await readAllRecords(settings, model, domain, ["id", "user_id", "invoice_user_id"], "id asc", 200);
  const filteredRows = await filterScopedRows(user, model, rows);
  return filteredRows.length;
}

async function aggregateVisibleRows(settings, user, { model, domain = [], field }) {
  if (!isAccountantScopedUser(user)) {
    const rows = await executeKw(settings, model, "search_read", [domain], {
      fields: [field],
      limit: 100,
      order: "write_date desc",
    });
    return rows.reduce((sum, row) => sum + Number(row[field] || 0), 0);
  }

  const rows = await readAllRecords(settings, model, domain, ["id", "user_id", "invoice_user_id", field], "write_date desc", 200);
  const filteredRows = await filterScopedRows(user, model, rows);
  return filteredRows.reduce((sum, row) => sum + Number(row[field] || 0), 0);
}

async function getCustomerStatementDetail(settings, partnerId) {
  const rows = await readAllRecords(
    settings,
    "account.move",
    [["move_type", "=", "out_invoice"], ["partner_id", "=", Number(partnerId)]],
    ["id", "name", "invoice_date", "invoice_date_due", "state", "payment_state", "amount_total", "amount_residual", "currency_id", "partner_id"],
    "invoice_date desc",
  );

  return {
    customer: rows[0]?.partner_id?.[1] || "Unknown customer",
    partnerId: Number(partnerId),
    totals: {
      invoicedAmount: sumNumbers(rows, "amount_total"),
      openAmount: sumNumbers(rows, "amount_residual"),
      count: rows.length,
    },
    entries: rows,
  };
}

function normalizeHost(host = "") {
  return String(host).split(":")[0].trim().toLowerCase();
}

function getRegionFromHost(host = "") {
  const normalizedHost = normalizeHost(host);
  if (normalizedHost.includes("ksa.")) {
    return "ksa";
  }
  if (normalizedHost.includes("uae.")) {
    return "uae";
  }
  return "";
}

function getEnvRegionSettings(region) {
  if (!region) {
    return null;
  }

  const prefix = region.toUpperCase();
  return {
    url: process.env[`${prefix}_ODOO_URL`] || "",
    database: process.env[`${prefix}_ODOO_DATABASE`] || "",
    username: process.env[`${prefix}_ODOO_USERNAME`] || "",
    password: process.env[`${prefix}_ODOO_PASSWORD`] || "",
    reportPassword: process.env[`${prefix}_ODOO_REPORT_PASSWORD`] || "",
  };
}

function buildSettingsKey(region, key) {
  return region ? `${region}_odoo_${key}` : `odoo_${key}`;
}

async function getOdooSettings(host = "") {
  const region = getRegionFromHost(host);
  const envRegionSettings = getEnvRegionSettings(region);
  const fallbackSettings = {
    url: envRegionSettings?.url || process.env.ODOO_URL || "",
    database: envRegionSettings?.database || process.env.ODOO_DATABASE || "",
    username: envRegionSettings?.username || process.env.ODOO_USERNAME || "",
    password: envRegionSettings?.password || process.env.ODOO_PASSWORD || "",
    reportPassword: envRegionSettings?.reportPassword || process.env.ODOO_REPORT_PASSWORD || "",
  };

  return {
    region,
    url: await getSetting(buildSettingsKey(region, "url"), fallbackSettings.url),
    database: await getSetting(buildSettingsKey(region, "database"), fallbackSettings.database),
    username: await getSetting(buildSettingsKey(region, "username"), fallbackSettings.username),
    password: await getSetting(buildSettingsKey(region, "password"), fallbackSettings.password),
    reportPassword: await getSetting(buildSettingsKey(region, "report_password"), fallbackSettings.reportPassword),
  };
}

async function saveOdooSettings(settings, host = "") {
  const region = getRegionFromHost(host);
  await Promise.all([
    setSetting(buildSettingsKey(region, "url"), settings.url),
    setSetting(buildSettingsKey(region, "database"), settings.database),
    setSetting(buildSettingsKey(region, "username"), settings.username),
    setSetting(buildSettingsKey(region, "password"), settings.password),
    setSetting(buildSettingsKey(region, "report_password"), settings.reportPassword || ""),
  ]);
}

function startOfYear(date = new Date()) {
  return `${date.getFullYear()}-01-01`;
}

function formatQuarterLabel(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `Q${quarter} ${date.getFullYear()}`;
}

function lastQuarterStarts(count = 4) {
  const dates = [];
  const current = new Date();
  const quarterStartMonth = Math.floor(current.getMonth() / 3) * 3;

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(current.getFullYear(), quarterStartMonth - index * 3, 1);
    dates.push(date);
  }

  return dates;
}

function sumNumbers(rows, field) {
  return rows.reduce((sum, row) => sum + Number(row?.[field] || 0), 0);
}

function bucketByQuarter(rows, dateField, amountField) {
  const buckets = new Map();

  for (const row of rows) {
    const label = formatQuarterLabel(row?.[dateField]);
    const current = buckets.get(label) || { label, amount: 0, count: 0 };
    current.amount += Number(row?.[amountField] || 0);
    current.count += 1;
    buckets.set(label, current);
  }

  return Array.from(buckets.values());
}

function formatMonthLabel(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(date);
}

function lastMonthStarts(count = 6) {
  const dates = [];
  const current = new Date();

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(current.getFullYear(), current.getMonth() - index, 1);
    dates.push(date);
  }

  return dates;
}

function bucketByMonth(rows, dateField, amountField) {
  const buckets = new Map();

  for (const row of rows) {
    const label = formatMonthLabel(row?.[dateField]);
    const current = buckets.get(label) || { label, amount: 0, count: 0 };
    current.amount += Number(row?.[amountField] || 0);
    current.count += 1;
    buckets.set(label, current);
  }

  return Array.from(buckets.values());
}

function bucketSalesOwners(rows) {
  const buckets = new Map();

  for (const row of rows) {
    const userName = row?.user_id?.[1] || "Unassigned";
    const current = buckets.get(userName) || { owner: userName, amount: 0, count: 0 };
    current.amount += Number(row?.amount_total || 0);
    current.count += 1;
    buckets.set(userName, current);
  }

  return Array.from(buckets.values()).sort((left, right) => right.amount - left.amount);
}

function bucketCustomers(rows) {
  const buckets = new Map();

  for (const row of rows) {
    const customer = row?.partner_id?.[1] || "Unknown customer";
    const current = buckets.get(customer) || {
      customer,
      partnerId: row?.partner_id?.[0] || null,
      openAmount: 0,
      invoicedAmount: 0,
      count: 0,
    };
    current.openAmount += Number(row?.amount_residual || 0);
    current.invoicedAmount += Number(row?.amount_total || 0);
    current.count += 1;
    buckets.set(customer, current);
  }

  return Array.from(buckets.values()).sort((left, right) => right.openAmount - left.openAmount);
}

function classifyAccountType(type) {
  if (!type) {
    return "other";
  }

  if (type.includes("receivable")) {
    return "receivable";
  }

  if (type.includes("payable")) {
    return "payable";
  }

  if (type.startsWith("asset")) {
    return "asset";
  }

  if (type.startsWith("liability")) {
    return "liability";
  }

  if (type.startsWith("equity")) {
    return "equity";
  }

  if (type.startsWith("income")) {
    return "income";
  }

  if (type.startsWith("expense")) {
    return type.includes("direct") ? "direct_cost" : "expense";
  }

  return "other";
}

async function readAllRecords(settings, model, domain, fields, order = "id asc", batchSize = 200) {
  const rows = [];
  let offset = 0;

  while (true) {
    const batch = await executeKw(settings, model, "search_read", [domain], {
      fields,
      limit: batchSize,
      offset,
      order,
    });

    rows.push(...batch);
    if (batch.length < batchSize) {
      break;
    }

    offset += batchSize;
  }

  return rows;
}

async function buildAdminDashboardSummary(settings) {
  const today = new Date();
  const yearStart = startOfYear(today);
  const quarterStarts = lastQuarterStarts(4);
  const monthStarts = lastMonthStarts(6);
  const earliestQuarter = quarterStarts[0].toISOString().slice(0, 10);
  const currentQuarterStart = quarterStarts[quarterStarts.length - 1].toISOString().slice(0, 10);
  const earliestMonth = monthStarts[0].toISOString().slice(0, 10);
  const currentDate = today.toISOString().slice(0, 10);

  const [
    salesOrders,
    invoices,
    bills,
    payments,
    moveLines,
    accountCatalog,
  ] = await Promise.all([
    readAllRecords(
      settings,
      "sale.order",
      [["date_order", ">=", earliestQuarter]],
      ["id", "name", "date_order", "amount_total", "state", "user_id"],
      "date_order asc",
    ),
    readAllRecords(
      settings,
      "account.move",
      [["move_type", "=", "out_invoice"]],
      ["id", "name", "invoice_date", "invoice_date_due", "amount_total", "amount_tax", "amount_residual", "state", "payment_state", "partner_id"],
      "invoice_date desc",
    ),
    readAllRecords(
      settings,
      "account.move",
      [["move_type", "=", "in_invoice"]],
      ["id", "name", "invoice_date", "invoice_date_due", "amount_total", "amount_tax", "amount_residual", "state", "payment_state", "partner_id"],
      "invoice_date desc",
    ),
    readAllRecords(
      settings,
      "account.payment",
      [["date", ">=", yearStart]],
      ["id", "date", "amount", "state"],
      "date desc",
    ),
    readAllRecords(
      settings,
      "account.move.line",
      [["parent_state", "=", "posted"], ["date", ">=", yearStart]],
      ["id", "date", "balance", "debit", "credit", "account_id"],
      "date desc",
    ),
    readAllRecords(settings, "account.account", [], ["id", "name", "code", "account_type"], "code asc"),
  ]);

  const postedSales = salesOrders.filter((row) => ["sale", "done"].includes(row.state));
  const quarterlySales = bucketByQuarter(postedSales, "date_order", "amount_total");
  const monthlySales = bucketByMonth(
    postedSales.filter((row) => row.date_order >= earliestMonth),
    "date_order",
    "amount_total",
  );
  const ownerPerformance = bucketSalesOwners(postedSales).slice(0, 6);
  const customerStatements = bucketCustomers(invoices.filter((row) => row.amount_residual > 0));
  const postedInvoices = invoices.filter((row) => row.state === "posted");
  const postedBills = bills.filter((row) => row.state === "posted");
  const draftInvoices = invoices.filter((row) => row.state === "draft");
  const draftBills = bills.filter((row) => row.state === "draft");
  const quarterInvoices = invoices.filter((row) => row.invoice_date >= currentQuarterStart);
  const quarterBills = bills.filter((row) => row.invoice_date >= currentQuarterStart);
  const upcomingPayments = postedBills.filter(
    (row) => row.amount_residual > 0 && row.invoice_date_due && row.invoice_date_due >= currentDate,
  );
  const pendingPayments = postedInvoices.filter(
    (row) => row.amount_residual > 0 && (!row.payment_state || !["paid", "in_payment"].includes(row.payment_state)),
  );
  const overdueReceivables = postedInvoices.filter(
    (row) => row.amount_residual > 0 && row.invoice_date_due && row.invoice_date_due < currentDate,
  );
  const overduePayables = postedBills.filter(
    (row) => row.amount_residual > 0 && row.invoice_date_due && row.invoice_date_due < currentDate,
  );

  const accountTypeById = new Map(accountCatalog.map((row) => [row.id, row.account_type]));
  const statement = {
    assetsCurrent: 0,
    receivables: 0,
    liabilitiesCurrent: 0,
    payables: 0,
    equity: 0,
    revenue: 0,
    directCosts: 0,
    expenses: 0,
    cashInHand: 0,
  };

  for (const line of moveLines) {
    const accountId = Array.isArray(line.account_id) ? line.account_id[0] : line.account_id;
    const bucket = classifyAccountType(accountTypeById.get(accountId));
    const balance = Number(line.balance || 0);

    if (bucket === "asset") {
      statement.assetsCurrent += balance;
    } else if (bucket === "receivable") {
      statement.receivables += balance;
      statement.assetsCurrent += balance;
    } else if (bucket === "liability") {
      statement.liabilitiesCurrent += Math.abs(balance);
    } else if (bucket === "payable") {
      statement.payables += Math.abs(balance);
      statement.liabilitiesCurrent += Math.abs(balance);
    } else if (bucket === "equity") {
      statement.equity += Math.abs(balance);
    } else if (bucket === "income") {
      statement.revenue += Math.abs(balance);
    } else if (bucket === "direct_cost") {
      statement.directCosts += Math.abs(balance);
    } else if (bucket === "expense") {
      statement.expenses += Math.abs(balance);
    }

    const accountType = accountTypeById.get(accountId) || "";
    if (String(accountType).includes("cash") || String(accountType).includes("bank")) {
      statement.cashInHand += balance;
    }
  }

  const ytdRevenue = sumNumbers(
    postedInvoices.filter((row) => row.invoice_date >= yearStart),
    "amount_total",
  );
  const ytdPayments = sumNumbers(
    payments.filter((row) => row.state === "posted"),
    "amount",
  );
  const netProfit = statement.revenue - statement.directCosts - statement.expenses;
  const warningFlags = [
    {
      title: "Receivables pressure",
      level: overdueReceivables.length > 10 || sumNumbers(overdueReceivables, "amount_residual") > 100000 ? "high" : "normal",
      value: sumNumbers(overdueReceivables, "amount_residual"),
      note: `${overdueReceivables.length} overdue customer invoices still open.`,
    },
    {
      title: "Payables pressure",
      level: overduePayables.length > 10 || sumNumbers(overduePayables, "amount_residual") > 100000 ? "high" : "normal",
      value: sumNumbers(overduePayables, "amount_residual"),
      note: `${overduePayables.length} overdue vendor bills still open.`,
    },
    {
      title: "Draft invoice backlog",
      level: draftInvoices.length > 15 ? "medium" : "normal",
      value: draftInvoices.length,
      note: "Customer invoices waiting for posting or review.",
    },
    {
      title: "Draft bill backlog",
      level: draftBills.length > 15 ? "medium" : "normal",
      value: draftBills.length,
      note: "Vendor bills waiting for posting or review.",
    },
  ];

  return {
    overview: {
      totalSalesVolume: sumNumbers(postedSales, "amount_total"),
      ytdRevenue,
      paymentsReceived: ytdPayments,
      currentReceivables: sumNumbers(postedInvoices.filter((row) => row.amount_residual > 0), "amount_residual"),
      currentPayables: sumNumbers(postedBills.filter((row) => row.amount_residual > 0), "amount_residual"),
      netProfit,
    },
    periods: quarterlySales,
    monthly: monthlySales,
    team: {
      topOwners: ownerPerformance,
    },
    quarterlyMonitoring: {
      agedReceivables: sumNumbers(overdueReceivables.filter((row) => row.invoice_date >= currentQuarterStart), "amount_residual"),
      paymentsReceived: sumNumbers(payments.filter((row) => row.state === "posted" && row.date >= currentQuarterStart), "amount"),
      invoicedItems: quarterInvoices.length,
      billsCreated: quarterBills.length,
      cashInHand: statement.cashInHand,
      upcomingPayments: sumNumbers(upcomingPayments, "amount_residual"),
      pendingPayments: sumNumbers(pendingPayments, "amount_residual"),
      vatClosed: sumNumbers(quarterInvoices.filter((row) => row.state === "posted"), "amount_tax"),
      vatOpen: sumNumbers(quarterInvoices.filter((row) => row.state !== "posted"), "amount_tax"),
    },
    statements: {
      balanceSheet: {
        assetsCurrent: statement.assetsCurrent,
        receivables: statement.receivables,
        liabilitiesCurrent: statement.liabilitiesCurrent,
        payables: statement.payables,
        equity: statement.equity,
      },
      profitAndLoss: {
        revenue: statement.revenue,
        directCosts: statement.directCosts,
        operatingExpenses: statement.expenses,
        netProfit,
      },
    },
    controls: {
      overdueReceivablesCount: overdueReceivables.length,
      overdueReceivablesValue: sumNumbers(overdueReceivables, "amount_residual"),
      overduePayablesCount: overduePayables.length,
      overduePayablesValue: sumNumbers(overduePayables, "amount_residual"),
    },
    operations: {
      draftInvoices: draftInvoices.length,
      draftBills: draftBills.length,
      confirmedSales: postedSales.length,
      postedPayments: payments.filter((row) => row.state === "posted").length,
    },
    customerStatements: customerStatements.slice(0, 20),
    warnings: warningFlags,
  };
}

async function ensureBootstrapAdmin() {
  const existingAdmin = await usersDb.findOne({ role: "admin" });
  if (existingAdmin) {
    return;
  }

  const email = process.env.ADMIN_EMAIL || "admin@redoxyksa.com";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 10);

  await usersDb.insert({
    name: "REDOXY Admin",
    email: email.toLowerCase(),
    passwordHash,
    role: "admin",
    active: true,
    mustChangePassword: true,
  });

  console.log(`Bootstrapped admin user: ${email}`);
}

await ensureBootstrapAdmin();

function createToken(user) {
  return jwt.sign(
    {
      sub: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    jwtSecret,
    { expiresIn: "12h" },
  );
}

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await usersDb.findOne({ _id: payload.sub, active: true });
    if (!user) {
      return res.status(401).json({ message: "User session is no longer valid." });
    }

    req.userRecord = user;
    req.user = sanitizeUser(user);
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired session." });
  }
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!getPermissions(req.user?.role)[permission]) {
      return res.status(403).json({ message: "You do not have permission for this action." });
    }

    return next();
  };
}

async function requireConfiguredOdoo(req, res, next) {
  const settings = await getOdooSettings(req.headers.host);
  if (!settings.url || !settings.database || !settings.username || !settings.password) {
    return res.status(400).json({ message: "Odoo is not configured on the server yet." });
  }

  req.odooSettings = settings;
  return next();
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  const user = await usersDb.findOne({
    email: String(email || "").trim().toLowerCase(),
    active: true,
  });

  if (!user || !(await bcrypt.compare(String(password || ""), user.passwordHash))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  return res.json({
    token: createToken(user),
    user: sanitizeUser(user),
  });
});

app.get("/api/auth/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

app.post("/api/auth/change-password", authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};
  if (!newPassword || String(newPassword).length < 8) {
    return res.status(400).json({ message: "New password must be at least 8 characters." });
  }

  const matches = await bcrypt.compare(String(currentPassword || ""), req.userRecord.passwordHash);
  if (!matches) {
    return res.status(400).json({ message: "Current password is incorrect." });
  }

  await usersDb.update(
    { _id: req.userRecord._id },
    { $set: { passwordHash: await bcrypt.hash(String(newPassword), 10), mustChangePassword: false } },
  );

  res.json({ ok: true });
});

app.post("/api/users/:id/reset-password", authenticate, requirePermission("manageUsers"), async (req, res) => {
  const { newPassword } = req.body ?? {};
  if (!newPassword || String(newPassword).length < 8) {
    return res.status(400).json({ message: "Temporary password must be at least 8 characters." });
  }

  const user = await usersDb.findOne({ _id: req.params.id });
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  await usersDb.update(
    { _id: user._id },
    { $set: { passwordHash: await bcrypt.hash(String(newPassword), 10), mustChangePassword: true } },
  );

  res.json({ ok: true });
});

app.get("/api/users", authenticate, requirePermission("manageUsers"), async (_req, res) => {
  const users = await usersDb.find({}).sort({ name: 1 });
  res.json({ users: users.map(sanitizeUser) });
});

app.post("/api/users", authenticate, requirePermission("manageUsers"), async (req, res) => {
  const { name, email, password, role = "viewer" } = req.body ?? {};
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!name || !normalizedEmail || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  if (!rolePermissions[role]) {
    return res.status(400).json({ message: "Unsupported role." });
  }

  const existingUser = await usersDb.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({ message: "A user with that email already exists." });
  }

  let odooUserId = null;
  if (["accountant", "admin"].includes(role)) {
    const settings = await getOdooSettings(req.headers.host);
    if (!settings.url || !settings.database || !settings.username || !settings.password) {
      return res.status(400).json({ message: "Configure Odoo before creating accountant or admin users." });
    }

    odooUserId = await ensureOdooUserForAppUser(settings, {
      name: String(name).trim(),
      email: normalizedEmail,
    });
  }

  const newUser = await usersDb.insert({
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(String(password), 10),
    role,
    active: true,
    odooUserId,
    mustChangePassword: true,
  });

  res.status(201).json({ user: sanitizeUser(newUser) });
});

app.patch("/api/users/:id", authenticate, requirePermission("manageUsers"), async (req, res) => {
  const { role, active } = req.body ?? {};
  const user = await usersDb.findOne({ _id: req.params.id });
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const updates = {};
  if (role !== undefined) {
    if (!rolePermissions[role]) {
      return res.status(400).json({ message: "Unsupported role." });
    }
    if (["accountant", "admin"].includes(role) && !user.odooUserId) {
      const settings = await getOdooSettings(req.headers.host);
      if (!settings.url || !settings.database || !settings.username || !settings.password) {
        return res.status(400).json({ message: "Configure Odoo before assigning accountant or admin roles." });
      }
      updates.odooUserId = await ensureOdooUserForAppUser(settings, {
        name: user.name,
        email: user.email,
      });
    }
    updates.role = role;
  }
  if (active !== undefined) {
    updates.active = Boolean(active);
  }

  await usersDb.update({ _id: user._id }, { $set: updates });
  const updated = await usersDb.findOne({ _id: user._id });
  res.json({ user: sanitizeUser(updated) });
});

app.get("/api/settings/odoo", authenticate, requirePermission("manageSettings"), async (_req, res) => {
  const settings = await getOdooSettings(_req.headers.host);
  res.json({
    settings: {
      region: settings.region || "default",
      url: settings.url,
      database: settings.database,
      username: settings.username,
      password: settings.password ? "********" : "",
      reportPassword: settings.reportPassword ? "********" : "",
      configured: Boolean(settings.url && settings.database && settings.username && settings.password),
    },
  });
});

app.put("/api/settings/odoo", authenticate, requirePermission("manageSettings"), async (req, res) => {
  const { url, database, username, password, reportPassword } = req.body ?? {};
  if (!url || !database || !username || !password) {
    return res.status(400).json({ message: "All Odoo settings fields are required." });
  }

  await saveOdooSettings({
    url: String(url).trim(),
    database: String(database).trim(),
    username: String(username).trim(),
    password: String(password),
    reportPassword: String(reportPassword || ""),
  }, req.headers.host);

  res.json({ ok: true });
});

app.post("/api/settings/odoo/test", authenticate, requirePermission("manageSettings"), async (req, res) => {
  try {
    await authenticateOdoo(req.body ?? {});
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/meta", authenticate, async (req, res) => {
  const settings = await getOdooSettings(req.headers.host);
  res.json({
    permissions: getPermissions(req.user.role),
    role: req.user.role,
    mustChangePassword: req.user.mustChangePassword,
    odooConfigured: Boolean(settings.url && settings.database && settings.username && settings.password),
    region: settings.region || "default",
  });
});

app.get("/api/dashboard/admin-summary", authenticate, requirePermission("manageSettings"), requireConfiguredOdoo, async (_req, res) => {
  try {
    const settings = _req.odooSettings;
    const summary = await buildAdminDashboardSummary(settings);
    res.json(summary);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/dashboard/customer-statements/:partnerId", authenticate, requirePermission("manageSettings"), requireConfiguredOdoo, async (req, res) => {
  try {
    const statement = await getCustomerStatementDetail(req.odooSettings, req.params.partnerId);
    res.json(statement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/odoo/count", authenticate, requireConfiguredOdoo, async (req, res) => {
  try {
    const settings = req.odooSettings;
    const { model, domain = [] } = req.body ?? {};
    const value = await countVisibleRows(settings, req.userRecord, { model, domain });
    res.json({ value });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/odoo/read", authenticate, requireConfiguredOdoo, async (req, res) => {
  try {
    const settings = req.odooSettings;
    const { model, domain = [], fields = [], limit = 10, order = "write_date desc" } = req.body ?? {};
    const rows = await readVisibleRows(settings, req.userRecord, { model, domain, fields, limit, order });
    res.json({ rows });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/odoo/aggregate", authenticate, requireConfiguredOdoo, async (req, res) => {
  try {
    const settings = req.odooSettings;
    const { model, field, domain = [] } = req.body ?? {};
    const value = await aggregateVisibleRows(settings, req.userRecord, { model, field, domain });
    res.json({ value });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/odoo/action", authenticate, requirePermission("writeAccounting"), requireConfiguredOdoo, async (req, res) => {
  try {
    const settings = req.odooSettings;
    const { model, method, args = [], kwargs = {} } = req.body ?? {};
    const result = await executeKw(settings, model, method, args, kwargs);
    res.json({ result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/catalog/products", authenticate, requireConfiguredOdoo, async (req, res) => {
  try {
    const settings = req.odooSettings;
    const rows = await executeKw(settings, "product.product", "search_read", [[["active", "=", true]]], {
      fields: ["name", "display_name", "list_price", "uom_id", "default_code", "product_tmpl_id", "taxes_id"],
      limit: 300,
      order: "name asc",
    });
    res.json({ rows });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/catalog/pricelists", authenticate, requireConfiguredOdoo, async (req, res) => {
  try {
    const settings = req.odooSettings;
    const rows = await executeKw(settings, "product.pricelist", "search_read", [[]], {
      fields: ["name", "currency_id"],
      limit: 50,
      order: "name asc",
    });
    res.json({ rows });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/catalog/price-preview", authenticate, requireConfiguredOdoo, async (req, res) => {
  try {
    const settings = req.odooSettings;
    const { productId, pricelistId, quantity = 1 } = req.body ?? {};
    if (!productId) {
      return res.status(400).json({ message: "Product is required." });
    }

    const [product] = await executeKw(settings, "product.product", "read", [[Number(productId)]], {
      fields: ["list_price", "product_tmpl_id", "taxes_id", "name"],
    });

    let price = Number(product?.list_price || 0);
    if (pricelistId) {
      try {
        const computed = await executeKw(settings, "product.pricelist", "_get_product_price", [
          Number(pricelistId),
          Number(productId),
          Number(quantity),
          false,
        ]);
        if (typeof computed === "number") {
          price = computed;
        }
      } catch {
        try {
          const legacy = await executeKw(settings, "product.pricelist", "price_get", [[Number(pricelistId)], Number(productId), Number(quantity), false]);
          const legacyPrice = legacy?.[Number(pricelistId)];
          if (typeof legacyPrice === "number") {
            price = legacyPrice;
          }
        } catch {
          // Keep list price fallback when pricelist helpers differ across SaaS versions.
        }
      }
    }

    res.json({
      row: {
        productId: Number(productId),
        priceUnit: price,
        taxesId: product?.taxes_id ?? [],
        name: product?.name ?? "",
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/accounting/create-invoice", authenticate, requirePermission("writeAccounting"), requireConfiguredOdoo, async (req, res) => {
  try {
    const settings = req.odooSettings;
    const { moveType = "out_invoice", partnerId, invoiceDate, ref, invoiceOrigin, lines = [] } = req.body ?? {};
    if (!partnerId || !lines.length) {
      return res.status(400).json({ message: "Customer/vendor and at least one line are required." });
    }

    const invoiceLines = lines.map((line) => [
      0,
      0,
      {
        name: line.label,
        quantity: Number(line.quantity),
        price_unit: Number(line.priceUnit),
        ...(line.productId ? { product_id: Number(line.productId) } : {}),
        ...(line.taxesIds?.length ? { tax_ids: [[6, 0, line.taxesIds.map(Number)]] } : {}),
      },
    ]);

    const payload = {
      move_type: moveType,
      partner_id: Number(partnerId),
      invoice_date: invoiceDate,
      ref,
      invoice_line_ids: invoiceLines,
      ...(req.userRecord.odooUserId ? { invoice_user_id: Number(req.userRecord.odooUserId) } : {}),
      ...(invoiceOrigin ? { invoice_origin: invoiceOrigin } : {}),
    };

    const result = await executeKw(settings, "account.move", "create", [[payload]]);
    await rememberRecordOwnership({
      userId: req.userRecord._id,
      odooUserId: req.userRecord.odooUserId,
      email: req.userRecord.email,
      model: "account.move",
      recordId: result,
    });
    res.json({ id: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/accounting/post-move", authenticate, requirePermission("writeAccounting"), requireConfiguredOdoo, async (req, res) => {
  try {
    const settings = req.odooSettings;
    const { moveId } = req.body ?? {};
    const result = await executeKw(settings, "account.move", "action_post", [[Number(moveId)]]);
    res.json({ result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/accounting/invoices/:id/print", authenticate, requireConfiguredOdoo, async (req, res) => {
  try {
    const settings = req.odooSettings;
    const invoiceId = Number(req.params.id);
    const { buffer: pdfBuffer, filename } = await getDocumentPdf(settings, "invoice", invoiceId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/accounting/bills/:id/print", authenticate, requireConfiguredOdoo, async (req, res) => {
  try {
    const settings = req.odooSettings;
    const billId = Number(req.params.id);
    const { buffer: pdfBuffer, filename } = await getDocumentPdf(settings, "bill", billId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/sales/orders/:id/print", authenticate, requireConfiguredOdoo, async (req, res) => {
  try {
    const settings = req.odooSettings;
    const orderId = Number(req.params.id);
    const { buffer: pdfBuffer, filename } = await getDocumentPdf(settings, "sale_order", orderId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/purchases/orders/:id/print", authenticate, requireConfiguredOdoo, async (req, res) => {
  try {
    const settings = req.odooSettings;
    const orderId = Number(req.params.id);
    const { buffer: pdfBuffer, filename } = await getDocumentPdf(settings, "purchase_order", orderId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/documents/email", authenticate, requireConfiguredOdoo, async (req, res) => {
  try {
    if (!mailTransport) {
      return res.status(400).json({ message: "SMTP is not configured on the server." });
    }

    const settings = req.odooSettings;
    const { kind, recordId, to, subject, message } = req.body ?? {};
    if (!kind || !recordId || !to) {
      return res.status(400).json({ message: "Document type, record id, and recipient email are required." });
    }

    const { buffer, filename } = await getDocumentPdf(settings, kind, Number(recordId));
    await mailTransport.sendMail({
      from: process.env.SMTP_FROM || "REDOXY ERP <no-reply@redoxyksa.com>",
      to: String(to).trim(),
      subject: subject || `REDOXY ERP document: ${filename}`,
      text: message || "Please find the attached PDF document from REDOXY ERP.",
      attachments: [
        {
          filename,
          content: buffer,
          contentType: "application/pdf",
        },
      ],
    });

    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/documents/upload", authenticate, requireConfiguredOdoo, async (req, res) => {
  try {
    const settings = req.odooSettings;
    const { kind, recordId } = req.body ?? {};
    if (!kind || !recordId) {
      return res.status(400).json({ message: "Document type and record id are required." });
    }

    const { buffer, filename } = await getDocumentPdf(settings, kind, Number(recordId));
    const file = await uploadPdfToGoogleDrive(filename, buffer);
    res.json({
      ok: true,
      file,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/accounting/create-entry", authenticate, requirePermission("writeAccounting"), requireConfiguredOdoo, async (req, res) => {
  try {
    const settings = req.odooSettings;
    const { journalId, date, ref, debitAccountId, creditAccountId, amount, label } = req.body ?? {};
    const value = Number(amount);
    const result = await executeKw(settings, "account.move", "create", [[{
      move_type: "entry",
      journal_id: Number(journalId),
      date,
      ref,
      line_ids: [
        [0, 0, { name: label, account_id: Number(debitAccountId), debit: value, credit: 0 }],
        [0, 0, { name: label, account_id: Number(creditAccountId), debit: 0, credit: value }],
      ],
    }]]);
    await rememberRecordOwnership({
      userId: req.userRecord._id,
      odooUserId: req.userRecord.odooUserId,
      email: req.userRecord.email,
      model: "account.move",
      recordId: result,
    });
    res.json({ id: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/sales/create-order", authenticate, requirePermission("writeAccounting"), requireConfiguredOdoo, async (req, res) => {
  try {
    const settings = req.odooSettings;
    const { partnerId, pricelistId, dateOrder, clientReference, note, lines = [] } = req.body ?? {};
    if (!partnerId || !lines.length) {
      return res.status(400).json({ message: "Customer and at least one line are required." });
    }

    const orderLines = lines.map((line) => [
      0,
      0,
      {
        name: line.label,
        product_id: Number(line.productId),
        product_uom_qty: Number(line.quantity),
        price_unit: Number(line.priceUnit),
        ...(line.taxesIds?.length ? { tax_id: [[6, 0, line.taxesIds.map(Number)]] } : {}),
      },
    ]);

    const payload = {
      partner_id: Number(partnerId),
      date_order: dateOrder,
      order_line: orderLines,
      ...(req.userRecord.odooUserId ? { user_id: Number(req.userRecord.odooUserId) } : {}),
      ...(pricelistId ? { pricelist_id: Number(pricelistId) } : {}),
      ...(clientReference ? { client_order_ref: clientReference } : {}),
      ...(note ? { note } : {}),
    };

    const result = await executeKw(settings, "sale.order", "create", [[payload]]);
    await rememberRecordOwnership({
      userId: req.userRecord._id,
      odooUserId: req.userRecord.odooUserId,
      email: req.userRecord.email,
      model: "sale.order",
      recordId: result,
    });
    res.json({ id: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/sales/confirm-order", authenticate, requirePermission("writeAccounting"), requireConfiguredOdoo, async (req, res) => {
  try {
    const settings = req.odooSettings;
    const { orderId } = req.body ?? {};
    const result = await executeKw(settings, "sale.order", "action_confirm", [[Number(orderId)]]);
    res.json({ result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/purchases/create-order", authenticate, requirePermission("writeAccounting"), requireConfiguredOdoo, async (req, res) => {
  try {
    const settings = req.odooSettings;
    const { partnerId, dateOrder, vendorReference, notes, lines = [] } = req.body ?? {};
    if (!partnerId || !lines.length) {
      return res.status(400).json({ message: "Vendor and at least one line are required." });
    }

    const orderLines = lines.map((line) => [
      0,
      0,
      {
        name: line.label,
        product_id: Number(line.productId),
        product_qty: Number(line.quantity),
        price_unit: Number(line.priceUnit),
        ...(line.uomId ? { product_uom: Number(line.uomId) } : {}),
        ...(line.taxesIds?.length ? { taxes_id: [[6, 0, line.taxesIds.map(Number)]] } : {}),
      },
    ]);

    const payload = {
      partner_id: Number(partnerId),
      date_order: dateOrder,
      order_line: orderLines,
      ...(req.userRecord.odooUserId ? { user_id: Number(req.userRecord.odooUserId) } : {}),
      ...(vendorReference ? { partner_ref: vendorReference } : {}),
      ...(notes ? { notes } : {}),
    };

    const result = await executeKw(settings, "purchase.order", "create", [[payload]]);
    await rememberRecordOwnership({
      userId: req.userRecord._id,
      odooUserId: req.userRecord.odooUserId,
      email: req.userRecord.email,
      model: "purchase.order",
      recordId: result,
    });
    res.json({ id: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/purchases/confirm-order", authenticate, requirePermission("writeAccounting"), requireConfiguredOdoo, async (req, res) => {
  try {
    const settings = req.odooSettings;
    const { orderId } = req.body ?? {};
    const result = await executeKw(settings, "purchase.order", "button_confirm", [[Number(orderId)]]);
    res.json({ result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`REDOXY ERP backend listening on http://localhost:${port}`);
});
