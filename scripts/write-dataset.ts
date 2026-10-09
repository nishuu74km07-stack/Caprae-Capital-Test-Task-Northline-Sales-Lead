import fs from "node:fs";
import path from "node:path";
import { recordsToCsv } from "../src/lib/csv.ts";
import { seedRecords } from "../src/data/seed.ts";

const target = path.join(process.cwd(), "data", "leads.csv");
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, recordsToCsv(seedRecords));
console.log(`Wrote ${seedRecords.length} rows to ${target}`);
