# Arabic UI Review

Add this file to your aider session with: `aider --read ~/.aider/rules/arabic-ui-review.md`

Or reference it in `.aider.conf.yml`:
```yaml
read:
  - ~/.aider/rules/arabic-ui-review.md
```

---

## When to apply
When the user asks to: review Arabic UI, audit translations, find hardcoded Arabic strings, check Arabic text quality.

## Workflow

### Step 1 — Translation files
Find: `ar.json`, `ar.yaml`, `ar-SA.json`, `values-ar/strings.xml`, `ar.lproj/*.strings`, `app_ar.arb`.
Compare against reference language. Flag: missing keys, empty values, placeholder mismatches.

### Step 2 — Hardcoded Arabic
Search Arabic Unicode (U+0600–U+06FF) across source. Skip `node_modules`/`dist`/`.git`.
Large codebases: chunk by components → pages → notifications → errors → forms → templates → api → config.

### Step 3 — graphify
If graphify skill available, use it for structured Arabic text discovery.

### Step 4 — Quality check
Use env vars:
- `ARABIC_REVIEW_API_BASE` (default: `https://api.fanar.qa/v1`)
- `ARABIC_REVIEW_MODEL_ID` (default: `Fanar-S-1-Turbo`)
- `FANAR_API_KEY` or `ARABIC_REVIEW_API_KEY`
- Fallback: `~/.arabic-review/.env`

Check: spelling, grammar, formality, RTL markers, diacritics, dialect vs MSA, placeholder integrity.

### Step 5 — Report + fix loop
Generate `arabic-review-report.md` (🔴 errors / 🟡 warnings / 🔵 info).
Ask user how to proceed before applying any fix. Show diff per change.
