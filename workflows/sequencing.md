# Workflow: Sequencing

> Status: Authoritative

This workflow turns the execution plan into a gate-based sequencing board with clear trade intent.

---

## Outcome

By the end of sequencing:

- each active or upcoming gate has a clear field plan
- mobilizations carry timing and reasoning
- action items and markers describe the work and checkpoints inside those mobilizations
- handoffs between trades are visible before work reaches the field
- sequencing explains the work clearly without pretending to be authoritative backend structure

---

## Steps

1. Review the gate classifications before placing work.
   Confirm that the shared gate vocabulary still fits how the team is talking about the actual job.

2. Confirm the trade lanes that need to appear on the board.
   Sequencing only helps if the visible trade structure matches the real execution participants. If the current board still uses `ProjectTrade` rows, treat them as grouping helpers.

3. Create mobilizations inside the correct gate.
   Use the sequencer board to position each trade's work block in relation to the others.

4. Write the reasoning for every mobilization.
   Each mobilization should answer: why this trade, why now, and what it unlocks next.

5. Add action items to each mobilization.
   Create action items either from project scope or as brand-new action items. Every sequencer action item should carry a trade type, optional company, optional project-scope link, and the mobilization it belongs to.

6. Add markers where the field team needs them.
   Markers use the same action-item model and represent checkpoint moments inside the mobilization flow.

7. Review overlaps, gaps, and trade handoffs before communicating the plan.
   The board should make the intended flow legible enough to share with internal builders and trade partners.

---

## Done When

- the board reflects the actual intended order of work
- each mobilization explains itself well enough to survive handoff and review
- the board remains a reasoning layer anchored to explicit gate structure rather than a substitute for backend execution records

---

## Related Workflows

- `workflows/execution.md`
- `workflows/expectations.md`
