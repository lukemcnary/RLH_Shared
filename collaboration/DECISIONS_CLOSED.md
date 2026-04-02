# Closed Decisions

> Status: Authoritative

This file records shared decisions that Luke and Trevor have explicitly closed together in `shared/`.

It is intentionally forward-looking. It does **not** try to reconstruct the full history of earlier solo design decisions.

---

## How To Use This File

- add a short record when a meaningful shared decision is closed
- keep the entry high-signal rather than exhaustive
- update the authoritative docs in the same change
- use this file as the collaboration summary, not as a replacement for the source-of-truth docs

---

## Closed Decision Log

## [2026-04-02] — Sequencer source of truth and compatibility boundary

**Decision:** The shared app treats relational records (`project`, `gate`, `project trade`, `mobilization`, and `trade scope assignment`) as the authoritative sequencer facts. Runtime steps, timing, and layout are derived in the app projector. Compatibility JSON and legacy child step/marker records remain temporary Trevor-bridge surfaces only.
**Rationale:** This keeps one clean source of truth for sequencing behavior while still preserving the compatibility outputs and fallbacks Trevor's current app may still need during the transition.
**Affects:** [SEQUENCER.md](/Users/lukemcnary/rl_os/RLH_Shared/app/SEQUENCER.md), [SEQUENCER_BACKEND_MAP.md](/Users/lukemcnary/rl_os/RLH_Shared/app/SEQUENCER_BACKEND_MAP.md), [adapter.ts](/Users/lukemcnary/rl_os/RLH_Shared/app/lib/dataverse/adapter.ts), [mobilizations.ts](/Users/lukemcnary/rl_os/RLH_Shared/app/lib/dataverse/queries/mobilizations.ts), [actions.ts](/Users/lukemcnary/rl_os/RLH_Shared/app/features/sequencer/actions.ts), Dataverse tables `cr6cd_mobilizations`, `rlh_tradescopes`, `rlh_tradeitems`, and `cr6cd_mobilizationmarkerses`.

---

## Template

```md
## [YYYY-MM-DD] — [Short title]

**Decision:** What was decided.
**Rationale:** Why this was the right call.
**Affects:** Which docs, workflows, tables, routes, or implementation surfaces should reflect it.
```
