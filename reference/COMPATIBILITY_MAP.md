# Compatibility Map

> Status: Authoritative

This document helps Trevor read the shared repo from his current Dataverse mental model.

It explains which Trevor concepts still matter, which ones the shared model rethinks, and which compatibility surfaces are still used by the current app.

Compatibility in this document means **Dataverse table-level compatibility**, not a runtime connection to Trevor's app.

---

## How To Read This Repo From Trevor's Current World

The shared product is **not** asking Trevor to stop thinking in Dataverse.

It is asking for a cleaner separation between:

- records that should stay part of the long-term shared model
- records that still matter for bridge compatibility today
- records that the shared product is intentionally redesigning

The fastest mental model is:

- keep `Project` and `Mobilization` anchored in Dataverse reality
- treat `Build Phase`, `ProjectTrade`, `TradeScope`, `TradeItem`, and marker structures as things the current app may still read
- use the shared docs to understand which of those ideas survive and which ones are being replaced or simplified

---

## Trevor-To-Shared Translation

| Trevor current concept | Current table(s) | Shared interpretation | Current app status |
|---|---|---|---|
| Project record | `cr6cd_projects` | Still the main project record | Used directly today |
| Trade catalog | `cr6cd_trades` | Still the canonical trade-type source | Used directly today |
| Companies and contacts | `accounts`, `contacts` | Still canonical people/company records | Still part of the long-term model |
| Build phases / gates | `cr6cd_buildphases`, `cr6cd_gatedeclarationsjson` | Shared model uses explicit gate classification on mobilizations | Current sequencer still reads `cr6cd_buildphases` |
| Project trade grouping | `rlh_projecttrades` | Project-to-trade link used for grouping and compatibility | Current sequencer still reads it |
| Mobilization visit | `cr6cd_mobilizations` | Still the scheduled trade-visit container | Current sequencer reads and writes it |
| Trade scopes and trade items | `rlh_tradescopes`, `rlh_tradeitems`, `cr6cd_stepsjson` | Shared model splits this intent across scope details, project scope, and action items depending on meaning | Current sequencer still reads `rlh_tradeitems` |
| Marker records | `cr6cd_mobilizationmarkerses`, `cr6cd_markersjson` | Shared target prefers `rlh_tasks` with a marker flag on action items | Current sequencer still reads markers |
| Execution tasking | legacy step/marker mix plus `rlh_tasks` | Shared target uses `rlh_tasks` as the execution action-item records grouped into mobilizations and optionally linked back to project scope | Execution route already reads `rlh_tasks` |
| Development planning | overlapping prep and trade-detail layers | Shared target uses scope details, project scope, optional cost items, bid packages, quotes, and selections | Development UI is already organized around the shared model |

---

## Trevor Concepts That Still Matter

Trevor's current model still contributes important shared truths:

- Dataverse remains the backend
- `cr6cd_projects`, `cr6cd_trades`, `accounts`, and `contacts` stay authoritative
- `cr6cd_mobilizations` remains a real execution container
- current compatibility surfaces are still relevant when the app needs table-level bridge coverage
- Trevor's execution sequencing experience is still a major design input for the shared product

---

## Concepts The Shared Model Intentionally Rethinks

- **Build phases become explicit gate classification on mobilizations.**
  - Shared target: `cr6cd_mobilizations.rlh_gatekey`
  - Trevor build phases are bridge input, not the long-term shared execution shape.

- **ProjectTrade is used mainly for grouping and compatibility.**
  - It still matters for grouping and compatibility.
  - Planning and assignment meaning live elsewhere in the shared model.

- **Markers and steps collapse into a shared action-item/checkpoint model.**
  - Shared target: `rlh_tasks`
  - Markers become action items with marker meaning instead of a permanent separate concept.

- **Planning becomes scope-first.**
  - Shared target: `rlh_scopedetails`, `rlh_scopeitems`, optional `rlh_costitems`
  - The shared product is not trying to preserve every prep-layer distinction Trevor currently has.

- **Project scope carries work continuity into bidding and execution.**
  - Shared target: `rlh_scopeitems`, `rlh_bidpackage_scopeitems`, `rlh_tasks`
  - The work should stay anchored to project scope, but execution grouping happens through action items assigned to mobilizations rather than through a direct mobilization-to-project-scope target link.

- **Company assignment becomes more flexible.**
  - Shared model allows direct company assignment when known.
  - Bid award can also populate or confirm that assignment.

---

## What The Current App Still Uses

If Trevor is reviewing the checked-in app right now, these bridge surfaces are still important:

- `cr6cd_buildphases`
- `rlh_projecttrades`
- `rlh_tradeitems`
- `cr6cd_mobilizationmarkerses`
- `cr6cd_mobilizations`

That is expected. The app is still in a bridge phase even though the target model is already documented more cleanly.

For the most current implementation view, read:

- `app/SEQUENCER.md`
- `CURRENT_STATUS.md`
- `workflows/transition.md`

---

## What Trevor Can Safely Assume

- the shared repo is not rejecting Trevor's current Dataverse experience
- the shared repo is trying to preserve the strong execution parts while improving the overall model
- the docs in `reference/` define the target shared direction
- the app may still use compatibility reads and writes while adoption is underway
- any current overlap with Trevor's world is at the Dataverse-table level, not through Trevor's app
- if recreating a project's current state in shared tables is easier than carrying forward old rows, that is an acceptable and often better path

If something looks familiar in the current app but different in the reference docs, treat that as a bridge-vs-target distinction first, not as a contradiction.
