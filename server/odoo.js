import xmlrpc from "xmlrpc";

const reportDebugEnabled = String(process.env.ODOO_REPORT_DEBUG ?? "false") === "true";

function logReportDebug(event, details = {}) {
  if (!reportDebugEnabled) {
    return;
  }

  console.log(`[odoo-report] ${event}`, details);
}

function extractSessionCookie(headers) {
  const mergedCookies = [];
  const appendCookie = (cookie) => {
    if (!cookie) {
      return;
    }

    mergedCookies.push(...String(cookie).split(/,(?=[^;]+=[^;]+)/));
  };

  for (const [key, value] of headers.entries()) {
    if (key.toLowerCase() === "set-cookie") {
      appendCookie(value);
    }
  }

  const rawCookies = headers.getSetCookie?.() ?? [];
  for (const cookie of rawCookies) {
    appendCookie(cookie);
  }

  const cookieHeader = mergedCookies
    .map((cookie) => cookie.split(";")[0]?.trim())
    .filter(Boolean)
    .join("; ");

  return cookieHeader;
}

async function buildSessionCookieFromAuthResponse(response) {
  const headerCookie = extractSessionCookie(response.headers);
  const authPayload = await response.clone().json().catch(() => null);

  logReportDebug("auth-response", {
    status: response.status,
    ok: response.ok,
    cookiePresent: Boolean(headerCookie),
    sessionIdPresent: Boolean(authPayload?.result?.session_id),
    errorName: authPayload?.error?.data?.name || authPayload?.error?.name || "",
    errorMessage: authPayload?.error?.data?.message || authPayload?.error?.message || "",
  });

  if (headerCookie) {
    return { cookieHeader: headerCookie, authPayload };
  }

  const sessionId = authPayload?.result?.session_id;
  if (sessionId) {
    return { cookieHeader: `session_id=${sessionId}`, authPayload };
  }

  return { cookieHeader: "", authPayload };
}

async function parseResponsePreview(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const payload = await response.clone().json().catch(() => null);
    return payload ? JSON.stringify(payload).slice(0, 300) : "";
  }

  const text = await response.clone().text().catch(() => "");
  return text.slice(0, 300);
}

async function fetchPdfFromDirectRoute(baseUrl, cookieHeader, reportName, recordId) {
  const response = await fetch(`${baseUrl}/report/pdf/${reportName}/${recordId}`, {
    headers: {
      Cookie: cookieHeader,
    },
    redirect: "manual",
  });

  const contentType = response.headers.get("content-type") || "";
  logReportDebug("direct-report-response", {
    reportName,
    status: response.status,
    redirected: response.status >= 300 && response.status < 400,
    contentType,
  });

  if (!response.ok) {
    return null;
  }

  const arrayBuffer = await response.arrayBuffer();
  if (contentType.includes("pdf") && arrayBuffer.byteLength > 0) {
    return Buffer.from(arrayBuffer);
  }

  return null;
}

async function fetchPdfFromDownloadRoute(baseUrl, cookieHeader, reportName, recordId) {
  const reportUrl = `/report/pdf/${reportName}/${recordId}`;
  const response = await fetch(`${baseUrl}/report/download`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      data: JSON.stringify([reportUrl, "qweb-pdf"]),
      context: JSON.stringify({}),
    }),
    redirect: "manual",
  });

  const contentType = response.headers.get("content-type") || "";
  logReportDebug("download-report-response", {
    reportName,
    status: response.status,
    redirected: response.status >= 300 && response.status < 400,
    contentType,
  });

  if (!response.ok) {
    return null;
  }

  const arrayBuffer = await response.arrayBuffer();
  if (contentType.includes("pdf") && arrayBuffer.byteLength > 0) {
    return Buffer.from(arrayBuffer);
  }

  return null;
}

function createClient(url) {
  return xmlrpc.createSecureClient({
    url,
    rejectUnauthorized: false,
  });
}

function xmlRpcCall(url, method, params) {
  const client = createClient(url);
  return new Promise((resolve, reject) => {
    client.methodCall(method, params, (error, value) => {
      if (error) {
        reject(new Error(error.message || "Odoo XML-RPC request failed."));
        return;
      }

      resolve(value);
    });
  });
}

export async function authenticateOdoo(settings) {
  const commonUrl = `${settings.url.replace(/\/$/, "")}/xmlrpc/2/common`;
  const uid = await xmlRpcCall(commonUrl, "authenticate", [settings.database, settings.username, settings.password, {}]);
  if (!uid) {
    throw new Error("Authentication failed. Verify the Odoo URL, database, username, and API key.");
  }

  return uid;
}

export async function executeKw(settings, model, method, args = [], kwargs = {}) {
  const uid = await authenticateOdoo(settings);
  const objectUrl = `${settings.url.replace(/\/$/, "")}/xmlrpc/2/object`;
  return xmlRpcCall(objectUrl, "execute_kw", [
    settings.database,
    uid,
    settings.password,
    model,
    method,
    args,
    kwargs,
  ]);
}

export async function fetchOdooReportPdf(settings, reportNames, recordId) {
  const baseUrl = settings.url.replace(/\/$/, "");
  const reportSessionPassword = settings.reportPassword || settings.password;
  const authenticateResponse = await fetch(`${baseUrl}/web/session/authenticate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        db: settings.database,
        login: settings.username,
        password: reportSessionPassword,
      },
    }),
    redirect: "manual",
  });

  if (!authenticateResponse.ok) {
    throw new Error("Failed to authenticate browser-style session with Odoo.");
  }

  const { cookieHeader, authPayload } = await buildSessionCookieFromAuthResponse(authenticateResponse);
  const authErrorMessage = authPayload?.error?.data?.message || authPayload?.error?.message || "";
  const authErrorName = authPayload?.error?.data?.name || "";

  if (authErrorName.includes("AccessDenied") || authErrorMessage.includes("AccessDenied")) {
    throw new Error("Odoo denied report-session authentication. PDF view/download on Odoo Online may require the user's actual password instead of an API key.");
  }

  if (!cookieHeader) {
    throw new Error("Odoo session cookie was not returned.");
  }

  const failures = [];
  for (const reportName of reportNames) {
    const directPdf = await fetchPdfFromDirectRoute(baseUrl, cookieHeader, reportName, recordId);
    if (directPdf) {
      return directPdf;
    }

    const downloadPdf = await fetchPdfFromDownloadRoute(baseUrl, cookieHeader, reportName, recordId);
    if (downloadPdf) {
      return downloadPdf;
    }

    const probeResponse = await fetch(`${baseUrl}/report/pdf/${reportName}/${recordId}`, {
      headers: {
        Cookie: cookieHeader,
      },
      redirect: "manual",
    });
    failures.push({
      reportName,
      status: probeResponse.status,
      contentType: probeResponse.headers.get("content-type") || "",
      preview: await parseResponsePreview(probeResponse),
    });
  }

  logReportDebug("report-failed", { recordId, failures });
  throw new Error("Unable to fetch a printable PDF report for this record from Odoo.");
}
