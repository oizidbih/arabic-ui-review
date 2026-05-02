# Arabic UI Review Rules

When the user asks to review Arabic UI, find hardcoded Arabic text, audit translations, or check Arabic text quality, follow this process:

### 1. Detect framework and find translation files
Auto-detect framework from `package.json`, `pubspec.yaml`, `build.gradle`, etc.
Look for Arabic locale files: `ar.json`, `ar.yaml`, `ar-SA.json`, `values-ar/strings.xml`, `ar.lproj/*.strings`, `app_ar.arb`.
Compare against reference language — flag missing keys, empty values, placeholder mismatches.

### 2. Search hardcoded Arabic text
Grep for Arabic Unicode range `[\x{0600}-\x{06FF}]` across source files.
Skip: `node_modules`, `dist`, `build`, `.git`, `vendor`.
For 100+ file codebases, scan by segment: components / pages / notifications / errors / forms / templates / api / config.

### 3. Quality check with configured LLM
Read from env vars (project `.env` or `~/.arabic-review/.env`):
```
ARABIC_REVIEW_API_BASE   (default: https://api.fanar.qa/v1)
ARABIC_REVIEW_MODEL_ID   (default: Fanar-S-1-Turbo)
FANAR_API_KEY            (or ARABIC_REVIEW_API_KEY)
```
Check each string for: spelling, grammar, formality, RTL markers, dialect vs MSA, placeholder integrity.

### 4. Report and fix loop
Generate `arabic-review-report.md` with 🔴 errors / 🟡 warnings / 🔵 info.
Ask user: fix all / fix errors only / one by one / by segment / skip.
Show before/after for every change. Wait for approval before editing files.
