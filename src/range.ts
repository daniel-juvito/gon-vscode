/**
 * Convert Diagnostic Protocol v1 positions (zero-based UTF-8 byte offsets)
 * to VS Code positions (zero-based UTF-16 code units).
 *
 * Protocol never uses UTF-16 or rune counts; the extension is responsible
 * for the conversion (docs/diagnostic-protocol-v1.md §4).
 */

export interface ProtocolPos {
  line: number;
  column: number; // UTF-8 byte offset within the line
}

export interface VsCodePos {
  line: number;
  character: number; // UTF-16 code unit offset within the line
}

/**
 * Map a single protocol column (UTF-8 bytes into `lineText`) to a UTF-16
 * code-unit index suitable for vscode.Position.
 *
 * If `byteCol` is past the end of the line, returns the line length in UTF-16 units.
 */
export function utf8ByteOffsetToUtf16(
  lineText: string,
  byteCol: number
): number {
  if (byteCol <= 0) {
    return 0;
  }
  const buf = Buffer.from(lineText, "utf8");
  if (byteCol >= buf.length) {
    return lineText.length;
  }
  const prefix = buf.subarray(0, byteCol).toString("utf8");
  return prefix.length;
}

/**
 * Convert a protocol (line, column) using the document's line text.
 * `getLineText(line)` must return the full text of that 0-based line
 * without the trailing newline.
 */
export function protocolPosToVsCode(
  pos: ProtocolPos,
  getLineText: (line: number) => string
): VsCodePos {
  let lineText = "";
  try {
    lineText = getLineText(pos.line);
  } catch {
    lineText = "";
  }
  return {
    line: pos.line,
    character: utf8ByteOffsetToUtf16(lineText, pos.column),
  };
}
