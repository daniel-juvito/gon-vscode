# Changelog

## [0.1.19]

- Verified against **Gon v1.23.0**. The protocol is unchanged; v1.23 adds three errors for shapes that were accepted before: GN002 for a zero-valued array of `!` elements (`var a [3]!*T`,
  `new([3]!*T)`, a named array type, a struct field of one) and for `make` of a slice of `!` elements with a length other than the constant 0, and GN001 for `x = nil` or an ordinary value assigned
  to a named `!T` result. The extension renders any code with its severity, so **no code change**: such a diagnostic appears as an error in the Problems panel.
- The eleven fixtures give the same result under v1.23.0 as under v1.22.0 (`scripts/check-fixtures.sh`, 0 FAIL): none declares one of the new shapes, so `expected-fixtures.txt` is unchanged.
  `npm test` passes.
- CI pinned to Gon v1.23.0; README verified-against note bumped.

## [0.1.18]

- Verified against **Gon v1.22.0**. The protocol is unchanged; v1.22 makes an ordinary
  value of a pointer, slice, map, channel or function kind that flows into a `!T` slot
  **GN001, an error** (exit 1), where v1.21 reported it as the warning GW006. The
  extension renders any code with its severity, so **no code change**: such a diagnostic
  now appears as an error in the Problems panel instead of a warning.
- The eleven fixtures give the same exit codes under v1.22.0 as under v1.21.0; only
  `fixtures/genericgna` changes, and only its two GW006 become two more GN001
  (`GN001=5` in place of `GN001=3 ... GW006=2`); `expected-fixtures.txt` records it.
  `npm test` passes.
- CI pinned to Gon v1.22.0; README verified-against note bumped.

## [0.1.17]

- Verified against **Gon v1.21.0**. The protocol is unchanged; v1.21 adds the
  warning **GW006** (an ordinary value flowing into a `!T` slot of a pointer,
  slice, map, channel or function type) and the explicit conversion `(!T)(x)`.
  A warning alone is exit 0 and the extension renders it like any other
  diagnostic, so **no code change**.
- The eleven fixtures give the same result under v1.21.0 as under v1.20.0 except
  `fixtures/genericgna`, which now also reports GW006 twice (two ordinary `*cache.Logger`
  values flowing into `!*cache.Logger` fields, at lines 23 and 24); `expected-fixtures.txt`
  records it. The exit code of every fixture is unchanged. `npm test` passes.
- CI pinned to Gon v1.21.0; README verified-against note bumped.

## [0.1.16]

- Verified against **Gon v1.20.0**. Two exit codes change, and one of them is
  reached by the single-file `gon check --json <file>` the extension runs: a
  file with a malformed `//go:build` line is **exit 1** (the envelope is still
  empty, plus one line on stderr), where it was exit 0 under v1.19.0. The other
  change, `gon build <dir>` refusing before it transpiles when `go build` has no
  module for the operand (exit 2, it was exit 1), is not a command the
  extension runs. **No code change.**
- Measured with a module and a file whose `//go:build` line has an unclosed
  parenthesis: v1.19.0 gives exit 0 and `{"schemaVersion":1,"diagnostics":[]}`;
  v1.20.0 gives exit 1, the same envelope, and `gon: invalid build constraint
  in a.gon: parsing //go:build line: missing close paren` on stderr. The
  extension handles exit 0 and 1 the same way (it renders the envelope and does
  not log stderr), so **the editor shows nothing for such a file, before and
  after**. Protocol v1 has no Diagnostic for it (no code and no range: go/build
  gives no position), so showing it would be a Gon decision and a protocol
  change, not a change here. This supersedes the note of 0.1.15 about exit 0,
  which stays true for v1.19.0.
- The eleven fixtures give the same result under v1.20.0 as under v1.19.0
  (`scripts/check-fixtures.sh`, identical output); `expected-fixtures.txt` is
  unchanged. `npm test` passes.
- CI pinned to Gon v1.20.0; README verified-against note bumped.

