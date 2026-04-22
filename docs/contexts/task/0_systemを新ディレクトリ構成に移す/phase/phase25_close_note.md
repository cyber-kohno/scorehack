# Phase 25 Close Note

## Summary
Phase 25 selected the next legacy seam to finalize after cache recalculation cleanup.

The chosen target is `ContextUtil`.

---

## Why this target
`ContextUtil` still acts as a hidden global dependency channel, especially inside the arrange piano editor subtree.
Compared with the other remaining seams, it offers a strong cleanup payoff while staying reasonably bounded.

---

## Next-step judgement
The next phase should:
1. inventory current `ContextUtil` keys
2. group usage by feature
3. replace the safest reads and writes with explicit state or app-level accessors
4. reduce or remove `tauri_app/src/system/store/contextUtil.ts`
