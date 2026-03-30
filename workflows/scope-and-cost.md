# Workflow: Scope and Cost

> Status: Authoritative

This workflow turns plan information into trade-ready scope and, when needed, priced cost items.

---

## Outcome

By the end of this workflow:

- project-specific scope details are captured
- project scope groups those details into trade-ready packages of work
- cost items exist where pricing or financial control is needed
- the project is more structured and queryable, not just more budgeted

---

## Steps

1. Capture scope details from plans and specs.
   Use scope details for the atomic facts that matter: requirements, dimensions, coordination notes, and finish information.

2. Group details into project scope by trade.
   Project-scope items should read like trade-ready descriptions of work, not a copy of raw plan notes.

3. Create cost items under the correct cost code hierarchy when pricing is needed.
   Project scope leads the workflow. Cost items are created when the team is ready to estimate, price, or financially track that work. Once created, they become the financial control record for that scoped work.

4. Link project scope, spaces, and related context to each cost item.
   This is where the raw building facts and the priced work structure become connected.

5. Assign trade responsibility and estimate range.
   Set the relevant trade type and low/high estimate range before the work moves into bidding. If the builder already knows the company, it can be linked now, but it is not required.

6. Review the budget tree for gaps or duplicates.
   Use `/projects/[id]/budget` to confirm that the hierarchy, rollups, and cost coverage all make sense together.

---

## Done When

- every scoped decision that should be priced is represented by a cost item
- project scope and any related cost items can move into bid packages without first redoing scope work
- the budget view shows a coherent cost-code structure instead of orphaned records
- the project contains structured planning truth before, during, and after financialization

---

## Related Workflows

- `workflows/project-setup.md`
- `workflows/bidding.md`
- `workflows/selections.md`
