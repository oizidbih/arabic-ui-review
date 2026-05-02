# Arabic UI Review

**Activate when:** User asks to review Arabic UI, audit translations, find hardcoded Arabic text, or check Arabic language quality.

## Steps

### 1. Translation files
Search for Arabic locale files: `ar.json`, `ar.yaml`, `ar-SA.json`, `values-ar/strings.xml`, `ar.lproj/*.strings`, `app_ar.arb`.
Compare keys vs reference language (usually `en`):
- Missing or empty keys → 🔴 error
- Placeholder count mismatch (`{var}`, `%s`, `{{x}}`) → 🔴 error
- Value same as key (untranslated) → 🟡 warning

### 2. Hardcoded Arabic text
Grep for Arabic Unicode (U+0600–U+06FF) across source files.
Skip `node_modules`, `dist`, `.git`, `build`, `vendor`.
For large codebases, process one segment at a time:
components → pages → notifications → errors → forms → templates → api → config

### 3. graphify (if available)
Use graphify skill to get structured, per-component view of Arabic text locations.

### 4. Quality check
Read LLM config from env (project `.env` → `~/.arabic-review/.env`):
```
ARABIC_REVIEW_API_BASE  (default: https://api.fanar.qa/v1)
ARABIC_REVIEW_MODEL_ID  (default: Fanar-S-1-Turbo)
FANAR_API_KEY           (or ARABIC_REVIEW_API_KEY)
```
Evaluate: spelling, grammar, MSA vs dialect, RTL markers, diacritics, placeholder integrity.

### 5. Report and fix loop
Generate `arabic-review-report.md` with 🔴 errors / 🟡 warnings / 🔵 info.
Ask: fix all / errors only / one by one / by segment / skip.
Show before/after diff for each fix. Wait for approval before writing any file.
