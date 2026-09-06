# Changelog

## [0.1.1]

- Verified against **Gon v1.4.0** (interface `!I` contracts). Diagnostic
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
