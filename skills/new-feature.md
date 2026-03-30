# Skill: Implementing Or Revising A Feature

Follow these steps in order.

---

## 1. Classify the change

Decide whether the work is:

- `target-model`
- `bridge-only`
- `documentation-only`

This determines which docs must be read and which ones must be updated.

---

## 2. Read the governing docs

Always read:

- `reference/PRODUCT_VISION.md`
- `reference/DOMAIN_MODEL.md`
- `reference/DATA_FLOW.md`
- `reference/WORKFLOW_RULES.md`

Then read, as needed:

- `reference/SCHEMA_PLAN.md` for any data-shape dependency
- `reference/SYSTEM_ARCHITECTURE.md` for backend or boundary decisions
- `reference/COMPATIBILITY_MAP.md` and `app/SEQUENCER.md` if the work touches bridge surfaces
- the relevant doc in `workflows/`

---

## 3. Confirm the feature fits the shared model

Before writing code or docs, answer:

- Does this strengthen the target shared model or only adjust current bridge behavior?
- Does it preserve the scope-first product thesis and the explicit execution structure?
- Does it keep the app as a display/enforcement/normalization layer rather than a second system of record?

If the change weakens those boundaries, stop and surface it clearly.

---

## 4. Follow the existing implementation pattern

For app work:

- page files stay thin
- feature actions own writes
- `lib/dataverse/queries/` owns translation
- `lib/dataverse/adapter.ts` stays the public read surface
- `lib/sharepoint/` owns file orchestration

Do not bypass the adapter/query layer or introduce raw platform field names into UI code.

---

## 5. Update the matching docs in the same pass

If the change affects:

- product framing -> `reference/PRODUCT_VISION.md`
- domain meaning -> `reference/DOMAIN_MODEL.md`
- information flow -> `reference/DATA_FLOW.md`
- workflow behavior -> `reference/WORKFLOW_RULES.md` and the relevant workflow doc
- current bridge behavior -> `reference/COMPATIBILITY_MAP.md` and `app/SEQUENCER.md`

Then finish with `skills/doc-sync.md`.
