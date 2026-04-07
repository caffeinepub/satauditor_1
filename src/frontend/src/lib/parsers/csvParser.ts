// CSV Parser for Brazilian bank statement formats

export interface ParsedTransaction {
  date: string; // ISO date string
  description: string;
  value: number; // in reais (BRL)
  type: "income" | "expense";
}

/**
 * Convert Brazilian decimal format to number
 * e.g. "1.234,56" → 1234.56  or "-1.234,56" → -1234.56
 */
function parseBrazilianDecimal(raw: string): number {
  const cleaned = raw.trim().replace(/\./g, "").replace(",", ".");
  return Number.parseFloat(cleaned);
}

/**
 * Try to parse a date string in various formats to ISO (YYYY-MM-DD)
 */
function parseDate(raw: string): string {
  const s = raw.trim();

  // DD/MM/YYYY or DD-MM-YYYY
  const brDate = s.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (brDate) {
    return `${brDate[3]}-${brDate[2]}-${brDate[1]}`;
  }

  // YYYY-MM-DD (already ISO)
  const isoDate = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDate) {
    return s;
  }

  // DD/MM/YY
  const brShort = s.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{2})$/);
  if (brShort) {
    const year =
      Number.parseInt(brShort[3], 10) > 50
        ? `19${brShort[3]}`
        : `20${brShort[3]}`;
    return `${year}-${brShort[2]}-${brShort[1]}`;
  }

  // Fallback: try native Date parse
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }

  return new Date().toISOString().slice(0, 10);
}

/**
 * Detect delimiter: semicolon (Brazilian) or comma
 */
function detectDelimiter(firstLine: string): string {
  const semicolonCount = (firstLine.match(/;/g) ?? []).length;
  const commaCount = (firstLine.match(/,/g) ?? []).length;
  return semicolonCount >= commaCount ? ";" : ",";
}

/**
 * Split a CSV line respecting quoted fields
 */
function splitLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ""));
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ""));
  return result;
}

/**
 * Try to identify column indexes from the header row
 */
interface ColumnMap {
  dateIdx: number;
  descIdx: number;
  valueIdx: number;
  typeIdx: number; // -1 if not present (derive from value sign)
}

function detectColumns(headers: string[]): ColumnMap {
  const normalized = headers.map((h) =>
    h.toLowerCase().normalize("NFD").replace(/\p{M}/gu, ""),
  );

  const dateKeywords = ["data", "date", "dt", "lancamento", "vencimento"];
  const descKeywords = [
    "descricao",
    "historico",
    "memo",
    "description",
    "lancamento",
    "complemento",
    "nome",
  ];
  const valueKeywords = [
    "valor",
    "value",
    "amount",
    "quantia",
    "debito/credito",
    "debcred",
  ];
  const typeKeywords = ["tipo", "type", "natureza", "dc", "d/c"];

  const find = (keywords: string[]) => {
    for (const kw of keywords) {
      const idx = normalized.findIndex((h) => h.includes(kw));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  return {
    dateIdx: find(dateKeywords) !== -1 ? find(dateKeywords) : 0,
    descIdx: find(descKeywords) !== -1 ? find(descKeywords) : 1,
    valueIdx: find(valueKeywords) !== -1 ? find(valueKeywords) : 2,
    typeIdx: find(typeKeywords),
  };
}

/**
 * Parse CSV content from Brazilian bank statements
 */
export function parseCSV(content: string): ParsedTransaction[] {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(lines[0]);

  // Find the header row (skip comment/metadata lines)
  let headerIdx = 0;
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const cols = splitLine(lines[i], delimiter);
    if (cols.length >= 3) {
      headerIdx = i;
      break;
    }
  }

  const headers = splitLine(lines[headerIdx], delimiter);
  const colMap = detectColumns(headers);
  const results: ParsedTransaction[] = [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = splitLine(lines[i], delimiter);
    if (cols.length < 2) continue;

    const rawDate = cols[colMap.dateIdx] ?? "";
    const rawDesc = cols[colMap.descIdx] ?? "";
    const rawValue = cols[colMap.valueIdx] ?? "";

    if (!rawDate || !rawValue) continue;

    const parsedValue = parseBrazilianDecimal(rawValue);
    if (Number.isNaN(parsedValue)) continue;

    let type: "income" | "expense";

    if (colMap.typeIdx !== -1) {
      const typeStr = (cols[colMap.typeIdx] ?? "").toLowerCase();
      type =
        typeStr.includes("c") || typeStr === "credito" || typeStr === "entrada"
          ? "income"
          : "expense";
    } else {
      type = parsedValue >= 0 ? "income" : "expense";
    }

    results.push({
      date: parseDate(rawDate),
      description: rawDesc || "Sem descrição",
      value: Math.abs(parsedValue),
      type,
    });
  }

  return results;
}
