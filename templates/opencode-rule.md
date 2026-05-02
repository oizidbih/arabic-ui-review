# Arabic UI Review

When the user asks to review Arabic UI, audit translations, find hardcoded Arabic text, or check Arabic text quality, run this workflow:

## 1. Translation files
Search for Arabic locale files: `ar.json`, `ar.yaml`, `ar-SA.json`, `values-ar/strings.xml`, `ar.lproj/*.strings`, `app_ar.arb`.
Compare keys against reference language (usually `en`). Report missing keys, empty values, placeholder mismatches (`{var}`, `%s`, `{{x}}`).

## 2. Hardcoded Arabic search
Grep for Arabic Unicode (U+0600–U+06FF) across all source files.
Skip: `node_modules`, `dist`, `build`, `.git`, `vendor`.
For large codebases (100+ files with hits), scan by segment:
- `components/` / `widgets/`
- `pages/` / `screens/` / `views/`
- notification / alert / toast files
- error / validation files
- form / input / label files
- `templates/` / `emails/`
- `api/` / `services/` / `controllers/`
- `constants/` / `config/`

## 3. graphify (if available)
If the graphify skill is installed, use it to build a knowledge graph and query for Arabic text nodes — provides structural context per component/function.

## 4. LLM quality check
Read config from env vars (project `.env` or `~/.arabic-review/.env`):
```
ARABIC_REVIEW_API_BASE    (default: https://api.fanar.qa/v1)
ARABIC_REVIEW_MODEL_ID    (default: Fanar-S-1-Turbo)
FANAR_API_KEY             (or ARABIC_REVIEW_API_KEY)
```
Check each string: spelling, grammar, formality (MSA vs dialect), RTL markers, diacritics, placeholder integrity.

## 5. Report + fix loop
Write `arabic-review-report.md` with:
- 🔴 Errors (must fix)
- 🟡 Warnings (should fix)
- 🔵 Info (consider fixing)

After report, ask: "Fix all errors / errors+warnings / one by one / specific segment / skip?"
Show before/after diff for every change. Never modify files without user approval.
