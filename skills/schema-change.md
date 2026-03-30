# Skill: Proposing And Implementing A Schema Change

Schema changes affect the product definition, not just the app.

Follow this process without shortcuts.

---

## 1. Read the current contract first

Read:

- `reference/SCHEMA_PLAN.md`
- `reference/DOMAIN_MODEL.md`
- `reference/DATA_FLOW.md`
- `reference/SYSTEM_ARCHITECTURE.md`
- `reference/DATA_CONVENTIONS.md`

If the change touches bridge surfaces, also read:

- `reference/COMPATIBILITY_MAP.md`
- `app/SEQUENCER.md`

---

## 2. Decide what kind of schema change this is

- target shared table or field change
- extension of an existing table that still belongs in the target model
- bridge-only compatibility change on Trevor-owned or current execution surfaces

Treat changes to Trevor-owned current tables as high-risk and coordinate explicitly before implementing them.

---

## 3. Explain the change in plain language before implementation

State:

- what is changing
- why it is needed
- whether it is `target-model` or `bridge-only`
- which docs and tables are affected
- whether it changes authoritative product meaning or only current implementation behavior

---

## 4. Update the schema docs first

`reference/SCHEMA_PLAN.md` must lead the implementation.

If the change affects product meaning, update the matching reference docs first as well:

- `reference/DOMAIN_MODEL.md`
- `reference/DATA_FLOW.md`
- `reference/SYSTEM_ARCHITECTURE.md`

If the change opens a meaningful Luke-and-Trevor decision, add it to `collaboration/DECISIONS_OPEN.md`.

If the change closes a meaningful Luke-and-Trevor decision, record it in `collaboration/DECISIONS_CLOSED.md`.

---

## 5. Protect the platform boundaries

Do not:

- invent app-local schema truth
- blur Dataverse vs SharePoint authority
- let a bridge-only table change silently become target-model doctrine

If the change weakens those boundaries, call that out before proceeding.

---

## 6. Finish with doc sync

After implementation, follow `skills/doc-sync.md`.
