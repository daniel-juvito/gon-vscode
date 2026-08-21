/**
 * On-save diagnostics via `gon check --json` (Diagnostic Protocol v1).
 *
 * Lifecycle:
 *   save → generation++ → kill previous → spawn gon check --json
 *        → if generation still current → validate schema → map → collection.set(uri)
 *
 * Exit 0/1 → parse + render
 * Exit 2/3 → tooling failure (ignore stdout content)
 * Stale generation → discard
 *
 * No semantic Gon parser in TypeScript. No LSP.
 */

import * as cp from "child_process";
import * as vscode from "vscode";
import { parseProtocolJson, ProtocolDiagnostic } from "./protocol";
import { protocolPosToVsCode } from "./range";

export class GonDiagnostics implements vscode.Disposable {
  private readonly collection: vscode.DiagnosticCollection;
  private readonly output: vscode.OutputChannel;
  private readonly generations = new Map<string, number>();
  private readonly processes = new Map<string, cp.ChildProcess>();
  private readonly disposables: vscode.Disposable[] = [];

  constructor() {
    this.collection = vscode.languages.createDiagnosticCollection("gon");
    this.output = vscode.window.createOutputChannel("Gon");
    this.disposables.push(
      vscode.workspace.onDidSaveTextDocument((doc) => {
        if (doc.languageId === "gon") {
          void this.runForDocument(doc);
        }
      })
    );
  }

  /** Run check for an open document (on-save). */
  async runForDocument(doc: vscode.TextDocument): Promise<void> {
    if (doc.uri.scheme !== "file") {
      return;
    }
    const key = doc.uri.toString();
    const generation = (this.generations.get(key) ?? 0) + 1;
    this.generations.set(key, generation);

    // Kill previous process for this URI (optimization/cancellation).
    const prev = this.processes.get(key);
    if (prev && !prev.killed) {
      try {
        prev.kill();
      } catch {
        /* ignore */
      }
    }

    const gonPath =
      vscode.workspace.getConfiguration("gon").get<string>("path") || "gon";
    const filePath = doc.uri.fsPath;

    const child = cp.spawn(gonPath, ["check", "--json", filePath], {
      cwd: vscode.workspace.getWorkspaceFolder(doc.uri)?.uri.fsPath,
    });
    this.processes.set(key, child);

    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });

    const exitCode: number = await new Promise((resolve) => {
      child.on("error", (err) => {
        this.output.appendLine(`[gon] spawn error: ${err.message}`);
        resolve(2);
      });
      child.on("close", (code) => {
        resolve(code ?? 2);
      });
    });

    // Stale result: a newer save already started.
    if (this.generations.get(key) !== generation) {
      return;
    }
    this.processes.delete(key);

    // Exit 2 / 3 → tooling failure; do not depend on stdout.
    if (exitCode === 2 || exitCode === 3) {
      this.output.appendLine(
        `[gon] tooling failure for ${filePath} (exit ${exitCode})\n${stderr}`
      );
      // Leave previous diagnostics for this URI; do not clear blindly.
      return;
    }

    // Exit 0 / 1 → parse + render.
    if (exitCode !== 0 && exitCode !== 1) {
      this.output.appendLine(
        `[gon] unexpected exit ${exitCode} for ${filePath}\n${stderr}`
      );
      return;
    }

    const parsed = parseProtocolJson(stdout);
    if (!parsed.ok) {
      this.output.appendLine(
        `[gon] protocol error for ${filePath}: ${parsed.reason}\nstdout:\n${stdout}`
      );
      return;
    }

    const diags = this.mapDiagnostics(doc, parsed.envelope.diagnostics);
    // Per-URI set — never global clear on save.
    this.collection.set(doc.uri, diags);
  }

  private mapDiagnostics(
    doc: vscode.TextDocument,
    items: ProtocolDiagnostic[]
  ): vscode.Diagnostic[] {
    const getLineText = (line: number): string => {
      if (line < 0 || line >= doc.lineCount) {
        return "";
      }
      return doc.lineAt(line).text;
    };

    const out: vscode.Diagnostic[] = [];
    for (const item of items) {
      if (!item || typeof item.message !== "string") {
        continue;
      }
      const start = protocolPosToVsCode(
        item.range?.start ?? { line: 0, column: 0 },
        getLineText
      );
      const end = protocolPosToVsCode(
        item.range?.end ?? item.range?.start ?? { line: 0, column: 0 },
        getLineText
      );

      const severity =
        item.severity === "warning"
          ? vscode.DiagnosticSeverity.Warning
          : vscode.DiagnosticSeverity.Error;

      const diag = new vscode.Diagnostic(
        new vscode.Range(start.line, start.character, end.line, end.character),
        item.message,
        severity
      );
      diag.source = item.source || "gon-check";
      diag.code = item.code;

      if (item.relatedInformation && item.relatedInformation.length > 0) {
        diag.relatedInformation = item.relatedInformation.map((ri) => {
          const rs = protocolPosToVsCode(
            ri.location?.range?.start ?? { line: 0, column: 0 },
            getLineText
          );
          const re = protocolPosToVsCode(
            ri.location?.range?.end ??
              ri.location?.range?.start ?? { line: 0, column: 0 },
            getLineText
          );
          const relatedUri =
            ri.location?.file && ri.location.file !== doc.uri.fsPath
              ? vscode.Uri.file(ri.location.file)
              : doc.uri;
          return new vscode.DiagnosticRelatedInformation(
            new vscode.Location(
              relatedUri,
              new vscode.Range(rs.line, rs.character, re.line, re.character)
            ),
            ri.message
          );
        });
      }

      out.push(diag);
    }
    return out;
  }

  dispose(): void {
    for (const child of this.processes.values()) {
      try {
        if (!child.killed) {
          child.kill();
        }
      } catch {
        /* ignore */
      }
    }
    this.processes.clear();
    this.generations.clear();
    this.collection.dispose();
    this.output.dispose();
    for (const d of this.disposables) {
      d.dispose();
    }
  }
}
