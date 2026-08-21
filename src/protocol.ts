/**
 * Diagnostic Protocol v1 consumer types and validation.
 * Spec: https://github.com/daniel-juvito/gon/blob/main/docs/diagnostic-protocol-v1.md
 *
 * Gon remains the source of truth; this module only parses/adapts.
 * Malformed payloads are rejected entirely — no best-effort repair.
 */

export const PROTOCOL_SCHEMA_VERSION = 1;

export interface ProtocolPos {
  line: number;
  column: number;
}

export interface ProtocolRange {
  start: ProtocolPos;
  end: ProtocolPos;
}

export interface ProtocolLocation {
  file: string;
  range: ProtocolRange;
}

export interface ProtocolRelated {
  message: string;
  location: ProtocolLocation;
}

export interface ProtocolDiagnostic {
  code: string;
  severity: "error" | "warning";
  message: string;
  source: string;
  file: string;
  range: ProtocolRange;
  relatedInformation?: ProtocolRelated[];
}

export interface ProtocolEnvelope {
  schemaVersion: number;
  diagnostics: ProtocolDiagnostic[];
}

export type ParseResult =
  | { ok: true; envelope: ProtocolEnvelope }
  | { ok: false; reason: string };

function isNonNegInt(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= 0 && Number.isFinite(n);
}

function validatePos(pos: unknown, path: string): string | null {
  if (typeof pos !== "object" || pos === null || Array.isArray(pos)) {
    return `${path}: must be an object`;
  }
  const o = pos as Record<string, unknown>;
  if (!isNonNegInt(o.line)) {
    return `${path}.line: must be a non-negative integer`;
  }
  if (!isNonNegInt(o.column)) {
    return `${path}.column: must be a non-negative integer`;
  }
  return null;
}

function validateRange(range: unknown, path: string): string | null {
  if (typeof range !== "object" || range === null || Array.isArray(range)) {
    return `${path}: must be an object`;
  }
  const o = range as Record<string, unknown>;
  if (!("start" in o)) {
    return `${path}.start: required`;
  }
  if (!("end" in o)) {
    return `${path}.end: required`;
  }
  const s = validatePos(o.start, `${path}.start`);
  if (s) return s;
  const e = validatePos(o.end, `${path}.end`);
  if (e) return e;
  return null;
}

function validateLocation(loc: unknown, path: string): string | null {
  if (typeof loc !== "object" || loc === null || Array.isArray(loc)) {
    return `${path}: must be an object`;
  }
  const o = loc as Record<string, unknown>;
  if (typeof o.file !== "string" || o.file.length === 0) {
    return `${path}.file: required non-empty string`;
  }
  if (!("range" in o)) {
    return `${path}.range: required`;
  }
  return validateRange(o.range, `${path}.range`);
}

function validateRelated(ri: unknown, path: string): string | null {
  if (typeof ri !== "object" || ri === null || Array.isArray(ri)) {
    return `${path}: must be an object`;
  }
  const o = ri as Record<string, unknown>;
  if (typeof o.message !== "string" || o.message.length === 0) {
    return `${path}.message: required non-empty string`;
  }
  if (!("location" in o)) {
    return `${path}.location: required`;
  }
  return validateLocation(o.location, `${path}.location`);
}

function validateDiagnostic(d: unknown, index: number): string | null {
  const path = `diagnostics[${index}]`;
  if (typeof d !== "object" || d === null || Array.isArray(d)) {
    return `${path}: must be an object`;
  }
  const o = d as Record<string, unknown>;

  if (typeof o.code !== "string" || o.code.length === 0) {
    return `${path}.code: required non-empty string`;
  }
  if (o.severity !== "error" && o.severity !== "warning") {
    return `${path}.severity: must be "error" or "warning"`;
  }
  if (typeof o.message !== "string" || o.message.length === 0) {
    return `${path}.message: required non-empty string`;
  }
  if (o.source !== "gon-check" && o.source !== "gon-vet") {
    return `${path}.source: must be "gon-check" or "gon-vet"`;
  }
  if (typeof o.file !== "string" || o.file.length === 0) {
    return `${path}.file: required non-empty string`;
  }
  if (!("range" in o)) {
    return `${path}.range: required`;
  }
  const rangeErr = validateRange(o.range, `${path}.range`);
  if (rangeErr) return rangeErr;

  if ("relatedInformation" in o && o.relatedInformation !== undefined) {
    if (!Array.isArray(o.relatedInformation)) {
      return `${path}.relatedInformation: must be an array when present`;
    }
    for (let i = 0; i < o.relatedInformation.length; i++) {
      const riErr = validateRelated(
        o.relatedInformation[i],
        `${path}.relatedInformation[${i}]`
      );
      if (riErr) return riErr;
    }
  }

  return null;
}

/**
 * Parse and validate Protocol v1 JSON from stdout.
 * Unknown schemaVersion or any malformed diagnostic → tooling failure.
 * No best-effort repair of missing fields.
 */
export function parseProtocolJson(stdout: string): ParseResult {
  const trimmed = stdout.trim();
  if (!trimmed) {
    return { ok: false, reason: "empty stdout (expected Protocol v1 JSON)" };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(trimmed);
  } catch (e) {
    return {
      ok: false,
      reason: `invalid JSON: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return { ok: false, reason: "envelope must be a JSON object" };
  }

  const obj = payload as Record<string, unknown>;

  if (obj.schemaVersion !== PROTOCOL_SCHEMA_VERSION) {
    return {
      ok: false,
      reason: `unsupported schemaVersion: ${JSON.stringify(obj.schemaVersion)} (want ${PROTOCOL_SCHEMA_VERSION})`,
    };
  }

  if (!Array.isArray(obj.diagnostics)) {
    return { ok: false, reason: "diagnostics must be an array" };
  }

  for (let i = 0; i < obj.diagnostics.length; i++) {
    const err = validateDiagnostic(obj.diagnostics[i], i);
    if (err) {
      return { ok: false, reason: err };
    }
  }

  return {
    ok: true,
    envelope: {
      schemaVersion: PROTOCOL_SCHEMA_VERSION,
      diagnostics: obj.diagnostics as ProtocolDiagnostic[],
    },
  };
}
