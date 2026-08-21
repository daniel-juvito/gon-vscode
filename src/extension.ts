import * as vscode from "vscode";
import { GonDiagnostics } from "./diagnostics";

let diagnostics: GonDiagnostics | undefined;

export function activate(context: vscode.ExtensionContext): void {
  diagnostics = new GonDiagnostics();
  context.subscriptions.push(diagnostics);
}

export function deactivate(): void {
  diagnostics?.dispose();
  diagnostics = undefined;
}
