---
description: Review Arabic UI language — finds hardcoded Arabic text, audits translation files, checks quality with an Arabic LLM. Apply when the user asks to review Arabic UI, audit translations, find hardcoded Arabic strings, or check Arabic text quality.
globs:
alwaysApply: false
---

# Arabic UI Review

When asked to review Arabic UI, audit translations, or find hardcoded Arabic strings:

## Step 1 — Check translation files
Search for `ar.json`, `ar.yaml`, `ar-SA.json`, `values-ar/strings.xml`, `ar.lproj/*.strings`, `app_ar.arb` etc.
If found: compare keys against reference language (usually `en`). Flag missing, empty, or placeholder-mismatched keys.

## Step 2 — Find hardcoded Arabic text
Run a search for Arabic Unicode (`؀`–`ۿ` range) across source files, skipping `node_modules`, `dist`, `.git`.
For large codebases, scan by logical segment: components → pages → notifications → errors → forms → templates → API → config.

## Step 3 — Check if graphify skill is available
If yes, use it to build a knowledge graph and query for Arabic text nodes — gives richer structural context.

## Step 4 — Quality check via LLM
Read API config from env vars:
- `ARABIC_REVIEW_API_BASE` (default: `https://api.fanar.qa/v1`)
- `ARABIC_REVIEW_MODEL_ID` (default: `Fanar-S-1-Turbo`)
- `FANAR_API_KEY` or `ARABIC_REVIEW_API_KEY`

Also check `~/.arabic-review/.env` if project env vars are unset.

For each Arabic string, check: spelling, grammar, formality, RTL markers, diacritics, dialect vs MSA, placeholder integrity.

## Step 5 — Report + fix loop
Generate `arabic-review-report.md` with errors (🔴), warnings (🟡), info (🔵).
After reporting, ask: "Fix all errors / errors+warnings / one by one / specific segment / skip?"
Show before/after for each fix. Never modify files without user approval.
