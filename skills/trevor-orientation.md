# Skill: Trevor Orientation

Use this when Trevor, or a new collaborator thinking from Trevor's current world, asks what this repo is, what changed, or how `shared/` relates to the live Microsoft/Dataverse system.

This is the default skill for prompts like:

- `I'm Trevor. Tell me what's going on.`
- `What is this repo now?`
- `What stayed the same and what changed?`
- `How does shared relate to Trevor's current app?`

---

## Read In This Order

1. `TREVOR_START.md`
2. `CURRENT_STATUS.md`
3. `PROJECT_CONTEXT.md`
4. `reference/PRODUCT_VISION.md`
5. `reference/COMPATIBILITY_MAP.md`
6. `reference/DATA_FLOW.md`
7. `app/SEQUENCER.md` if current sequencer or bridge behavior matters
8. `workflows/transition.md` if adoption or rollout is part of the question

---

## Explain In This Order

1. What `trevor/` already solved well.
2. Why Trevor and Luke should be building the same app.
3. Why Trevor's current sequencer/app is strong but not the best long-term home for the whole product by itself.
4. Why the Next.js/React implementation path is better for the combined product than a browser-direct Dataverse app as the product grows, including the important differences in that switch and how the shared design keeps it safe.
5. Why the data model is flatter under `project` instead of centered on one strict table hierarchy.
6. Which Luke ideas are being imported and why.
7. What `shared/` is changing and why.
8. Why this should make the sequencer better rather than bury it.
9. What still carries forward from Trevor's current world.
10. What the checked-in app actually supports today.
11. What is target-model versus bridge-only behavior.
12. Make the sequencing workflow explicit: project scope is the preconstruction record layer, action items are created from project scope or directly, mobilizations group action items, and mobilizations sit in gates.
13. What to open or read next.

---

## Tone

- Treat Trevor as a co-author of the combined product, not an outsider being onboarded.
- Explain the change as a constructive critique of the current product shape, not as a rejection of Trevor's work.
- Emphasize continuity where it is real: Microsoft boundaries, Dataverse backend, SharePoint file authority, and sequencing as reasoning support.
- Be direct about changes where they are real: one shared app, scope-first planning, fuller commercial model, flatter peer project records, and product-first docs.
- Reassure Trevor that the sequencer remains first-class and should gain freedom, polish, and context in the shared app rather than being hidden inside it.
- Explicitly say that the current sequencer is good and important before explaining why it is not the best long-term home for the full product by itself.
- Say plainly that the target shared model does **not** put project scope directly into mobilizations.
- When explaining the stack switch, be honest about the important differences: more implementation responsibility, the server sitting between the user and Dataverse, and the app translating backend records. Pair each one with the safeguard plan, and still land clearly on Next.js/React as the better path.
- Keep the answer calm, concrete, and non-defensive.

---

## Do Not Do These Things

- Do not describe the shared app as a wrapper around Trevor's app.
- Do not imply Trevor's current tables were discarded or treated as irrelevant.
- Do not blur target shared architecture with current compatibility behavior.
- Do not imply unfinished surfaces already exist in the checked-in app.
- Do not overstate gates as if they are the sole source of execution meaning in the data model.
- Do not jump straight from "one app matters" into a list of changes without first explaining why the current shape is strong but limited long-term.
- Do not describe the stack switch as if Next.js/React is cost-free, but do not overplay the downsides so much that the recommendation becomes muddy.
- Do not answer from `trevor/` source material if the authoritative docs in this repo already define the shared product clearly.
