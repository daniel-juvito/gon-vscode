# Changelog

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
