# Skill: Changing A Compatibility Surface

Use this when touching bridge-era Trevor surfaces or the current sequencer compatibility behavior.

Typical examples:

- `cr6cd_buildphases`
- `rlh_projecttrades`
- `rlh_tradeitems`
- `cr6cd_mobilizationmarkerses`
- current sequencer reads and writes that still depend on Trevor-era shapes

---

## 1. Start from the bridge docs

Read:

- `reference/COMPATIBILITY_MAP.md`
- `reference/SYSTEM_ARCHITECTURE.md`
- `CURRENT_STATUS.md`
- `app/SEQUENCER.md`

Do not start from old source assumptions alone.

---

## 2. Treat the work as bridge-only unless proven otherwise

Default posture:

- current compatibility surfaces matter
- they may still be necessary for the app today
- they are not automatically part of the long-term target model

If the change should become target-model doctrine, say so explicitly and update the authoritative shared docs accordingly.

---

## 3. Keep the boundary visible

Any bridge change should make these things clearer, not blurrier:

- what the current app still uses
- what the target model actually is
- what remains Trevor-owned or compatibility-only
- what readers should not mistake for long-term design

---

## 4. Update the right docs

If compatibility behavior changes, update:

- `reference/COMPATIBILITY_MAP.md`
- `app/SEQUENCER.md`
- `CURRENT_STATUS.md` if the implementation snapshot changed

Update `reference/DOMAIN_MODEL.md` or `reference/SYSTEM_ARCHITECTURE.md` only if the target product definition itself changed.

---

## 5. Do not let the bridge become invisible

The biggest failure mode is a clean-looking implementation note that quietly teaches the wrong long-term model.

If the app still depends on a bridge surface, say so plainly.
