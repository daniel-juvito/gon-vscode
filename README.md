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
- Exit 2/3 → tooling failure (stdout ignored); **preserve** previous diagnostics for that URI and report failure on the Gon output channel
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
npm test   # compile + range + strict protocol unit tests
```

Press F5 in VS Code to launch the Extension Development Host.

## Extension contract (Phase 1)

| Event | Behavior |
|-------|----------|
| Save `.gon` file | `generation++`, kill previous `gon check`, spawn `gon check --json` |
| Stale generation finishes | Result discarded |
| Exit 0 or 1 | Require `schemaVersion === 1` and full Diagnostic shape; map to Problems |
| Exit 2 or 3 | **Preserve** most recent diagnostics for that URI; log tooling failure |
| Malformed protocol JSON | Tooling failure — no diagnostic rendering from that payload |
| Deactivate / dispose | Kill active children; dispose collection + output channel |

## Protocol

See [diagnostic-protocol-v1.md](https://github.com/daniel-juvito/gon/blob/main/docs/diagnostic-protocol-v1.md).
