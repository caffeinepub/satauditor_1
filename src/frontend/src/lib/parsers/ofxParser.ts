// OFX/QFX Parser for Brazilian bank statement files (SGML format)

export interface ParsedTransaction {
  date: string; // ISO date string
  description: string;
  value: number; // in reais (BRL), always positive
  type: "income" | "expense";
}

/**
 * Convert OFX date format YYYYMMDD (or YYYYMMDDHHMMSS) to ISO YYYY-MM-DD
 */
function parseOFXDate(raw: string): string {
  const s = raw.trim().replace(/\[.*\]/, ""); // remove timezone annotations like [3:BRT]
  const digits = s.replace(/\D/g, "");

  if (digits.length >= 8) {
    const year = digits.slice(0, 4);
    const month = digits.slice(4, 6);
    const day = digits.slice(6, 8);
    return `${year}-${month}-${day}`;
  }

  return new Date().toISOString().slice(0, 10);
}

/**
 * Extract the value of a SGML-style OFX tag
 * e.g. <TRNAMT>-123.45 → "-123.45"
 */
function extractTag(block: string, tag: string): string {
  const regex = new RegExp(`<${tag}>([^<\\n\\r]+)`, "i");
  const match = block.match(regex);
  return match ? match[1].trim() : "";
}

/**
 * Parse OFX/QFX SGML content
 */
export function parseOFX(content: string): ParsedTransaction[] {
  // Normalize line endings
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Find all STMTTRN blocks
  const stmtPattern = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  const matches = [...normalized.matchAll(stmtPattern)];

  // Fallback: try to split by <STMTTRN> without closing tags (some banks omit them)
  if (matches.length === 0) {
    return parseSGMLOFX(normalized);
  }

  return matches
    .map((m) => parseSTMTTRN(m[1]))
    .filter((t): t is ParsedTransaction => t !== null);
}

/**
 * Parse a single STMTTRN XML block
 */
function parseSTMTTRN(block: string): ParsedTransaction | null {
  const dtPosted = extractTag(block, "DTPOSTED");
  const trnAmt = extractTag(block, "TRNAMT");
  const memo = extractTag(block, "MEMO") || extractTag(block, "NAME");
  const trnType = extractTag(block, "TRNTYPE");

  if (!dtPosted || !trnAmt) return null;

  const value = Number.parseFloat(trnAmt.replace(",", "."));
  if (Number.isNaN(value)) return null;

  let type: "income" | "expense";
  if (trnType) {
    const t = trnType.toUpperCase();
    type =
      t === "CREDIT" || t === "DEP" || t === "INT" || t === "DIV"
        ? "income"
        : "expense";
  } else {
    type = value >= 0 ? "income" : "expense";
  }

  return {
    date: parseOFXDate(dtPosted),
    description: memo || "Sem descrição",
    value: Math.abs(value),
    type,
  };
}

/**
 * Fallback parser for SGML OFX without closing tags
 * Splits content by <STMTTRN> and parses each chunk
 */
function parseSGMLOFX(content: string): ParsedTransaction[] {
  const parts = content.split(/<STMTTRN>/i).slice(1); // remove content before first STMTTRN
  const results: ParsedTransaction[] = [];

  for (const part of parts) {
    // Extract each line as tag:value
    const dtPosted = extractTag(part, "DTPOSTED");
    const trnAmt = extractTag(part, "TRNAMT");
    const memo = extractTag(part, "MEMO") || extractTag(part, "NAME");
    const trnType = extractTag(part, "TRNTYPE");

    if (!dtPosted || !trnAmt) continue;

    const value = Number.parseFloat(trnAmt.replace(",", "."));
    if (Number.isNaN(value)) continue;

    let type: "income" | "expense";
    if (trnType) {
      const t = trnType.toUpperCase();
      type =
        t === "CREDIT" || t === "DEP" || t === "INT" || t === "DIV"
          ? "income"
          : "expense";
    } else {
      type = value >= 0 ? "income" : "expense";
    }

    results.push({
      date: parseOFXDate(dtPosted),
      description: memo || "Sem descrição",
      value: Math.abs(value),
      type,
    });
  }

  return results;
}
