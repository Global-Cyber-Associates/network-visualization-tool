import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "backend", "logs");
const SAVE_FILE = path.join(LOG_DIR, "saved_db.json");
const TMP_FILE = path.join(LOG_DIR, "saved_db.json.tmp");

// ensure directory + file exist
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
if (!fs.existsSync(SAVE_FILE)) fs.writeFileSync(SAVE_FILE, "[]", "utf8");

/**
 * Append one entry into a JSON array file (saved_db.json).
 * entry: any JSON-serializable object
 */
export function saveDbCopy(entry) {
  try {
    // read current array
    const raw = fs.readFileSync(SAVE_FILE, "utf8");
    let arr;
    try {
      arr = JSON.parse(raw);
      if (!Array.isArray(arr)) arr = [];
    } catch {
      arr = [];
    }

    // add timestamped entry
    const out = {
      timestamp: new Date().toISOString(),
      ...entry,
    };
    arr.push(out);

    // write atomically: write tmp then rename
    fs.writeFileSync(TMP_FILE, JSON.stringify(arr, null, 2), "utf8");
    fs.renameSync(TMP_FILE, SAVE_FILE);
    return true;
  } catch (err) {
    // don't throw — logging helper should not break main flow
    // eslint-disable-next-line no-console
    console.error("saveDbCopy error:", err && err.message ? err.message : err);
    try {
      if (fs.existsSync(TMP_FILE)) fs.unlinkSync(TMP_FILE);
    } catch {}
    return false;
  }
}