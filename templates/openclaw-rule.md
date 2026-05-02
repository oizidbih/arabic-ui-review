# Arabic UI Review

**Trigger:** User asks to review Arabic UI, find hardcoded Arabic strings, audit translation files, or check Arabic text quality.

## Workflow

### 1. Translation files
Find: `ar.json`, `ar.yaml`, `ar-SA.json`, `values-ar/strings.xml`, `ar.lproj/*.strings`, `app_ar.arb`.
Compare against reference language. Flag: missing keys, empty values, placeholder mismatches, untranslated values.

### 2. Hardcoded Arabic search
Grep for Arabic Unicode (U+0600–U+06FF) in source files. Skip `node_modules`/`dist`/`.git`/`vendor`.
Large codebases: scan by segment — components → pages → notifications → errors → forms → templates → api → config.

### 3. graphify (if available)
Use graphify skill for structured per-component Arabic text discovery.

### 4. LLM quality check
Read config from env or `~/.arabic-review/.env`:
```
ARABIC_REVIEW_API_BASE   (default: https://api.fanar.qa/v1)
ARABIC_REVIEW_MODEL_ID   (default: Fanar-S-1-Turbo)
FANAR_API_KEY            (or ARABIC_REVIEW_API_KEY)
```
Evaluate: spelling, grammar, MSA vs dialect, RTL markers, diacritics, placeholder integrity.

### 5. Report + fix loop
Write `arabic-review-report.md` with 🔴 errors / 🟡 warnings / 🔵 info.
Ask user: fix all / errors only / one by one / segment / skip.
Show diff per change. Always confirm before writing any file.
