# gon-vscode

VS Code extension for [Gon](https://github.com/daniel-juvito/gon) — consumer of **Diagnostic Protocol v1**.

The Gon compiler remains the source of truth. This extension does **not** implement a semantic Gon parser or an LSP server.

Tracks the Gon CLI, not a pinned version: it renders whatever `gon check --json`
emits under Diagnostic Protocol v1. Verified against **Gon v1.26.0**
(unchanged protocol; v1.26 binds a local by the form of its initialiser, so `x = nil` on `x := &T{}` is GN001 and `x == nil` is GW001; v1.24 reports a bare `return` in a function with a named `!T` result as GN002, v1.23 reports three more shapes as errors, GN002 for a zero-valued array of `!` elements
and for `make` of a slice of them and GN001 for `x = nil` on a named `!T` result, and v1.22 made an ordinary value
flowing into a `!T` slot GN001 where v1.21 reported the warning GW006; each renders like any other
diagnostic). Since v1.17 the single-file `gon check --json <file>`
the extension runs is exit 2 when the file's `go.mod` is found but its module
cannot be loaded (for example an invalid `go.mod`); the extension treats exit 2
as a tooling failure, keeps the file's previous diagnostics and writes Gon's
message (`gon: invalid go.mod: …`) to the Gon output channel. Since v1.20 a
single file with a malformed `//go:build` line is exit 1 with the same empty
envelope and a line on stderr (it was exit 0, and nothing on stderr); the
extension renders the envelope and does not show stderr for exit 0 or 1, so the
editor shows what it showed before. The package-mode changes of v1.15, v1.16,
v1.18 and v1.19, and the `gon build` change of v1.20, do not reach it.
Since v1.14 an importer also sees the `!` contracts written in another
package's `.gon` sources of the same module (a `.gna` for such a package is
ignored with the warning GW005); single-file checks get these contracts too.
Any newer diagnostic code appears with no extension change.

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
10. Open `fixtures/elementcontracts.gon`, save → expect 1×GN001 + 1×GN002 +
   1×GN003 (Element-Contract Construction; Gon v1.7; needs `gon` v1.7.1+).
11. Open `fixtures/generics.gon`, save → expect 1×GN002 + 1×GN001 + 2×GN003
   (Generic Semantics; Gon v1.8; needs `gon` v1.8.0+).
12. Open `fixtures/genericgna/genericgna.gon`, save → expect 3×GN001 + 2×GN002
   + 1×GN003 + 2×GW001 (Generic `.gna`; Gon v1.9; needs `gon` v1.9.0+). The
   GN003 sits on the `import` line: a `.gna` flag over a non-nilable kind.
13. Open `fixtures/methodcontracts.gon`, save → expect 2×GN001 + 1×GW001
   (a `!` on a method's parameter / result enforced at its callers, direct and
   through an interface; Gon v1.11; needs `gon` v1.11.0+).
14. Open `fixtures/returncontracts.gon`, save → expect 2×GN001 + 1×GW001 (a `!`
   contract broken inside a `return` operand; the closure that shadows the outer
   `!` parameter is clean; Gon v1.13; needs `gon` v1.13.0+).
15. Open `fixtures/sourcecontracts/sourcecontracts.gon`, save → expect 1×GW001 +
   1×GN001 + 1×GN002 for contracts declared in `fixtures/sourcecontracts/lib/lib.gon`
   (another package of the same module; Gon v1.14; needs `gon` v1.14.0+).

Configure `gon.path` if the `gon` binary is not on `PATH` (absolute path works).

## CI

`.github/workflows/ci.yml` runs the extension's tests (`npm test`) and
`scripts/check-fixtures.sh`, which runs the extension's own call
(`gon check --json <file>`) on every fixture with a pinned `gon` version
(`GON_VERSION` in the workflow) and compares the exit code, the Protocol v1
envelope and the count of each diagnostic code against
`expected-fixtures.txt`. When you add or change a fixture, update the F5 steps
above and its line in `expected-fixtures.txt`.

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
