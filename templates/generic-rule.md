# Arabic UI Review

**Trigger:** User asks to review Arabic UI, audit Arabic translations, find hardcoded Arabic text, or check Arabic text quality.

## Process

1. **Translation files** — Find `ar.json`, `ar.yaml`, `ar-SA.json`, `values-ar/strings.xml`, `ar.lproj/*.strings`, `app_ar.arb`.
   Compare against reference language. Flag missing keys, empty values, placeholder mismatches.

2. **Hardcoded Arabic search** — Grep for Arabic Unicode (U+0600–U+06FF) in source files.
   Skip `node_modules`, `dist`, `build`, `.git`, `vendor`.
   For large codebases, segment into: components / pages / notifications / errors / forms / templates / api / config.

3. **graphify** — If graphify is available, use it for structured discovery of Arabic text in the codebase.

4. **Quality check** — Use env vars for LLM config:
   - `ARABIC_REVIEW_API_BASE` (default: `https://api.fanar.qa/v1`)
   - `ARABIC_REVIEW_MODEL_ID` (default: `Fanar-S-1-Turbo`)
   - `FANAR_API_KEY` or `ARABIC_REVIEW_API_KEY`
   - Fallback: `~/.arabic-review/.env`
   
   Check: spelling, grammar, formality (MSA vs dialect), RTL markers, diacritics, placeholder integrity.

5. **Report** — Generate `arabic-review-report.md`:
   - 🔴 Errors (must fix)
   - 🟡 Warnings (should fix)
   - 🔵 Info (consider fixing)
   - Table: key | current value | issue | suggested fix

6. **Fix loop** — Ask: "Fix all errors / errors+warnings / one by one / specific segment / skip?"
   Show before/after diff for each fix. Never modify files without user approval.
   Track progress: "Fixed N of M issues."
