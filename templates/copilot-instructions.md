# Arabic UI Review

When asked to review Arabic UI, find hardcoded Arabic strings, audit translation files, or check Arabic text quality:

1. **Find translation files** — search for `ar.json`, `ar.yaml`, `ar-SA.json`, `values-ar/strings.xml`, `ar.lproj/*.strings`, `app_ar.arb`. Compare keys against `en` (or other reference). Flag missing, empty, or placeholder-mismatched keys.

2. **Search hardcoded Arabic** — grep for Arabic Unicode (U+0600–U+06FF) in source files, skipping `node_modules`/`dist`/`.git`. For large codebases, group results by: components, pages, notifications, errors, forms, templates, API, config.

3. **Quality check** — call the configured Arabic LLM using env vars:
   - `ARABIC_REVIEW_API_BASE` (default `https://api.fanar.qa/v1`)
   - `ARABIC_REVIEW_MODEL_ID` (default `Fanar-S-1-Turbo`)
   - `FANAR_API_KEY` or `ARABIC_REVIEW_API_KEY`
   - Also check `~/.arabic-review/.env`
   
   Evaluate: spelling, grammar, formality, RTL markers, dialect vs MSA, placeholder integrity.

4. **Report** — write `arabic-review-report.md` with 🔴 errors / 🟡 warnings / 🔵 info, grouped by segment.

5. **Fix loop** — ask user how to proceed (all / errors only / one-by-one / segment / skip). Show diff for each fix. Never modify without approval.
