# Changelog

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
