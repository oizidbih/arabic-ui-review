---
name: arabic-ui-review
description: >
  Reviews and audits Arabic UI language in any application codebase. Finds hardcoded
  Arabic text, analyzes translation/i18n files, checks Arabic quality (RTL, diacritics,
  formal vs dialect, consistency), lists all issues with severity, suggests concrete fixes,
  and asks the user before applying them. Uses an Arabic-specialized LLM (Fanar by default)
  to evaluate text quality. ALWAYS invoke this skill when the user asks to: review Arabic
  UI, audit Arabic translations, find hardcoded Arabic strings, check i18n completeness for
  Arabic, verify Arabic text quality, or scan a codebase for Arabic language issues — even
  if they phrase it casually ("check my Arabic", "any hardcoded Arabic?", "is my Arabic UI correct?").
---

# Arabic UI Review Skill

You are conducting a thorough Arabic UI language audit. Your job is to find every Arabic
string in the codebase — whether in translation files or hardcoded in source — evaluate
its quality using an Arabic-specialized LLM, report all issues clearly, suggest fixes, and
ask the user whether to apply them.

---

## Phase 0 — Setup

Before starting, check for a config file at `.arabic-review.json` in the project root:

```json
{
  "model": "fanar",
  "api_key": "YOUR_KEY_HERE",
  "api_base": "https://api.fanar.qa/v1",
  "model_id": "Fanar-S-1-Turbo"
}
```

If the file is missing or `api_key` is unset, tell the user:

