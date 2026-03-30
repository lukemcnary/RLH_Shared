# Contributing

> Status: Authoritative

This is the high-level contributor guide for this repo.

Use this file for:

- the collaboration rules contributors should follow
- how to classify a change
- which docs must stay in sync
- what a pull request needs to explain

For the exact Luke-and-Trevor sandbox-to-PR sequence, read `collaboration/GITHUB_SANDBOX_WORKFLOW.md` alongside this file.

---

## Working Agreement

- Treat this repo as the active shared product, not as a scratchpad.
- Do not work directly on `main`.
- Start each change from the latest `main`.
- Use one branch per focused change.
- Merge through pull requests.
- Keep pull requests small enough to review clearly.
- Update docs whenever product behavior, schema intent, or workflow rules change.
- If the team changes the shared integration branch away from `main`, update this file and `collaboration/GITHUB_SANDBOX_WORKFLOW.md` in the same pull request.

---

## Classify The Change First

Every change should explicitly classify itself as one of:

- `target-model` — changes the intended shared product model or its authoritative docs
- `bridge-only` — changes compatibility behavior or current implementation without redefining the target model
- `documentation-only` — clarifies docs without changing product or implementation behavior

This classification should be obvious in the branch, pull request summary, and any AI-assisted work log.

---

## What Must Be Updated With A Change

If your change affects the shared model, update the matching source-of-truth docs in the same branch:

- product framing -> `reference/PRODUCT_VISION.md`
- domain meaning -> `reference/DOMAIN_MODEL.md`
- information-system behavior -> `reference/DATA_FLOW.md`
- Dataverse storage contract -> `reference/SCHEMA_PLAN.md`
- architecture or boundaries -> `reference/SYSTEM_ARCHITECTURE.md`
- permissions or Microsoft authority -> `reference/PERMISSIONS.md`
- AI posture or boundaries -> `reference/AI_STRATEGY.md`
- workflow behavior -> the relevant doc in `workflows/`
- open shared decisions -> `collaboration/DECISIONS_OPEN.md`
- closed shared decisions -> `collaboration/DECISIONS_CLOSED.md`

If the change affects repo framing, contributor guidance, or local setup, update:

- `README.md`
- `collaboration/ONBOARDING.md`
- `CURRENT_STATUS.md`
- `CLAUDE.md`
- `app/LOCAL_SETUP.md`

If the change is `bridge-only`, update:

- `reference/COMPATIBILITY_MAP.md`
- `app/SEQUENCER.md`
- the relevant skill in `skills/` if the AI guidance changed

For the detailed branch, commit, push, and pull-request sequence, use `collaboration/GITHUB_SANDBOX_WORKFLOW.md`.

---

## Coordination Rules

- Use mock mode by default unless the task truly needs live Dataverse behavior.
- Treat current Trevor compatibility tables as bridge surfaces unless the reference docs explicitly keep them in the long-term model.
- Coordinate with Luke and Trevor before changing Trevor-owned existing or compatibility tables such as current `cr6cd_` tables and the existing `rlh_` execution tables.
- If a change opens a meaningful Luke-and-Trevor decision, add it to `collaboration/DECISIONS_OPEN.md`.
- If that decision is closed, move a concise record into `collaboration/DECISIONS_CLOSED.md` in the same pass as the doc updates.
- If a pull request changes what Trevor should read first or how a new contributor should adopt the app, update `collaboration/ONBOARDING.md`.
- If a change touches how AI should work in this repo, update the relevant doc in `skills/` and `CLAUDE.md`.

---

## Pull Request Expectations

Each pull request should make it easy to answer:

- what changed
- whether the change is `target-model`, `bridge-only`, or `documentation-only`
- whether the change affects the target shared model or only current implementation
- whether any Trevor compatibility surface changed
- which docs were updated to stay in sync

If a change is intentionally bridge-only, say so in the PR summary.

If the pull request changes collaboration process, onboarding, or Git workflow expectations, update the matching file in `collaboration/` in the same branch.
