/**
 * Unit tests for UTF-8 byte offset → UTF-16 code unit conversion.
 */

import * as assert from "assert";
import { utf8ByteOffsetToUtf16, protocolPosToVsCode } from "./range";

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`ok  - ${name}`);
  } catch (e) {
    console.error(`FAIL - ${name}`);
    throw e;
  }
}

test("ASCII identity", () => {
  const line = "hello world";
  assert.strictEqual(utf8ByteOffsetToUtf16(line, 0), 0);
  assert.strictEqual(utf8ByteOffsetToUtf16(line, 6), 6);
  assert.strictEqual(utf8ByteOffsetToUtf16(line, line.length), line.length);
});

test("é (2-byte UTF-8) before token", () => {
  const line = "xéy";
  assert.strictEqual(Buffer.from(line, "utf8").length, 4);
  assert.strictEqual(utf8ByteOffsetToUtf16(line, 0), 0);
  assert.strictEqual(utf8ByteOffsetToUtf16(line, 1), 1);
  assert.strictEqual(utf8ByteOffsetToUtf16(line, 3), 2);
});

test("😀 (4-byte UTF-8 / surrogate pair)", () => {
  const line = "😀abc";
  assert.strictEqual(Buffer.from(line, "utf8")[0], 0xf0);
  assert.strictEqual(utf8ByteOffsetToUtf16(line, 0), 0);
  assert.strictEqual(utf8ByteOffsetToUtf16(line, 4), 2);
  assert.strictEqual(utf8ByteOffsetToUtf16(line, 5), 3);
});

test("Gon-like: emoji in string then identifier", () => {
  const line = 'msg := "😀"; x = nil';
  const nilByte = Buffer.from(line, "utf8").indexOf(Buffer.from("nil", "utf8"));
  assert.ok(nilByte > 0);
  const utf16 = utf8ByteOffsetToUtf16(line, nilByte);
  assert.notStrictEqual(utf16, nilByte);
  assert.strictEqual(line[utf16], "n");
});

test("protocolPosToVsCode uses line text", () => {
  const lines = ["ascii", "😀abc"];
  const pos = protocolPosToVsCode(
    { line: 1, column: 4 },
    (n) => lines[n] ?? ""
  );
  assert.strictEqual(pos.line, 1);
  assert.strictEqual(pos.character, 2);
});

test("past end of line clamps to length", () => {
  assert.strictEqual(utf8ByteOffsetToUtf16("ab", 99), 2);
});

console.log("range tests done");
