# Workflow: Selections

> Status: Authoritative

This workflow manages finish, fixture, and material decisions that affect purchasing and field work.

---

## Outcome

By the end of this workflow:

- selections are searchable and grouped consistently
- each selection is tied to the spaces, project scope, or cost items it affects
- procurement responsibility and status are clear
- the project becomes easier to query and coordinate because design decisions are structured instead of buried in files

---

## Steps

1. Create a selection record from the design decision or specification.
   Give it a usable spec code and category so it can be found later.

2. Link the selection to the spaces and planning or financial records it affects.
   Selections should explain where they apply and which scoped or priced work they influence.

3. Capture supplier and product detail.
   Store the manufacturer, product name, finish, size, link, and supplier context needed for purchasing or field clarification.

4. Set procurement responsibility and current status.
   The builder, trade, or vendor must be explicit before ordering begins.

5. Update the record as the selection moves through approval and delivery.
   Keep the selection status current so the field team can see whether the choice is still pending, ordered, delivered, or installed.

6. Review the grouped selection view for coverage and risk.
   In the target shared product, `/projects/[id]/selections` is the dedicated review surface for scanning by spec prefix or trade filter and finding missing, late, or unlinked decisions. If the checked-in app does not yet expose that full route, use this workflow as the authoritative behavior the future route must support.

---

## Done When

- material decisions are no longer trapped in scattered notes or PDFs
- the field team can trace what was chosen, where it goes, and who is buying it
- the selection record adds context to the shared project model instead of living as a disconnected side list

---

## Related Workflows

- `workflows/scope-and-cost.md`
- `workflows/bidding.md`
