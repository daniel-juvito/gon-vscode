/**
 * Diagnostic Protocol v1 consumer types and validation.
 * Spec: https://github.com/daniel-juvito/gon/blob/main/docs/diagnostic-protocol-v1.md
 *
 * Gon remains the source of truth; this module only parses/adapts.
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

/**
 * Parse and validate Protocol v1 JSON from stdout.
 * Unknown / future schemaVersion is a tooling failure, not best-effort parse.
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

  return {
    ok: true,
    envelope: {
      schemaVersion: PROTOCOL_SCHEMA_VERSION,
      diagnostics: obj.diagnostics as ProtocolDiagnostic[],
    },
  };
}