## [0.1.15]

- Verified against **Gon v1.19.0**. Its changes are in package mode only: a
  `.gon` with a malformed `//go:build` line is a source error of its package
  (exit 1, the other files still checked; it was exit 2), and a file name the
  go tool ignores (`_x.gon`) no longer fails its package. The extension runs
  single-file `gon check --json <file>`, so none of this reaches it. **No code
  change.**
- Measured: a single file with a malformed `//go:build` line is exit 0 with an
  empty envelope under v1.18.0 and under v1.19.0 (Gon's file mode does not
  report it; a Gon-side matter, not changed here).
- The eleven fixtures give the same result under v1.19.0 as under v1.16.0
  (`scripts/check-fixtures.sh`, identical output); `expected-fixtures.txt` is
  unchanged. `npm test` passes.
- CI pinned to Gon v1.19.0; README verified-against note bumped.

## [0.1.14]

- Verified against **Gon v1.18.0** (CI pin straight from v1.16.0).
- **Gon v1.17 changes what the extension sees for one case.** When a `.gon`
  file's `go.mod` is found but its module cannot be loaded (an invalid
  `go.mod`, a broken `go.work`, no `go` command, …), `gon check --json <file>`
  is now exit 2 with no JSON, where Gon v1.16 fell back silently and returned
  diagnostics (exit 0 or 1). Measured with an invalid `go.mod` and a GN001
  file: v1.16.0 exit 1 with the GN001; v1.18.0 exit 2, `gon: invalid go.mod:
  go.mod:1: unknown directive: garbage`. The extension already treats exit 2
  as a tooling failure: it keeps the file's previous diagnostics and writes
  the message to the Gon output channel (`src/diagnostics.ts`). **No code
  change.**
- Gon v1.18's package-mode change (a multi-file package outside a module) does
  not reach the single-file check.
- The eleven fixtures give the same result under v1.18.0 as under v1.16.0
  (`scripts/check-fixtures.sh`, identical output); `expected-fixtures.txt` is
  unchanged. `npm test` passes.

## [0.1.13]

- Verified against **Gon v1.16.0**. Its changes are in package mode: the go
  command decides which `.gon` files belong to a package (an excluded `.gon`
  is not checked), and `./...` stops at nested modules. The extension runs
  single-file `gon check --json <file>`, which these do not touch. **No code
  change.**
- The eleven fixtures give the same result under v1.16.0 as under v1.15.0
  (`scripts/check-fixtures.sh`, identical output); `expected-fixtures.txt` is
  unchanged.
- CI pinned to Gon v1.16.0; README: verified-against note bumped to v1.16.0.

## [0.1.12]

- Verified against **Gon v1.15.0**. Its changes are in package mode (a
  directory or `./...` operand): a package that cannot be loaded (no `go`
  command, an invalid `go.mod`, a `.gon` file excluded by build constraints)
  is exit 2 instead of 1, and an invalid `package` clause is a parse error
  with an envelope. The extension runs single-file `gon check --json <file>`,
  so none of this reaches it; it already treats exit 2 as a tooling failure
  and keeps the previous diagnostics. **No code change.**
- The eleven fixtures give the same result under v1.15.0 as under v1.14.0
  (`scripts/check-fixtures.sh`, identical output); `expected-fixtures.txt` is
  unchanged.
- CI pinned to Gon v1.15.0; README: verified-against note bumped to v1.15.0.

## [0.1.11]

- Verified against **Gon v1.14.0**: an importer sees the `!` contracts written
  in another package's `.gon` sources of the same module (no `.gna` needed), and
  a `.gna` for such a package is ignored with the new warning **GW005**. The
  extension's single-file `gon check --json <file>` gets them too, and
  Diagnostic Protocol v1 is unchanged, so this renders with **no code change**
  (GW005 is a warning like any other).
- Added `fixtures/sourcecontracts/` (a module with `lib/lib.gon`, its
  transpiled `lib/lib.go`, and `sourcecontracts.gon` importing it): 1×GW001 +
  1×GN001 + 1×GN002 under v1.14, empty under v1.13. Needs Gon **v1.14.0+**.
