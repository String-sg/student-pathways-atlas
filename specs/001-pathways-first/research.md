# Research and Decisions

Prepared 2026-10-28; refreshed 2026-11-03 against `edcf8e8` and Evan’s modular version.

| Decision | Reason | Alternative considered |
| --- | --- | --- |
| Pathways first; Atlas grey coming soon | Explicit user priority | Atlas-first mobile release |
| Keep Evan’s new entry and add availability cards | Small reversible change; preserve saved-work behaviour | New landing route or move prototype |
| Preserve separate engines | Both prototypes now calculate aggregates; correctness and cohort contracts still need comparison | Immediate engine consolidation |
| Local summary + editable plan proposal | Export-based saving without accounts | Server profiles or Neon solely for saving |
| Keep static architecture | Current feature does not require a framework | Rewrite before verifying journeys |
| Defer GA activation | Event dictionary, stream and accurate privacy wording need a later slice | Add a tag during placeholder work |

## Evidence

- `Evan - Pathways/index.html`, `src/main.js`, `src/engine/`, `src/data/` and
  `src/utils/db.js`: Results/Course/Career modes, detailed grades and CCA, auto-save
  to localStorage and IndexedDB, in-memory course comparison. `indexOLD.html` is an
  archived prototype and is not the active entry. The 29 October PRD is a change log,
  not independent verification of its admissions claims.
- `student-pathway-atlas/README.md`: separate engines, tests, dated snapshots and
  missing refresh dependencies; its offline privacy promise requires preservation.
- [Existing-project Spec Kit guide](https://github.github.com/spec-kit/guides/existing-projects.html):
  adopt in place and specify the next bounded change, not every existing function.
- [Google privacy guidance](https://support.google.com/analytics/answer/6366371?hl=en):
  safe event payloads also require safe URLs, titles and automatic-collection settings.

## Tooling and provenance

Initialised with the already installed `specify` CLI, version `1.2.3.dev0`, using
`specify init --here --force --non-interactive --integration codex --ignore-agent-tools --script sh`.
No CLI package or global environment was installed or upgraded. Generated files and
version manifests are committed for review; this is a development version, not a
claim that the newest stable release has been installed. No extensions/hooks were installed.

## Release dependencies

Confirm launch exam/admissions cohort, a named admissions/source reviewer, intended
school-profile scope, production hostname and GA property/stream. These do not block
specification or the unavailable Atlas entry. Do not silently treat them as settled.

## Refresh after Evan’s 29 October changes

Merge current main into PR #1 rather than force-pushing or reverting contributor work.
Reapply only availability markup and an isolated CSS import to the active entry.
Keep all upstream JavaScript, original styles, assets, Firebase config, PRD and archive
byte-for-byte unchanged. Refresh the export contract to include detailed grades, CCA,
current mode and selected career cluster. Validate the new entry and module requests;
previous screenshots/checks from the single-file version are historical evidence only.
