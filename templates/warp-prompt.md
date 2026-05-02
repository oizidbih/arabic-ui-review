# Arabic UI Review

Use this as a custom prompt in Warp AI. Save it in Warp's prompt library for quick access.

---

You are conducting an Arabic UI language audit on a software codebase.

## What to do

1. **Find translation files** — search for `ar.json`, `ar.yaml`, `ar-SA.json`, `values-ar/strings.xml`, `ar.lproj/*.strings`, `app_ar.arb`. Compare keys against reference language (`en`). Flag missing keys, empty values, placeholder mismatches (`{var}`, `%s`, `{{x}}`).

2. **Find hardcoded Arabic text** — grep for Arabic Unicode (U+0600–U+06FF) across source files. Skip `node_modules`, `dist`, `build`, `.git`, `vendor`. For large repos, group by: components → pages → notifications → errors → forms → templates → api → config.

3. **Quality check** — use the Arabic LLM configured in `~/.arabic-review/.env`:
   - `ARABIC_REVIEW_API_BASE` (default: `https://api.fanar.qa/v1`)
   - `ARABIC_REVIEW_MODEL_ID` (default: `Fanar-S-1-Turbo`)
   - `FANAR_API_KEY` or `ARABIC_REVIEW_API_KEY`
   
   Check each string for: spelling, grammar, formality (MSA vs dialect), RTL markers, diacritics, placeholder integrity.

4. **Report** — write `arabic-review-report.md` with 🔴 errors / 🟡 warnings / 🔵 info grouped by segment.

5. **Fix loop** — after the report, ask: fix all / errors only / one by one / by segment / skip. Show before/after diff per change. Never modify a file without my explicit approval.

Start by asking: "Which directory should I scan?"
