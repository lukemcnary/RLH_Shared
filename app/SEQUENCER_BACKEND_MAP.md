# Sequencer Backend Map

> Status: Working agreement for the current local prototype

This document is the short discussion artifact for the shared app sequencer.
It answers one question:

**Which sequencer concepts are canonical facts, and which are compatibility-only or derived?**

---

## Current Rule

- Canonical facts live in Dataverse relational records.
- Sequencing behavior is derived in the app projector.
- Compatibility JSON is a bridge for Trevor parity, not the desired long-term source of truth.

---

## Truth Map

| Sequencer concept | Current storage / source | Current role in `RLH_Shared` | Persisted or derived |
|---|---|---|---|
| Project | `cr6cd_projects` | Canonical fact | Persisted |
| Gate | `cr6cd_buildphases` | Canonical fact | Persisted |
| Project trade | `rlh_projecttrades` + `cr6cd_trades` | Canonical fact | Persisted |
| Mobilization | `cr6cd_mobilizations` | Canonical fact | Persisted |
| Scope assignment to mobilization | `rlh_tradescopes` | Canonical fact for step structure | Persisted |
| Desired start | `cr6cd_mobilizations.cr6cd_startoffset` | Canonical scheduling input | Persisted |
| Base duration | `cr6cd_mobilizations.cr6cd_durationdays` | Canonical timing input / fallback | Persisted |
| Runtime steps | built from `tradeScopes` in `features/sequencer/projector.ts` | Authoritative for board display | Derived |
| Total duration on the board | derived from projected steps and mobilization duration | Authoritative for board display | Derived |
| Resolved start / end | derived in projector after applying sequencing rules | Authoritative for board display | Derived |
| Overlap prevention / layout | projector logic | Authoritative for board display | Derived |
| Compatibility steps JSON | `cr6cd_mobilizations.cr6cd_stepsjson` | Backward-compat bridge only | Persisted |
| Compatibility markers JSON | `cr6cd_mobilizations.cr6cd_markersjson` | Backward-compat bridge only | Persisted |

---

## What This Means In Practice

- If the app needs to answer **"what steps should this mobilization show on the board?"**, the answer should come from `tradeScopes` through the projector.
- If the app needs to answer **"what start/end should this mobilization render at?"**, the answer should come from the projector, not directly from stored bars.
- If Trevor's current app still needs embedded step or marker JSON, `RLH_Shared` can continue writing those fields temporarily.
- Compatibility JSON should not override relational facts inside the shared app's sequencing engine.

---

## Current Transitional Boundary

- The sequencer page now carries two bundles:
  - `data`: compatibility-shaped records used by the current editor and save flow
  - `executionData`: canonical engine input used by the projector
- In the execution bundle, mobilization `steps` are intentionally stripped before projection so the engine has one source of truth for steps.
- Markers still flow through as compatibility data because there is not yet a dedicated canonical marker model.

---

## Decision Still Pending With Trevor

The open architecture decision is **not** whether the app can derive steps. It already can.

The decision is:

**Do we agree that scopes/relational records are the authoritative source for sequencer structure, with compatibility JSON treated as a temporary bridge only?**
