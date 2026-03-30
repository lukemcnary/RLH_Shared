# Skill: Closing a Session

Use this when wrapping up work in `shared/`.

---

## 1. Sync the docs to reality

If the session changed product meaning, workflow behavior, implementation boundaries, or contributor guidance, update the relevant docs before the session ends.

At minimum, consider:

- `CURRENT_STATUS.md`
- the relevant doc in `reference/`
- the relevant doc in `workflows/`
- `CLAUDE.md` or a doc in `skills/` if AI operating behavior changed

---

## 2. Keep the change classification visible

Make sure the final state still reads clearly as one of:

- `target-model`
- `bridge-only`
- `documentation-only`

Do not let bridge behavior read like target-model truth.

---

## 3. Record important decisions

If the session opened a meaningful Luke-and-Trevor decision, add it to `collaboration/DECISIONS_OPEN.md`.

If the session closed a meaningful Luke-and-Trevor decision, add a concise record to `collaboration/DECISIONS_CLOSED.md`.

---

## 4. Update the status snapshot

If the current milestone, read order, documented app state, or doc-status list changed, update `CURRENT_STATUS.md` in the same pass.