> **Arabic LLM not configured.** Create `.arabic-review.json` in your project root with your API key. Default model is Fanar (https://api.fanar.qa). You can swap `model_id` for any OpenAI-compatible model by also changing `api_base`. Skip quality checks? (Y/N)

If they skip, continue without LLM quality checks. If they want to set up, guide them through it, then proceed.

Read `references/model-setup.md` for API call format details.

---

## Phase 1 — Detect Framework & Project Structure

Auto-detect the project type to know where to look:

| Signal | Framework |
|--------|-----------|
| `package.json` with `react` | React / React Native |
| `package.json` with `vue` | Vue.js |
| `package.json` with `@angular/core` | Angular |
| `pubspec.yaml` | Flutter |
| `*.xcodeproj` or `*.swift` | iOS Native |
| `build.gradle` | Android Native |
| `requirements.txt` / `*.py` | Python/Django/Flask |
| `mix.exs` | Elixir/Phoenix |
| `Gemfile` | Ruby on Rails |

Note the framework — it shapes where translation files live and how text is rendered.

---

## Phase 2 — Translation File Analysis (if files exist)

Search for translation/i18n files. Read `references/i18n-formats.md` for framework-specific
paths and file formats.

Common locations to check:
- `src/locales/ar*.{json,yaml,yml}`
- `public/locales/ar/`
- `i18n/ar*.{json,yaml}`
- `translations/ar*.{po,pot,mo}`
- `lang/ar*.php`
- `resources/lang/ar/`
- `assets/i18n/ar*.json`
- `*.strings` (iOS, look for Arabic translations)
- `values-ar/strings.xml` (Android)

If found:
1. Parse all Arabic translation files
2. Find the reference language (usually `en`) and compare keys
3. Identify:
   - **Missing keys** — present in reference but absent in Arabic file
   - **Empty values** — key exists but value is empty string
   - **Untranslated values** — value matches the key or contains only Latin text
   - **Placeholder mismatches** — `{name}`, `%s`, `{{count}}` etc. differ from reference
   - **Duplicate values** — same Arabic text for different keys (may be fine, flag anyway)

For each Arabic string found, queue it for quality check in Phase 4.

---

## Phase 3 — Hardcoded Arabic Text Search

Search the codebase for Arabic Unicode characters directly embedded in source files.

**Arabic Unicode ranges to search:**
- `؀-ۿ` — Arabic block (main)
- `ݐ-ݿ` — Arabic Supplement
- `ࢠ-ࣿ` — Arabic Extended-A
- `ﭐ-﷿` — Arabic Presentation Forms-A
- `ﹰ-﻿` — Arabic Presentation Forms-B

**Grep command:**
```bash
grep -rn --include="*.{js,jsx,ts,tsx,vue,py,rb,php,dart,swift,kt,java,html,xml,yml,yaml}" \
  -P "[\x{0600}-\x{06FF}\x{0750}-\x{077F}\x{08A0}-\x{08FF}\x{FB50}-\x{FDFF}\x{FE70}-\x{FEFF}]+" \
  --exclude-dir="{node_modules,.git,dist,build,.next,vendor,__pycache__}" \
  .
```

### If graphify is available

Check with: `skill: "graphify"` — if accessible, use it to build a knowledge graph of the
codebase and query for text nodes containing Arabic characters. This gives you structural
context (which component, which function, which UI layer each string belongs to).

### Large codebase handling

If the result count exceeds ~100 files or ~500 hits, divide into logical segments and process
one at a time. Tell the user which segment you're processing.

**Segments to use:**

| Segment | Paths to scan |
|---------|--------------|
| **UI Components** | `src/components/`, `lib/widgets/` |
| **Pages / Screens** | `src/pages/`, `src/screens/`, `src/views/` |
| **Navigation / Routing** | `src/router/`, `src/navigation/` |
| **Notifications & Alerts** | files matching `*notif*`, `*alert*`, `*toast*`, `*snack*` |
| **Error Messages** | files matching `*error*`, `*exception*`, `*validation*` |
| **Form Labels & Placeholders** | files matching `*form*`, `*input*`, `*field*` |
| **Email / SMS Templates** | `templates/`, `emails/`, `sms/` |
| **API / Backend responses** | `api/`, `controllers/`, `services/` |
| **Config & Constants** | `constants/`, `config/`, `settings/` |

Process each segment in turn. Present findings per segment so the user isn't overwhelmed.

---

## Phase 4 — Arabic Quality Analysis (LLM-powered)

For each Arabic string collected (from translation files and hardcoded), call the configured
Arabic LLM to evaluate quality. Read `references/model-setup.md` for the exact API call.

**Evaluate each string for:**

| Check | What to look for |
|-------|-----------------|
| **Spelling** | Typos, wrong letter forms |
| **Grammar** | Correct verb/noun agreement, proper tense |
| **Formality** | Match the app's tone (formal UI vs. conversational) |
| **RTL markers** | Missing `‏` (RLM) where needed in mixed text |
| **Diacritics** | Missing tashkeel where clarity matters (optional) |
| **Dialect vs MSA** | Flag dialect words if Modern Standard Arabic expected |
| **Truncation risk** | Very long strings that may overflow fixed-width UI |
| **Placeholder integrity** | Variables like `{name}` unchanged in translation |

Batch strings in groups of 20 to avoid rate limits. Include context (file path, UI segment)
in the prompt so the LLM can judge appropriateness.

**LLM prompt template:**
```
You are an expert Arabic language reviewer for software UI.
Review the following Arabic UI strings from a [FRAMEWORK] application.
For each string, identify: spelling errors, grammar issues, formality mismatches,
RTL marker problems, and any quality concerns. Be concise and precise.
Context: [SEGMENT_NAME] in [FILE_PATH]

Strings to review:
1. "[STRING]"
2. "[STRING]"
...

Respond as JSON: [{"index": 1, "issues": [...], "severity": "error|warning|info", "suggested_fix": "..."}]
```

---

## Phase 5 — Report Generation

Compile all findings into a structured markdown report. Save to `arabic-review-report.md`
in the project root.

### Report structure

```markdown
# Arabic UI Review Report
**Date:** [date]
**Project:** [project name from package.json / pubspec.yaml / etc.]
**Framework:** [detected framework]
**Model used for quality checks:** [model name or "skipped"]

## Summary
| Category | Count |
|----------|-------|
| Translation files analyzed | N |
| Missing translation keys | N |
| Empty/untranslated values | N |
| Hardcoded Arabic strings | N |
| Quality issues (errors) | N |
| Quality issues (warnings) | N |

## Issues

### 🔴 Errors (must fix)
[List each issue with: location, the string, the problem, suggested fix]

### 🟡 Warnings (should fix)
[...]

### 🔵 Info (consider fixing)
[...]

## Hardcoded Strings by Segment
[Group by segment: Components, Pages, Notifications, etc.]

## Translation File Coverage
[Key-by-key comparison table: key | en value | ar value | status]

## Recommended Next Steps
1. ...
2. ...
```

---

## Phase 6 — Interactive Fix Loop

After presenting the report, ask the user:

> I found **N errors** and **M warnings**. Would you like me to:
> 1. Fix all errors automatically
> 2. Fix errors + warnings
> 3. Walk through fixes one by one
> 4. Fix a specific segment only
> 5. Skip fixes for now
>
> Type a number or describe what you want.

For each fix:
1. Show the current value and proposed replacement side-by-side
2. Explain *why* the fix is better
3. If editing a translation file, update it in place
4. If fixing hardcoded text, suggest moving it to the translation file and show the refactored code
5. After each file edit, confirm: "Fixed [file]. Continue? (Y/N/skip)"

Keep a running tally: "Fixed 12 of 34 issues."

At the end, offer to re-run the scan to confirm all issues resolved.

---

## Important Notes

- **Never modify files without the user's explicit approval** for each batch or file
- Arabic text is RTL — when showing code snippets, note if the terminal may display it incorrectly
- Some hardcoded Arabic may be intentional (e.g., Arabic-script brand names, test data) — flag but don't auto-fix
- If the codebase has no Arabic text at all, report that clearly and offer to help set up i18n
- Respect `.gitignore` and skip `node_modules`, `dist`, `build`, `.git`, `vendor` always
