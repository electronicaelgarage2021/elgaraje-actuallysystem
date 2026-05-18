"use server";

const SHEET_ID = "1lSdnSLsJHQ4bjLFC2GtaI_G85fjogyti9JzL0QT_0qc";

const TABS = [
  "MODULOS",
  "BATERIAS",
  "MARCOS",
  "PLACAS DE CARGA",
  "FLEX MAIN",
  "PARTES CHICAS",
  "FLEX POWER/VOL",
  "HUELLAS",
  "PARLANTES",
  "CAMARAS/VIDRIOS",
  "GLASS/TAPAS",
  "ACCESORIOS",
  "HTAS-MAQ-INS",
];

export interface PriceItem {
  categoria: string;
  marca: string;
  modelo: string;
  precio: string;
}

export async function fetchPriceList(): Promise<PriceItem[]> {
  try {
    const results = await Promise.all(
      TABS.map((tab) => fetchTab(tab).catch(() => []))
    );
    return results.flat();
  } catch {
    return [];
  }
}

async function fetchTab(tabName: string): Promise<PriceItem[]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  const csv = await res.text();
  const rows = parseCSV(csv);
  return extractProducts(rows, tabName);
}

function extractProducts(rows: string[][], categoria: string): PriceItem[] {
  if (rows.length < 2) return [];

  const items: PriceItem[] = [];

  // Scan ALL rows for header rows (containing brand names followed by PRECIO)
  // A header row is one where we find a pattern like "BRAND" followed by "PRECIO"
  let currentBrands: { name: string; modelCol: number; priceCol: number }[] = [];

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];

    // Check if this row looks like a header (has cells followed by PRECIO)
    const possibleBrands: { name: string; modelCol: number; priceCol: number }[] = [];
    for (let i = 0; i < row.length - 1; i++) {
      const rawCell = row[i]?.trim() || "";
      const next = row[i + 1]?.trim().toUpperCase() || "";
      if (!rawCell || next !== "PRECIO") continue;

      // Clean cell: if it contains the merged title prefix, strip it
      // Pattern: "LISTA DE PRECIOS BYTE REPUESTOS, CONSULTAR STOCK <BRAND>"
      let brandName = rawCell.replace(/^LISTA DE PRECIOS[\s\S]*?STOCK\s+/i, "").trim();
      const upper = brandName.toUpperCase();
      if (!brandName || upper === "PRECIO" || upper === "MODELO") continue;
      // Skip if still contains LISTA DE PRECIOS (no brand at end)
      if (upper.includes("LISTA DE PRECIOS")) continue;

      possibleBrands.push({ name: brandName, modelCol: i, priceCol: i + 1 });
    }

    if (possibleBrands.length > 0) {
      // This is a new header row, update current brand mapping
      currentBrands = possibleBrands;
      continue;
    }

    // Otherwise, treat as data row using current brand mapping
    if (currentBrands.length === 0) continue;
    for (const brand of currentBrands) {
      const modelo = row[brand.modelCol]?.trim() || "";
      const precio = row[brand.priceCol]?.trim() || "";
      if (modelo && modelo.toUpperCase() !== "PRECIO" && modelo.toUpperCase() !== "MODELO") {
        items.push({ categoria, marca: brand.name, modelo, precio });
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
