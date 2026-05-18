"use server";

const SHEET_ID = "1lSdnSLsJHQ4bjLFC2GtaI_G85fjogyti9JzL0QT_0qc";
const GID = "222576120";

export interface PriceItem {
  marca: string;
  modelo: string;
  precio: string;
}

export async function fetchPriceList(): Promise<PriceItem[]> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const csv = await res.text();
    const rows = parseCSV(csv);
    return extractProducts(rows);
  } catch {
    return [];
  }
}

function extractProducts(rows: string[][]): PriceItem[] {
  if (rows.length < 2) return [];

  // Header row has brand names in pattern: "", "BRAND", "PRECIO", "", "BRAND", "PRECIO", ...
  const header = rows[0];
  const brands: { name: string; modelCol: number; priceCol: number }[] = [];

  for (let i = 0; i < header.length; i++) {
    const cell = header[i].trim().toUpperCase();
    if (cell && cell !== "PRECIO" && !cell.startsWith("LISTA DE PRECIOS")) {
      // This is a brand name, next col should be price
      brands.push({ name: cell.trim(), modelCol: i, priceCol: i + 1 });
    }
  }

  // If first brand detection failed, try alternate pattern
  if (brands.length === 0) {
    // Fallback: every 3 columns starting at 1
    for (let i = 1; i < header.length; i += 3) {
      const name = header[i]?.trim();
      if (name && name.toUpperCase() !== "PRECIO") {
        brands.push({ name, modelCol: i, priceCol: i + 1 });
      }
    }
  }

  const items: PriceItem[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    for (const brand of brands) {
      const modelo = row[brand.modelCol]?.trim() || "";
      const precio = row[brand.priceCol]?.trim() || "";
      if (modelo && modelo.toUpperCase() !== "PRECIO") {
        items.push({ marca: brand.name, modelo, precio });
      }
    }
  }

  return items;
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
        row.push(current);
        current = "";
      } else if (ch === "\n" || (ch === "\r" && csv[i + 1] === "\n")) {
        row.push(current);
        if (row.some((c) => c.trim() !== "")) rows.push(row);
        row = [];
        current = "";
        if (ch === "\r") i++;
      } else {
        current += ch;
      }
    }
  }
  if (current || row.length > 0) {
    row.push(current);
    if (row.some((c) => c.trim() !== "")) rows.push(row);
  }
  return rows;
}
