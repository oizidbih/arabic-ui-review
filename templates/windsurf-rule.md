# Arabic UI Review

**When to use:** User asks to review Arabic UI, audit i18n files, find hardcoded Arabic strings, or check Arabic text quality.

## Workflow

1. **Translation files** — search for `ar.json`, `ar.yaml`, `ar-SA.json`, `values-ar/strings.xml`, `ar.lproj/*.strings`, `app_ar.arb`. Compare keys vs reference language. Flag missing/empty/placeholder-mismatched keys.

2. **Hardcoded Arabic search** — grep for Arabic Unicode (U+0600–U+06FF) across source files. Skip `node_modules`, `dist`, `.git`. For large codebases chunk by: components → pages → notifications → errors → forms → templates → api → config.

3. **graphify check** — if graphify skill available, use it for structured Arabic text discovery.

4. **LLM quality check** — use env vars:
   - `ARABIC_REVIEW_API_BASE` (default: `https://api.fanar.qa/v1`)
   - `ARABIC_REVIEW_MODEL_ID` (default: `Fanar-S-1-Turbo`)
   - `FANAR_API_KEY` or `ARABIC_REVIEW_API_KEY`
   - Also check `~/.arabic-review/.env`
   
   Check: spelling, grammar, formality, RTL markers, diacritics, dialect vs MSA, placeholder integrity.

5. **Report** — write `arabic-review-report.md`. Severity: 🔴 errors / 🟡 warnings / 🔵 info.

6. **Fix loop** — after report ask user how to proceed. Show before/after diffs. Never auto-modify without approval.
