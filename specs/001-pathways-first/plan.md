# Implementation Plan: Pathways First

**Branch**: `codex/pathways-first-specs` | **Date**: 2026-10-28 | **Spec**: [spec.md](spec.md)

**Input**: `specs/001-pathways-first/spec.md`

## Summary

Prioritise Pathways' subject-planning journey for parents and youth. Add the authorised
Atlas coming-soon placeholder now. Document the remaining mobile, trust, comparison
and local export/import work before changing those behaviours. Retain both original
prototypes and do not merge their engines in this slice.

## Technical Context

- **Language/Version**: Existing HTML/CSS and browser JavaScript; Python 3/Node are
  already used by Atlas. No application dependency or framework migration in this PR.
- **Primary Dependencies**: Browser APIs and current Google Fonts; no new runtime dependencies.
- **Storage**: Existing localStorage and IndexedDB via `src/utils/db.js`, including rows, detailed-grade mode and CCA; future local versioned plan files.
- **Testing**: Current PR uses source-diff checks and browser verification. Future
  meaningful rule fixtures and browser journeys are specified in [test-matrix.md](test-matrix.md).
- **Target Platform**: Mobile Safari/Chrome and current desktop browsers; verify physical
  iOS/Android keyboard behaviour before declaring the mobile release complete.
- **Project Type**: Static public web application with a separate offline Atlas artifact.
- **Performance Goals**: Placeholder introduces no requests, scripts or blocking work;
  rule evaluation remains client-side. Capture a baseline before setting further budgets.
- **Constraints**: Public access, no new data transmission, no rule changes in this PR;
  320–1440 CSS-pixel coverage and readable 200% enlarged text in the later mobile slice.
- **Scale/Scope**: One active prototype, one unavailable product entry, four user stories.

## Constitution Check

| Gate | Before research | After design |
| --- | --- | --- |
| Public access/user-owned plans | Pass: no auth or server saving | Pass: local export/import contract |
| Limits and accuracy | Pass: no admissions change | Pass: source/reviewer gate before future rule changes |
| Complete mobile journeys | Pass: explicit acceptance criteria | Pass: narrow placeholder check; broader work remains open |
| Attribution and preservation | Pass: both originals remain | Pass: original credits and Atlas folder retained |
| Bounded evidence | Pass: placeholder plus planning only | Pass: future tasks remain unchecked |

## Project Structure

```text
Evan - Pathways/index.html          # Active module-based entry
Evan - Pathways/src/                # Orchestrator, engines, data and IndexedDB helper
Evan - Pathways/css/                # Existing CSS plus isolated availability stylesheet
Evan - Pathways/indexOLD.html       # Unchanged archived single-file prototype
student-pathway-atlas/              # Preserved Atlas source, artifact and tests
.specify/                          # Project constitution, templates and workflow
.agents/skills/speckit-*/           # Generated Codex workflow skills
specs/001-pathways-first/           # Spec, plan, contracts, matrix and tasks
docs/pathways-journeys.md           # Current and proposed journeys
docs/pathways-ux-backlog.md         # Prioritised issues and evidence
```

Keep Evan’s module-based entry and add a small product-availability section before
its header. Do not restore the removed root entry or modify `indexOLD.html`. Use the
existing `src/engine/` modules for rule fixtures; no evaluator extraction or framework
rewrite is needed. Preserve the Results/Course/Career modes, detailed grades, CCA
and browser persistence. Serve over HTTP because the app uses ES modules.

## Phase 0: Research and Clarification

[research.md](research.md) records decisions and alternatives. The user chose Pathways
first and an Atlas placeholder. Use a local summary plus editable plan as the proposed
saving design. Release cohort, admissions reviewer and deployment hostname must be
resolved before their respective release tasks; no live service is configured here.

## Phase 1: Design and Contracts

- [data-model.md](data-model.md): current state and proposed saved-plan fields/validation.
- [contracts/ui-and-files.md](contracts/ui-and-files.md): unavailable entry, summary and import behaviour.
- [quickstart.md](quickstart.md): current checks and future validation instructions.
- [test-matrix.md](test-matrix.md): coverage and evidence boundaries.

Implementation order: availability → independently checked rules/trust → mobile subject
planning → reverse planning/comparison → local export/import. Recheck the gates for each
slice. Hosted GA4 is a subsequent bounded spec; Neon remains deferred.

## Complexity Tracking

No exceptions to the constitution. New backend, identity provider, database, SPA
framework and engine consolidation are deliberately outside this slice.
