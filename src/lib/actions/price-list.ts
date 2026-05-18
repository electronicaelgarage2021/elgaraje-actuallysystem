"use server";

const SHEET_ID = "1lSdnSLsJHQ4bjLFC2GtaI_G85fjogyti9JzL0QT_0qc";
const GID = "222576120";

export async function fetchPriceList(): Promise<string[][]> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID}`;
    const res = await fetch(url, { next: { revalidate: 300 } }); // cache 5 min
    if (!res.ok) return [];
    const csv = await res.text();
    return parseCSV(csv);
  } catch {
    return [];
  }
}

function parseCSV(csv: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    if (inQuotes) {
      if (ch === '"' && csv[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(current.trim());
        current = "";
      } else if (ch === "\n" || (ch === "\r" && csv[i + 1] === "\n")) {
        row.push(current.trim());
        current = "";
        if (row.some((c) => c !== "")) rows.push(row);
        row = [];
        if (ch === "\r") i++;
      } else {
        current += ch;
      }
    }
  }
  if (current || row.length > 0) {
    row.push(current.trim());
    if (row.some((c) => c !== "")) rows.push(row);
  }
  return rows;
}
