# gon-vscode

VS Code extension for [Gon](https://github.com/daniel-juvito/gon) — consumer of **Diagnostic Protocol v1**.

The Gon compiler remains the source of truth. This extension does **not** implement a semantic Gon parser or an LSP server.

## Phase 1 scope

- Register `.gon` language + TextMate syntax highlighting
- On-save diagnostics via `gon check --json`
- Problems panel via `DiagnosticCollection` (per-URI `set`, never global clear)
- UTF-8 byte offset → UTF-16 code unit range mapping
- Generation counter + process kill on re-save; stale results discarded
- Exit 0/1 → parse envelope (`schemaVersion === 1`) and render
- Exit 2/3 → tooling failure (stdout ignored)
- `deactivate` / `dispose` kills active children and disposes collection + output channel

Out of scope: on-type checking, formatter (`gon fmt`), full LSP (`gonls`).

## Requirements

- [Gon](https://github.com/daniel-juvito/gon) CLI with `gon check --json` (Diagnostic Protocol v1)
- Configure `gon.path` if `gon` is not on `PATH`

## Development

```bash
npm install
npm run compile
# range unit tests (no VS Code host):
node out/runRangeTests.js
```

Press F5 in VS Code to launch the Extension Development Host.

## Protocol

See [diagnostic-protocol-v1.md](https://github.com/daniel-juvito/gon/blob/main/docs/diagnostic-protocol-v1.md).
