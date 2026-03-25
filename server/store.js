import fs from "node:fs";
import path from "node:path";
import Datastore from "nedb-promises";

const dataDir = path.join(process.cwd(), "server", "data");
fs.mkdirSync(dataDir, { recursive: true });

export const usersDb = Datastore.create({
  filename: path.join(dataDir, "users.db"),
  autoload: true,
  timestampData: true,
});

export const settingsDb = Datastore.create({
  filename: path.join(dataDir, "settings.db"),
  autoload: true,
  timestampData: true,
});

export const resetTokensDb = Datastore.create({
  filename: path.join(dataDir, "resetTokens.db"),
  autoload: true,
  timestampData: true,
});

export const recordOwnershipDb = Datastore.create({
  filename: path.join(dataDir, "recordOwnership.db"),
  autoload: true,
  timestampData: true,
});

export async function getSetting(key, fallback = "") {
  const record = await settingsDb.findOne({ key });
  return record?.value ?? fallback;
}

export async function setSetting(key, value) {
  await settingsDb.update({ key }, { $set: { key, value } }, { upsert: true });
}
