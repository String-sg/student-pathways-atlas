# Data Model: Local Pathways Plans

Design contract only; export/import is not implemented by this PR.

## Existing state

The active app is `Evan - Pathways/index.html` with modules under `src/`.
`src/main.js` manages `rows`, `detailedGradesMode`, `ccaGrade`, `currentAppMode`,
`selectedCareerCluster` and in-memory `compareList`. It reads localStorage first,
then `initApp()` restores IndexedDB via `src/utils/db.js`; `render()` triggers autoSave.
Subject rows now include `grade`. Engines in `src/engine/` calculate aggregates.
Do not export before asynchronous restore finishes, or assume that the displayed
Saved status proves either storage write succeeded.

## Proposed saved plan

| Field | Constraint |
| --- | --- |
| format | Exact value `string-pathways-plan` |
| schemaVersion | Integer `1`; reject unsupported versions |
| appVersion | Non-empty public build label, at most 64 characters |
| rulesVersion | Non-empty rules-bundle label, at most 64 characters |
| exportedAt | Valid UTC ISO-8601 timestamp |
| profileId | A known immutable, version-bearing profile identifier; reject unknown profiles |
| examYear | Integer 2000–2100 or null when unconfirmed |
| admissionYear | Integer 2000–2100 or null when unconfirmed |
| detailedGradesMode | Boolean; preserve simplified versus detailed entry |
| ccaGrade | `none`, `good` or `excellent`, matching the current UI |
| currentAppMode | `results`, `course` or `career` |
| selectedCareerCluster | Known ID from `src/data/careers.js` |
| subjects | Exactly the profile's eight subject slots; unique slot indexes 0–7 |
| comparisons | At most 100 distinct known destination IDs |

Subject fields: `slot`, `subjectId`, `level`, `taken`, `pass`, `failedGrade`, `grade`, `gradeBasis`.
`subjectId` must exist in the profile; `level` is 1, 2, 3 or null and must be offered
for that subject. `taken` is boolean. `pass` is boolean or null; null means unset.
`failedGrade` is 7, 8, 9 or null, allowed only for a failed G3 subject. The profile
validates optional-slot, duplicate-subject and pure/combined-science combinations.
`grade` is null or a valid level-specific string from `GRADE_OPTIONS` in `src/main.js`.
It can preserve a dormant grade in simplified mode; identify it as inactive rather than
using it to override pass/fail. `gradeBasis` is `entered`, `assumed`, `unconfirmed` or
`unset`. Never derive a precise grade from a pass/fail selection. Evan’s current render
can populate example grades on switching to detailed mode; prior saves have no origin
metadata, so use `unconfirmed` unless later input tracking proves an explicit entry.
Summaries distinguish assumptions/unconfirmed grades from actual results. In detailed
mode validate grade-derived pass/fail consistently; in simplified mode preserve the
user's illustrative choice. UI-derived flags are rebuilt from the profile.

Do not export identity fields, arbitrary URLs, executable content or trusted computed
eligibility. Source references and result explanations are generated from the installed
rules bundle for the summary, not accepted as authoritative from an imported file.

## Adapter between runtime rows and plan files

Do not validate or serialise raw `rows` as though they already match this schema.
Core runtime rows omit `taken`; interpret `row.taken !== false` as true. Normalise
undefined level/pass to null. For a not-taken slot, export null level, pass and failedGrade;
for other slots export failedGrade only when the current level is G3 and pass is false.
Discard dormant/stale `fg` values left after changing to Pass or another level. Keep
subject/slot identity and rebuild `el`/`sci` UI flags from the installed profile on import.
Retain valid dormant grade values with their basis; do not discard them as stale `fg`.
Round-trip equality includes canonical choices, grade basis, detailed mode, CCA, current
view, career cluster and comparison IDs,
not stale hidden fields. Test implicit taken, unset, None with retained runtime level,
Fail→Pass/G3→G2 transitions, detailed-mode examples versus entered grades, CCA,
and localStorage/IndexedDB disagreement and delayed restoration explicitly.

Profile IDs include a revision, for example `sec2-school-v1`; changing subject offerings
or restrictions requires a new ID. Never redefine an old ID. Unknown IDs are rejected;
known older revisions require an explicit supported migration, otherwise reject with
an explanation. A rules-version warning is distinct from a profile incompatibility.

## Import state transition

File selection → size/parse/schema validation → profile and rule-version checks →
preview of replacement → explicit confirmation → one atomic state replacement.

Maximum file size is 64 KiB. Unsupported fields are rejected. Parse/validation failures
and cancellation leave both in-memory work and stored work unchanged. For the same
rules/profile version, restore inputs, settings and comparisons and recompute explanations.
For an older rules version, show the mismatch and require an explicit choice to
recalculate against the installed version before replacing work; never reuse stale
computed outcomes. Unsupported schema/profile versions are rejected rather than migrated
silently. A future migration needs its own fixtures and versioned contract.

The summary labels unknown years as unconfirmed, distinguishes partial work, lists
comparison sources, and includes rules/build versions and unofficial-product notice.
No database schema is proposed.
