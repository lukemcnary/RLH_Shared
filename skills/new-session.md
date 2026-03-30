# Skill: Starting a New Session

Use this at the start of every non-trivial working session in `shared/`.

---

## 1. Read the current state

Read:

1. `CURRENT_STATUS.md`
2. `PROJECT_CONTEXT.md`
3. `reference/PRODUCT_VISION.md`

This gives you the product voice, current milestone, and the repo's working boundaries before you touch implementation or docs.

---

## 2. Classify the work

Before doing anything substantial, classify the task as one of:

- `target-model` — changes the intended shared product model or its authoritative docs
- `bridge-only` — changes compatibility behavior or current implementation without redefining the target model
- `documentation-only` — clarifies docs without changing product or implementation behavior

If the task touches current Trevor compatibility surfaces, default to `bridge-only` unless the authoritative shared docs explicitly say otherwise.

---

## 3. Read the right reference docs

Use this guide:

- product meaning or philosophy -> `reference/PRODUCT_VISION.md`, `reference/DOMAIN_MODEL.md`
- information-system behavior -> `reference/DATA_FLOW.md`
- schema or table decisions -> `reference/SCHEMA_PLAN.md`, `reference/DATA_CONVENTIONS.md`
- architecture or backend boundaries -> `reference/SYSTEM_ARCHITECTURE.md`, `reference/PERMISSIONS.md`
- compatibility surfaces -> `reference/COMPATIBILITY_MAP.md`, `app/SEQUENCER.md`
- workflow behavior -> `reference/WORKFLOW_RULES.md` and the relevant doc in `workflows/`

Read only what the task requires, but never skip the authoritative layer that governs the decision you are about to make.

---

## 4. Pick the right skill

- new or changed feature/workflow -> `skills/new-feature.md`
- schema change -> `skills/schema-change.md`
- compatibility or bridge surface work -> `skills/compatibility-change.md`
- documentation-heavy work or final verification -> `skills/doc-sync.md`

---

## 5. Work from the shared product outward

Treat `shared/` as the active product definition.

Use `luke/` and `trevor/` as source material and reference context, not as competing authorities.
