# Skill: Doc Sync

Run this after any session that changes product truth, workflow behavior, schema intent, compatibility posture, or contributor guidance.

The goal is simple: make sure the repo still says what the product actually is.

---

## What to check

### Front-door framing

- `README.md`
- `PROJECT_CONTEXT.md`
- `CURRENT_STATUS.md`
- `collaboration/README.md`
- `collaboration/ONBOARDING.md`
- `collaboration/GITHUB_SANDBOX_WORKFLOW.md`
- `CONTRIBUTING.md`
- `CLAUDE.md`

### Product and architecture

- `reference/PRODUCT_VISION.md`
- `reference/DOMAIN_MODEL.md`
- `reference/DATA_FLOW.md`
- `reference/SCHEMA_PLAN.md`
- `reference/SYSTEM_ARCHITECTURE.md`
- `reference/PERMISSIONS.md`
- `reference/AI_STRATEGY.md`
- `reference/WORKFLOW_RULES.md`

### Bridge and implementation notes

- `reference/COMPATIBILITY_MAP.md`
- `app/README.md`
- `app/SEQUENCER.md`

### AI operating docs

- the relevant doc in `skills/`

### Workflow docs

- the relevant doc in `workflows/`

---

## What to look for

- target-model language drifting into bridge-only behavior
- bridge-only details taking over front-door product framing
- app docs claiming routes or behavior that are not actually checked in
- docs that imply the app invents truth instead of displaying backend truth
- AI docs that imply authority beyond summary, suggestion, and reviewed writes

---

## How to fix

Edit the doc to match reality.

Do not edit reality to match an outdated document.

When multiple docs are affected, update them in the same session.