- CI pinned to Gon v1.14.0; the other ten fixtures are unchanged under v1.14.
- README: verified-against note bumped to v1.14.0.

## [0.1.10]

- Verified against **Gon v1.13.0**: the operands of a `return` are checked like
  any other expression (**GN001** / **GN002** / **GW001**), and a function
  literal is checked as a function (its own parameters and result contract; a
  closure parameter that shadows an outer `!` parameter is no longer a false
  GW001). Diagnostic Protocol v1 is unchanged, so these render with **no code
  change**.
- Added `fixtures/returncontracts.gon` (2×GN001, 1×GW001; clean under v1.12) for
  the F5 Extension Development Host and for CI. Needs Gon **v1.13.0+**.
- CI pinned to Gon v1.13.0 (`expected-fixtures.txt` gains the new fixture; the
  other nine fixtures are unchanged under v1.13, i.e. none of them broke a
  contract inside a `return` or a closure).
- README: verified-against note bumped to v1.13.0.

## [0.1.9]

- Verified against **Gon v1.12.0** (directory form for `gon transpile` and
  `gon build` — M9). It is a CLI feature: the extension still calls
  single-file `gon check --json <file>`, which is unchanged, so there is **no
  code change** and no new fixture. Diagnostic Protocol v1 is unchanged.
- CI pinned to Gon v1.12.0; the nine fixtures are unchanged under v1.12.
- README: verified-against note bumped to v1.12.0.

## [0.1.8]

- Verified against **Gon v1.11.0** (Call-site contracts for source-declared
  methods — M7). A `!` written on a method's parameter or result is now
  enforced at its callers (**GN001** for `nil`, **GW001** for a comparison with
  nil of a `!` result), including through an interface. Diagnostic Protocol v1
  is unchanged, so these render with **no code change**.
- Added `fixtures/methodcontracts.gon` (2×GN001, 1×GW001) for the F5 Extension
  Development Host and for CI. Needs Gon **v1.11.0+**.
- CI pinned to Gon v1.11.0 (`expected-fixtures.txt` gains the new fixture; the
  other eight fixtures are unchanged under v1.11).
- README: verified-against note bumped to v1.11.0.

## [0.1.7]

- Verified against **Gon v1.10.0** (Package-aware checking — M8). Package mode
  (`gon check <dir>` / `./...`) is a CLI feature: the extension still calls
  single-file `gon check --json <file>`, which behaves as before, so there is
  **no code change** and no package-mode fixture. Two v1.10 details that touch
  the extension's single-file call:
  - A file whose only problem is a Go type error (for example a call to a
    function declared in a sibling file) now exits **1** with a valid envelope
    and **empty** `diagnostics` (the type error goes to stderr); it used to
    exit 0. Exit 1 with an empty array is valid under Protocol v1 §7 as
    clarified in Gon v1.10, and the extension already treats exit 0 and 1
    alike, so the Problems panel is unchanged (no diagnostics for that file).
    The stderr text is not shown anywhere.
  - Diagnostic Protocol v1 JSON shape is unchanged.
- **Fixture fix.** `fixtures/ok.gon` had declared a bare `var x !*int`, which
  Gon has rejected with **GN002** since v1.6 (a `!` variable needs an
  initializer), so the "clean file" fixture was not clean. It now initializes
  `x`, and reports no diagnostics (README step 6).
- README: verified-against note bumped to v1.10.0.

## [0.1.6]

- Verified against **Gon v1.9.0** (Generic `.gna` — M5b). `.gna` contracts on
  generic symbols resolve through explicit and inferred instantiation, and
  every `!` flag in a `.gna` is validated against the symbol's real signature
  (an invalid flag is **GN003** and only that flag is dropped). Diagnostic
  Protocol v1 is unchanged, so these render with **no code change**.
