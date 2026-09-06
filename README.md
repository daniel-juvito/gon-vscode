# gon-vscode

VS Code extension for [Gon](https://github.com/daniel-juvito/gon) — consumer of **Diagnostic Protocol v1**.

The Gon compiler remains the source of truth. This extension does **not** implement a semantic Gon parser or an LSP server.

Tracks the Gon CLI, not a pinned version: it renders whatever `gon check --json`
emits under Diagnostic Protocol v1. Verified against **Gon v1.6.0** (Type
Coverage — M1b: `!` on slice / map / chan / func / named / alias means the
reference value is non-nil; new GN002 / GN003 / GN001 cases, unchanged
protocol). Any newer diagnostic code appears with no extension change.

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

## Launch (F5)

1. Open this repo in VS Code / Cursor.
2. `npm install`
3. Press **F5** (configuration: **Run Extension**).
4. Extension Development Host opens with `fixtures/` as the workspace.
5. Open `fixtures/bad.gon`, save → expect GN001 in Problems.
6. Fix the nil assignment (or open `fixtures/ok.gon`), save → diagnostics clear for that URI.
7. Open `fixtures/iface.gon`, save → expect one GN001 (interface `!I` contract, Gon v1.4).
8. Open `fixtures/ecosystem/ecosystem.gon`, save → expect GN002 + GN001 + GW001
   (external `.gna` field contracts across the package boundary, Gon v1.5;
   needs `gon` v1.5.1+).
9. Open `fixtures/typecov.gon`, save → expect 3×GN002 + 1×GN001 (Type
   Coverage: bare `var x !S` needs an initializer; `x.(!T)` rejected;
   Gon v1.6; needs `gon` v1.6.0+).

Configure `gon.path` if the `gon` binary is not on `PATH` (absolute path works).

## Packaging

```bash
npm run package   # produces gon-0.1.2.vsix
```

Install on a clean VS Code:

```bash
code --install-extension gon-0.1.2.vsix
```

## Development

```bash
npm install
npm run compile
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

## Phase 1 RC acceptance

| # | Check |
|---|--------|
| 1 | F5 opens Extension Development Host |
| 2 | `.gon` detected as language **Gon** |
| 3 | Save produces diagnostic(s) from `gon check --json` |
| 4 | Fix + save clears diagnostic for that URI |
| 5 | `gon.path` absolute path works |
| 6 | `gon.path` = `"gon"` works via PATH |
| 7 | `npm test` GREEN |
| 8 | `.vsix` installs on clean VS Code; vertical slice still works |

Compiler, Diagnostic Protocol, checker, and formatter are **out of scope** for this RC.
