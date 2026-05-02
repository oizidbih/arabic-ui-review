# Arabic UI Review

**When to invoke:** User asks to review Arabic UI, find hardcoded Arabic strings, audit translation files, or check Arabic text quality in any codebase.

## Audit steps

**1. Find translation files**
Look for: `ar.json`, `ar.yaml`, `ar-SA.json`, `values-ar/strings.xml`, `ar.lproj/*.strings`, `app_ar.arb`, `ar.po`.
Compare all keys against the reference language. Flag missing, empty, and placeholder-mismatched entries.

**2. Find hardcoded Arabic text**
Search source files for Arabic Unicode characters (U+0600–U+06FF).
Skip `node_modules`, `dist`, `build`, `.git`, `vendor`.
For large repos, group findings by: components / pages / notifications / errors / forms / templates / API / config.

**3. Use graphify (if available)**
If graphify is installed, use it to discover Arabic text with structural context (which component, layer, function).

**4. Quality check via LLM**
Use config from env vars or `~/.arabic-review/.env`:
- `ARABIC_REVIEW_API_BASE` (default: `https://api.fanar.qa/v1`)
- `ARABIC_REVIEW_MODEL_ID` (default: `Fanar-S-1-Turbo`)
- `FANAR_API_KEY` or `ARABIC_REVIEW_API_KEY`

Check each string for: spelling, grammar, formality (MSA vs dialect), RTL markers, diacritics, placeholder integrity.

**5. Report and fix**
Write `arabic-review-report.md` with severity levels: 🔴 error / 🟡 warning / 🔵 info.
After reporting, ask user: fix all / errors only / one by one / segment / skip.
Show diff before every edit. Never modify without explicit approval.
