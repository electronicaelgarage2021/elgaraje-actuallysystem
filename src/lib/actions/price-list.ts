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

export async function searchPriceList(query: string): Promise<PriceItem[]> {
  const all = await fetchPriceList();
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const matches = all.filter(
    (item) =>
      item.modelo.toLowerCase().includes(q) ||
      item.marca.toLowerCase().includes(q) ||
      item.categoria.toLowerCase().includes(q)
  );
  return matches.slice(0, 20);
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

function isPriceWord(s: string): boolean {
  const u = s.trim().toUpperCase();
  return u === "PRECIO" || u.startsWith("PRECIO ") || u === "MAYORISTA" || u === "PVP";
}

function looksLikePrice(s: string): boolean {
  const cleaned = s.replace(/[$.\s]/g, "");
  return /^\d+$/.test(cleaned);
}

function isHeaderKeyword(upper: string): boolean {
  return upper === "PRECIO" || upper === "MAYORISTA" || upper === "PVP"
    || upper.startsWith("PRECIO ") || upper.includes("LISTA DE PRECIOS");
}

function cleanBrand(rawCell: string, tabUpper: string): string {
  let brandName = rawCell.replace(/^LISTA DE PRECIOS.*?STOCK[)\s]+/i, "").trim();
  if (brandName.toUpperCase().startsWith(tabUpper + " ")) {
    brandName = brandName.slice(tabUpper.length).trim();
  }
  return brandName;
}

function extractProducts(rows: string[][], categoria: string): PriceItem[] {
  if (rows.length < 2) return [];

  const items: PriceItem[] = [];
  const tabUpper = categoria.toUpperCase();

  let currentBrands: { name: string; modelCol: number; priceCol: number }[] = [];

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];

    // PASS 1: explicit header with PRECIO at +1 or +2
    const possibleBrands: { name: string; modelCol: number; priceCol: number }[] = [];
    for (let i = 0; i < row.length - 1; i++) {
      const rawCell = row[i]?.trim() || "";
      if (!rawCell) continue;
      const upper = rawCell.toUpperCase();

      const next1 = row[i + 1]?.trim() || "";
      const next2 = row[i + 2]?.trim() || "";

      // "MODELO" headers: peek at next row for brand name
      if (upper === "MODELO" && isPriceWord(next1)) {
        const nextRow = rows[r + 1];
        if (nextRow) {
          const brandBelow = nextRow[i]?.trim() || "";
          const brandUpper = brandBelow.toUpperCase();
          if (brandBelow && !isHeaderKeyword(brandUpper) && brandUpper !== "MODELO" && !/\d/.test(brandBelow)) {
            possibleBrands.push({ name: brandBelow, modelCol: i, priceCol: i + 1 });
          }
        }
        continue;
      }

      // Headers ending in "MODELO" (e.g. "FPC MODELO", "BANDEJA SIM MODELO"):
      // scan up to +5 for PRECIO since there may be extra columns (PINES, TIPO, etc.)
      if (upper.endsWith(" MODELO") || upper.endsWith(" MODELO ")) {
        let foundPrecio = false;
        for (let off = 1; off <= 5; off++) {
          if (isPriceWord(row[i + off]?.trim() || "")) { foundPrecio = true; break; }
        }
        if (foundPrecio) {
          const cleanedName = cleanBrand(rawCell, tabUpper).replace(/\s+MODELO$/i, "").trim();
          if (cleanedName && !isHeaderKeyword(cleanedName.toUpperCase())) {
            possibleBrands.push({ name: cleanedName, modelCol: i, priceCol: i + 1 });
          }
        }
        continue;
      }

      // Standard: PRECIO at +1, or +2 if +1 is empty
      let hasPriceHeader = false;
      if (isPriceWord(next1)) hasPriceHeader = true;
      else if (!next1 && next2 && isPriceWord(next2)) hasPriceHeader = true;
      if (!hasPriceHeader) continue;

      const brandName = cleanBrand(rawCell, tabUpper);
      const brandUpper = brandName.toUpperCase();
      if (!brandName) continue;
      if (isHeaderKeyword(brandUpper) || brandUpper === "MODELO") continue;

      possibleBrands.push({ name: brandName, modelCol: i, priceCol: i + 1 });
    }

    // PASS 2: brand-only sub-headers (no PRECIO label, no digits)
    if (possibleBrands.length === 0 && currentBrands.length > 0) {
      const digitCellCount = row.filter((c) => /\d/.test(c?.trim() || "")).length;
      if (digitCellCount === 0) {
        const textCells: { name: string; col: number }[] = [];
        for (let i = 0; i < row.length; i++) {
          const rawCell = row[i]?.trim() || "";
          if (!rawCell) continue;
          const upper = rawCell.toUpperCase();
          if (isHeaderKeyword(upper) || upper === "MODELO") continue;
          textCells.push({ name: cleanBrand(rawCell, tabUpper), col: i });
        }
        if (textCells.length >= 3) {
          const knownCols = new Set(currentBrands.map((b) => b.modelCol));
          const matchingExisting = textCells.filter((t) => knownCols.has(t.col)).length;
          const spacings = textCells.slice(1).map((t, idx) => t.col - textCells[idx].col);
          const consistentSpacing = spacings.length > 0 && spacings.every((s) => s === spacings[0] && (s === 3 || s === 4));
          if (matchingExisting >= 2 || consistentSpacing) {
            for (const tc of textCells) {
              possibleBrands.push({ name: tc.name, modelCol: tc.col, priceCol: tc.col + 1 });
            }
          }
        }
      }
    }

    if (possibleBrands.length > 0) {
      const updatedBrands = [...currentBrands];
      for (const nb of possibleBrands) {
        const idx = updatedBrands.findIndex((b) => b.modelCol === nb.modelCol);
        if (idx >= 0) updatedBrands[idx] = nb;
        else updatedBrands.push(nb);
      }
      currentBrands = updatedBrands;
      continue;
    }

    // Data row: extract products using current brand mapping
    if (currentBrands.length === 0) continue;
    for (const brand of currentBrands) {
      const modelo = row[brand.modelCol]?.trim() || "";
      if (!modelo) continue;
      const modeloUpper = modelo.toUpperCase();
      if (modeloUpper === "PRECIO" || modeloUpper === "MODELO" || isPriceWord(modelo)) continue;

      // Find price: scan from priceCol up to +3 cols for a numeric value
      let precio = "";
      for (let off = 0; off <= 3; off++) {
        const candidate = row[brand.priceCol + off]?.trim() || "";
        if (candidate && looksLikePrice(candidate)) { precio = candidate; break; }
      }

      // Skip sub-section headers: pure text (no digits) AND no price
      if (!precio && !/\d/.test(modelo)) continue;
      items.push({ categoria, marca: brand.name, modelo, precio });
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