- Added `fixtures/genericgna/` — a small module (library, `.gna`, and
  `genericgna.gon`) with 3×GN001, 2×GN002, 1×GN003 and 2×GW001 for the F5
  Extension Development Host. Needs Gon **v1.9.0+**.
- README: verified-against note bumped to v1.9.0.

## [0.1.5]

- Verified against **Gon v1.8.0** (Generic Semantics — M3). Contracts attach
  to declaration positions and survive instantiation (`Box[T]{}` →
  **GN002**/**GN001**), `!X` on a type parameter needs a nilable constraint
  (**GN003**), and `!` in a type argument or constraint is **GN003**.
  Diagnostic Protocol v1 is unchanged, so these render with **no code
  change**.
- Added `fixtures/generics.gon` (1×GN002, 1×GN001, 2×GN003) for the F5
  Extension Development Host. Needs Gon **v1.8.0+**.
- README: verified-against note bumped to v1.8.0.

## [0.1.4]

- Verified against **Gon v1.7.1** (Element-Contract Construction — M2b).
  Element-position `!` (`[]!*T`, `[N]!*T`, `map[K]!*V`) is a
  construction-time obligation: explicit nil element → **GN001**,
  fixed-array zero-fill → **GN002**, element `!` on a channel element / map
  key / non-nilable kind → **GN003**. Diagnostic Protocol v1 is unchanged, so
  these render with **no code change**.
- Added `fixtures/elementcontracts.gon` (1×GN001, 1×GN002, 1×GN003) for the
  F5 Extension Development Host. Needs Gon **v1.7.1+** (v1.7.0 missed the
  GN002 on an untyped local `var`).
- README: verified-against note bumped to v1.7.1.

## [0.1.3]

- Verified against **Gon v1.6.0** (Type Coverage — M1b). `!` now has a
  uniform meaning on every nilable kind (`![]T`, `!map`, `!chan`, `!func`,
  named types / aliases): the reference value is non-nil. New rejections —
  bare `var x !S` with no initializer (**GN002**), `!` on a non-nilable type
  (**GN003**), `x.(!T)` for any target (**GN001**). Diagnostic Protocol v1
  is unchanged, so all of these render with **no code change** (severity +
  `code`/`message` pass through).
- Added `fixtures/typecov.gon` — a Type Coverage case (3×GN002, 1×GN001) for
  the F5 Extension Development Host. Needs Gon **v1.6.0+**.
- README: verified-against note bumped to v1.6.0.

## [0.1.2]

- Verified against **Gon v1.5.1** (Ecosystem Contract Expansion —
  cross-package `.gna` field/interface contracts; new **GW004** warning for
  a `.gna` naming a missing symbol). Diagnostic Protocol v1 is unchanged, so
  every v1.5 diagnostic — including GW004 — renders with **no code change**
  (the extension maps `severity` and passes `code`/`message` through).
- Added `fixtures/ecosystem/` — a self-contained module (lib + `.gna` +
  `.gon`) exercising external field contracts (GN002 / GN001 / GW001) for
  the F5 Extension Development Host. Needs Gon **v1.5.1+** (v1.5.0's
  post-check Go re-validation cannot resolve a module-local import).
- README: verified-against note bumped to v1.5.1.

## [0.1.1]

- Verified against **Gon v1.4.1** (interface `!I` contracts). Diagnostic
  Protocol v1 is unchanged, so the new GN001 cases render with no code
  change; the D6a assertion-target message now reads `!I`.
- Added `fixtures/iface.gon` — an interface-contract case for the F5
  Extension Development Host.
- README: note that the extension tracks the Gon CLI (protocol v1), not a
  pinned compiler version.

## [0.1.0]

- Phase 1: `.gon` language registration + TextMate grammar; on-save
  diagnostics via `gon check --json` (Diagnostic Protocol v1); Problems
  panel via per-URI `DiagnosticCollection`; UTF-8 → UTF-16 range mapping;
  generation counter + child-process kill on re-save; exit 2/3 preserves
  prior diagnostics.
