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
  const tabUpper = categoria.toUpperCase();

  // Scan ALL rows for header rows (containing brand names followed by PRECIO)
  let currentBrands: { name: string; modelCol: number; priceCol: number }[] = [];

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];

    // Check if this row looks like a header (has cells followed by a price column)
    const possibleBrands: { name: string; modelCol: number; priceCol: number }[] = [];
    for (let i = 0; i < row.length - 1; i++) {
      const rawCell = row[i]?.trim() || "";
      const next = row[i + 1]?.trim().toUpperCase() || "";
      if (!rawCell) continue;
      // Accept "PRECIO", "PRECIO MAYORISTA", "PRECIO PVP", "MAYORISTA", "PVP", etc.
      const isPriceCol = next === "PRECIO" || next.startsWith("PRECIO ") || next === "MAYORISTA" || next === "PVP";
      if (!isPriceCol) continue;

      // Clean cell: strip the title prefix and category name if present
      // Patterns:
      //  "LISTA DE PRECIOS BYTE REPUESTOS, CONSULTAR STOCK SAMSUNG"
      //  "LISTA DE PRECIOS (CONSULTAR STOCK)                         MARCOS SAMSUNG"
      let brandName = rawCell.replace(/^LISTA DE PRECIOS.*?STOCK[)\s]+/i, "").trim();
      // Strip category prefix (e.g. "MARCOS SAMSUNG" -> "SAMSUNG")
      if (brandName.toUpperCase().startsWith(tabUpper + " ")) {
        brandName = brandName.slice(tabUpper.length).trim();
      }
      const upper = brandName.toUpperCase();
      if (!brandName) continue;
      if (upper === "PRECIO" || upper === "MODELO" || upper === "MAYORISTA" || upper === "PVP") continue;
      if (upper.startsWith("PRECIO ")) continue;
      // Skip if still contains LISTA DE PRECIOS (no brand at end)
      if (upper.includes("LISTA DE PRECIOS")) continue;

      possibleBrands.push({ name: brandName, modelCol: i, priceCol: i + 1 });
    }

    if (possibleBrands.length > 0) {
      // Merge new headers into current mapping: replace by column, keep others
      const updatedBrands = [...currentBrands];
      for (const nb of possibleBrands) {
        const idx = updatedBrands.findIndex((b) => b.modelCol === nb.modelCol);
        if (idx >= 0) updatedBrands[idx] = nb;
        else updatedBrands.push(nb);
      }
      currentBrands = updatedBrands;
      continue;
    }

    // Otherwise, treat as data row using current brand mapping
    if (currentBrands.length === 0) continue;
    for (const brand of currentBrands) {
      const modelo = row[brand.modelCol]?.trim() || "";
      let precio = row[brand.priceCol]?.trim() || "";
      // If price column has non-numeric value (e.g. "MARCO" type label),
      // scan next 2 columns to find a numeric price
      if (precio && !/\d/.test(precio)) {
        for (let offset = 1; offset <= 2; offset++) {
          const alt = row[brand.priceCol + offset]?.trim() || "";
          if (/\d/.test(alt)) { precio = alt; break; }
        }
      }
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
