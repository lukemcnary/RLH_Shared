# GitHub Sandbox Workflow

> Status: Authoritative

This is the shared step-by-step workflow for how Luke and Trevor should use GitHub when each is working in his own sandbox or local clone.

This file is the detailed command-and-sequence companion to `CONTRIBUTING.md`.

The goal is simple:

- one shared repo
- one shared knowledge base
- one clear branch-per-change process
- one pull-request path back into the shared branch

If Claude or Codex is giving Git or branch advice for this repo, this is the file it should follow.

---

## Working Model

- `shared/` is the active shared product and the source of truth for the combined app.
- `luke/` and `trevor/` are still valuable reference context, but they are not the shared product authority once `shared/` defines something clearly.
- Luke and Trevor each work in a separate sandbox or local clone.
- Every change starts from the shared integration branch and then moves onto a focused personal branch.
- The default shared integration branch is `main` unless the team explicitly changes it and updates this doc plus `CONTRIBUTING.md`.
- Pull requests are the normal path back into the shared integration branch.

---

## When To Use This Doc

Read this when:

- setting up a fresh sandbox
- starting a new branch
- asking Claude or Codex how to handle GitHub for this repo
- syncing after the other person merged something
- opening or closing a pull request

---

## First-Time Sandbox Setup

1. Clone the repo into your sandbox.
2. Verify the remote you plan to use.

```bash
git remote -v
```

3. If the repo does not yet have the expected GitHub remote, add it before you start branch work.

```bash
git remote add origin <github-url>
```

If your remote is named something other than `origin`, substitute that name throughout this doc.

4. Switch to the shared integration branch and bring it up to date.

```bash
git switch main
git pull origin main
```

5. If you need to run the shared app locally, follow `app/LOCAL_SETUP.md` and default to mock mode first.

---

## Starting Any New Change

1. Make sure your sandbox is not carrying unrelated local work.

```bash
git status
```

2. Update the shared integration branch.

```bash
git switch main
git pull origin main
```

3. Create a new focused branch from `main`.

```bash
git switch -c luke/short-topic
```

or

```bash
git switch -c trevor/short-topic
```

4. Keep the branch about one change only. If a second topic appears, start a second branch.
5. Before asking Claude or Codex to help, point it at this doc and `CONTRIBUTING.md`.

---

## Recommended AI Prompt

Use:

`Read collaboration/GITHUB_SANDBOX_WORKFLOW.md and CONTRIBUTING.md. Tell me the exact GitHub steps for this task from my sandbox, suggest a branch name, and remind me which docs I need to update.`

If the question also needs Trevor-first repo orientation, include `TREVOR_START.md`.

---

## While You Are Working

- Do not commit directly to `main`.
- Do not keep piling unrelated work onto one long-lived personal branch.
- Keep docs and implementation in sync in the same branch when behavior, workflow, schema intent, or contributor rules change.
- Use mock mode by default unless the task truly needs live Dataverse or SharePoint behavior.
- If the change touches Trevor compatibility surfaces, treat it as `bridge-only` unless the shared docs explicitly say otherwise.

---

## Before You Push

1. Review the change.

```bash
git status
git diff --stat
```

2. Run the checks that match the change.

- docs-only change -> read the changed docs end to end and verify file paths and cross-links
- `app/` change -> from `app`, run `npm run lint`
- UI or workflow change -> run mock mode and click through the affected route

3. Stage and commit with a clear message.

```bash
git add <files>
git commit -m "Short description of the change"
```

---

## Open The Pull Request

1. Push the branch.

```bash
git push -u origin luke/short-topic
```

or

```bash
git push -u origin trevor/short-topic
```

2. Open a pull request into `main`.
3. In the pull request summary, say:

- what changed
- whether it is `target-model`, `bridge-only`, or `documentation-only`
- which docs were updated
- whether any Trevor compatibility surface changed

4. Merge only after review or explicit agreement.

---

## After Merge

1. Get back to a clean shared base.

```bash
git switch main
git pull origin main
```

2. Remove the finished local branch.

```bash
git branch -d luke/short-topic
```

or

```bash
git branch -d trevor/short-topic
```

3. Delete the remote branch too if it is no longer needed.

---

## If The Other Person Merged First

1. Update `main`.

```bash
git switch main
git pull origin main
```

2. Bring the new `main` into your working branch.

```bash
git switch luke/short-topic
git merge main
```

or

```bash
git switch trevor/short-topic
git merge main
```

3. Resolve conflicts locally, re-run the relevant checks, and push again.
4. Avoid force-pushing unless you are certain nobody else is relying on that branch history.

---

## Coordination Rules

- One branch should have one clear owner.
- If Luke and Trevor both need the same area at the same time, decide who owns the branch and pull request before both start editing.
- If a change rewrites contributor workflow, onboarding, or AI instructions, update this doc in the same branch.
- If the team decides to use a different shared integration branch than `main`, update this doc, `CONTRIBUTING.md`, and `CLAUDE.md` together.

---

## Fast Answers

- Where do I start new work: from the latest `main`
- Where do I make changes: on a new `luke/...` or `trevor/...` branch
- Where do we merge shared work: through a pull request into `main`
- What if both docs and code changed: keep them in the same branch and same pull request
- What should Claude or Codex read for Git workflow questions: this file and `CONTRIBUTING.md`
