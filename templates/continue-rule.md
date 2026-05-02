# Arabic UI Review

**Trigger:** User asks to review Arabic UI, find hardcoded Arabic text, audit i18n translation files, or check Arabic language quality.

## Process

### 1. Translation files
Locate Arabic locale files matching: `ar.json`, `ar.yaml`, `ar-SA.json`, `values-ar/strings.xml`, `ar.lproj/*.strings`, `app_ar.arb`.
Parse and compare against reference language (usually `en`):
- Missing keys → flag as error
- Empty values → flag as error
- Placeholder mismatch (`{var}`, `%s`, `{{x}}` counts differ) → flag as error
- Untranslated values (value == key name or is Latin text) → flag as warning

### 2. Hardcoded Arabic search
Grep for Arabic Unicode range (U+0600–U+06FF) in all source files.
Exclude: `node_modules`, `dist`, `build`, `.git`, `vendor`, `__pycache__`.
For large codebases, process by logical segment:
`components` → `pages/screens` → `notifications/alerts` → `errors/validation` → `forms/inputs` → `templates/emails` → `api/services` → `constants/config`

### 3. graphify check
If graphify skill is available, use it to map Arabic text by component/function structure.

### 4. LLM quality check
Config from env vars (project `.env` first, then `~/.arabic-review/.env`):
```
ARABIC_REVIEW_API_BASE   →  https://api.fanar.qa/v1 (default)
ARABIC_REVIEW_MODEL_ID   →  Fanar-S-1-Turbo (default)
FANAR_API_KEY            →  your key (or ARABIC_REVIEW_API_KEY)
```
Evaluate: spelling, grammar, MSA vs dialect, RTL markers, diacritics, placeholder integrity.

### 5. Report
Generate `arabic-review-report.md`:
```
🔴 Errors   — must fix (spelling, missing keys, broken placeholders)
🟡 Warnings — should fix (grammar, dialect, formality)
🔵 Info     — consider fixing (diacritics, style)
```

### 6. Fix loop
Ask: fix all / errors only / one by one / by segment / skip.
Show before/after for each change. Confirm before writing any file.
