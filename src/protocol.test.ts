/**
 * Strict Protocol v1 consumer tests: malformed payloads must be rejected.
 */

import * as assert from "assert";
import { parseProtocolJson } from "./protocol";

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`ok  - ${name}`);
  } catch (e) {
    console.error(`FAIL - ${name}`);
    throw e;
  }
}

const validDiag = {
  code: "GN001",
  severity: "error",
  message: "cannot assign nil",
  source: "gon-check",
  file: "/abs/path/main.gon",
  range: {
    start: { line: 2, column: 10 },
    end: { line: 2, column: 13 },
  },
};

function envelope(diagnostics: unknown[]): string {
  return JSON.stringify({ schemaVersion: 1, diagnostics });
}

test("valid empty diagnostics", () => {
  const r = parseProtocolJson(JSON.stringify({ schemaVersion: 1, diagnostics: [] }));
  assert.strictEqual(r.ok, true);
  if (r.ok) assert.strictEqual(r.envelope.diagnostics.length, 0);
});

test("valid single diagnostic", () => {
  const r = parseProtocolJson(envelope([validDiag]));
  assert.strictEqual(r.ok, true);
  if (r.ok) {
    assert.strictEqual(r.envelope.diagnostics[0].code, "GN001");
    assert.strictEqual(r.envelope.diagnostics[0].source, "gon-check");
  }
});

test("schemaVersion !== 1 rejected", () => {
  const r = parseProtocolJson(JSON.stringify({ schemaVersion: 2, diagnostics: [] }));
  assert.strictEqual(r.ok, false);
});

test("missing diagnostics array rejected", () => {
  const r = parseProtocolJson(JSON.stringify({ schemaVersion: 1 }));
  assert.strictEqual(r.ok, false);
});

test("empty stdout rejected", () => {
  const r = parseProtocolJson("   ");
  assert.strictEqual(r.ok, false);
});

test("invalid JSON rejected", () => {
  const r = parseProtocolJson("{not json");
  assert.strictEqual(r.ok, false);
});

for (const field of ["code", "severity", "message", "source", "file", "range"] as const) {
  test(`missing ${field} rejected`, () => {
    const d = { ...validDiag } as Record<string, unknown>;
    delete d[field];
    const r = parseProtocolJson(envelope([d]));
    assert.strictEqual(r.ok, false, `expected reject for missing ${field}`);
  });
}

test("invalid severity rejected", () => {
  const r = parseProtocolJson(envelope([{ ...validDiag, severity: "info" }]));
  assert.strictEqual(r.ok, false);
});

test("invalid source rejected", () => {
  const r = parseProtocolJson(envelope([{ ...validDiag, source: "eslint" }]));
  assert.strictEqual(r.ok, false);
});

test("source gon-vet accepted", () => {
  const r = parseProtocolJson(envelope([{ ...validDiag, source: "gon-vet" }]));
  assert.strictEqual(r.ok, true);
});

test("missing range.start rejected", () => {
  const r = parseProtocolJson(
    envelope([{ ...validDiag, range: { end: { line: 0, column: 1 } } }])
  );
  assert.strictEqual(r.ok, false);
});

test("missing range.end rejected", () => {
  const r = parseProtocolJson(
    envelope([{ ...validDiag, range: { start: { line: 0, column: 1 } } }])
  );
  assert.strictEqual(r.ok, false);
});

test("negative position rejected", () => {
  const r = parseProtocolJson(
    envelope([
      {
        ...validDiag,
        range: { start: { line: -1, column: 0 }, end: { line: 0, column: 1 } },
      },
    ])
  );
  assert.strictEqual(r.ok, false);
});

test("non-integer position rejected", () => {
  const r = parseProtocolJson(
    envelope([
      {
        ...validDiag,
        range: {
          start: { line: 1.5, column: 0 },
          end: { line: 1, column: 1 },
        },
      },
    ])
  );
  assert.strictEqual(r.ok, false);
});

test("relatedInformation absent is valid", () => {
  const r = parseProtocolJson(envelope([validDiag]));
  assert.strictEqual(r.ok, true);
});

test("relatedInformation valid is accepted", () => {
  const r = parseProtocolJson(
    envelope([
      {
        ...validDiag,
        relatedInformation: [
          {
            message: "contract declared here",
            location: {
              file: "/abs/path/config.gna",
              range: {
                start: { line: 4, column: 8 },
                end: { line: 4, column: 16 },
              },
            },
          },
        ],
      },
    ])
  );
  assert.strictEqual(r.ok, true);
  if (r.ok) {
    assert.strictEqual(r.envelope.diagnostics[0].relatedInformation?.length, 1);
  }
});

test("relatedInformation malformed rejected", () => {
  const r = parseProtocolJson(
    envelope([
      {
        ...validDiag,
        relatedInformation: [{ message: "x" }],
      },
    ])
  );
  assert.strictEqual(r.ok, false);
});

test("relatedInformation missing message rejected", () => {
  const r = parseProtocolJson(
    envelope([
      {
        ...validDiag,
        relatedInformation: [
          {
            location: {
              file: "/a.gna",
              range: {
                start: { line: 0, column: 0 },
                end: { line: 0, column: 1 },
              },
            },
          },
        ],
      },
    ])
  );
  assert.strictEqual(r.ok, false);
});

test("empty code rejected", () => {
  const r = parseProtocolJson(envelope([{ ...validDiag, code: "" }]));
  assert.strictEqual(r.ok, false);
});

console.log("protocol tests done");
