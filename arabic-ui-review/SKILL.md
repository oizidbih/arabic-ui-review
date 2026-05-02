---
name: arabic-ui-review
trigger: /arabic-review
user-invocable: true
argument-hint: "[path] [--segment <name>] [--rules] [--fix] [--translations-only] [--hardcoded-only]"
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

## Commands

| Command | What it does |
|---------|-------------|
| `/arabic-review` | Full audit of current directory — translations + hardcoded search + quality check |
| `/arabic-review <path>` | Audit a specific directory or file |
| `/arabic-review --translations-only` | Only audit translation/i18n files, skip source search |
| `/arabic-review --hardcoded-only` | Only search for hardcoded Arabic in source, skip translation files |
| `/arabic-review --segment <name>` | Scan one logical segment: `components`, `pages`, `notifications`, `errors`, `forms`, `templates`, `api`, `config` |
| `/arabic-review --fix` | Run full audit then immediately enter fix loop (skip the "how to proceed?" prompt) |
| `/arabic-review --rules` | Print the full Arabic rule reference (`references/arabic-rules.md`) without scanning anything |
| `/arabic-review --rule <code>` | Check only one rule category, e.g. `--rule 1.1` (الهمزة المتوسطة) or `--rule 7` (علامات الترقيم) |
| `/arabic-review --summary` | Re-print the last generated `arabic-review-report.md` without re-scanning |

**Natural language also works** — the skill auto-triggers on:
- "review Arabic UI"
- "find hardcoded Arabic strings"
- "audit my Arabic translations"
- "check Arabic text quality"
- "any Arabic spelling errors?"
- "is my Arabic correct?"

---

## Phase 0 — Setup

### Parse arguments (when invoked as `/arabic-review [args]`)

Before doing anything else, read the arguments passed after `/arabic-review`:

```
<path>                → set SCAN_ROOT to this path instead of cwd
--translations-only   → set MODE=translations (skip Phase 3)
--hardcoded-only      → set MODE=hardcoded (skip Phase 2)
--segment <name>      → set SEGMENT=<name>, scan only that segment in Phase 3
--fix                 → after Phase 5 report, auto-enter fix loop (skip prompt)
--rules               → print references/arabic-rules.md and stop (no scan)
--rule <code>         → in Phase 4 only check violations matching this rule prefix
--summary             → read existing arabic-review-report.md and re-print it, then stop
(no args)             → full audit, SCAN_ROOT=cwd, MODE=full
```

If `--rules` or `--summary` is passed, handle it immediately and skip all other phases.

### Resolve LLM config in this priority order:

1. **Shell / project `.env`** — read these environment variables:
   ```
   ARABIC_REVIEW_MODEL        (fanar | openai | claude | groq | custom)
   ARABIC_REVIEW_API_BASE     (default: https://api.fanar.qa/v1)
   ARABIC_REVIEW_MODEL_ID     (default: Fanar-S-1-Turbo)
   FANAR_API_KEY              (or OPENAI_API_KEY / ANTHROPIC_API_KEY / GROQ_API_KEY)
   ARABIC_REVIEW_API_KEY      (generic fallback key var)
   ```

2. **Global installer config** — `~/.arabic-review/.env` (created by `npx arabic-ui-review`)

3. **Legacy project config** — `.arabic-review.json` in the project root (older format, still supported)

If no API key is found anywhere, tell the user:

> **Arabic LLM not configured.**
> Run `npx arabic-ui-review` to set up the model and API key interactively.
> The default model is **Fanar** (Arabic-specialized, https://api.fanar.qa).
> Skip quality checks for now? (Y/N)

If they skip, continue without LLM quality checks. If they want to set up, run them through the npx installer or guide them to edit `~/.arabic-review/.env`.

Read `references/model-setup.md` for API call format details and alternative model options.

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

Read `references/arabic-rules.md` — it defines every rule category and sub-category with
examples. Read `references/model-setup.md` for the API call format.

### Checking order per string

For each Arabic string, instruct the LLM to check in this order:

| # | Category (Arabic) | Code | Notes |
|---|-------------------|------|-------|
| 1 | الإملاء | 1.x | Always check — hamzas, ta marbuta, similar letters, proper nouns, foreign words |
| 2 | التفقيط | 2.x | Only if string contains numbers or monetary amounts |
| 3 | القواعد | 3.x | Case endings, verb mood, agreement, إنّ/كان families, ممنوع من الصرف |
| 4 | الصياغة | 4.x | Style, dialect, loanwords, preposition collocation, derivation |
| 5 | التشكيل | 5.x | Only if string contains diacritics |
| 6 | النص القرآني | 6.x | Identify first — skip spelling rules for Quranic portions |
| 7 | علامات الترقيم | 7.x | Comma, semicolon, full stop, dashes, colon, ؟ ! |

Additionally check always:
- **RTL markers**: missing `‏` (U+200F) where needed in mixed Arabic/Latin text
- **Placeholder integrity**: `{name}`, `%s`, `{{var}}` unchanged in translated strings
- **Truncation risk**: string unusually long for a UI label (>80 chars in a button/title context)

### Batching

Send strings in groups of 20. Include context (file path, segment type, framework) so the
LLM can judge register appropriateness.

### LLM prompt template

```
أنت مراجع لغوي متخصص في واجهات المستخدم العربية ومتمكّن من قواعد اللغة العربية الفصحى.
راجع النصوص العربية التالية من تطبيق [FRAMEWORK].
السياق: [SEGMENT_TYPE] — [FILE_PATH]

لكل نص، افحص القواعد التالية بالترتيب:
1. الإملاء: الهمزات (أوّل/وسط/آخر)، التاء المربوطة، الحروف المتقاربة صوتياً، الحروف المتشابهة شكلاً، أسماء الأعلام، الكلمات الأجنبية
2. التفقيط: إن وُجدت أرقام أو مبالغ مالية
3. القواعد: الحالات الإعرابية، الأعداد، الفعل المضارع، إنّ وأخواتها، كان وأخواتها، الممنوع من الصرف، الموافقات
4. الصياغة: التراكيب الشائعة غير الفصيحة، المقابل الفصيح للعامي والأجنبي، حروف الجر، الاشتقاقات
5. التشكيل: إن وُجد تشكيل جزئي أو كلي
6. النص القرآني: حدّد أوّلاً إن كان النص قرآنياً — إن كان كذلك لا تطبّق عليه قواعد الإملاء
7. علامات الترقيم: الفاصلة ومواضعها، الفاصلة المنقوطة، النقطة، الشرطتان، النقطتان الرأسيتان، ؟ !

النصوص:
[NUMBERED_STRINGS]

أجب بصيغة JSON فقط:
[{
  "index": 1,
  "violations": [
    {
      "rule": "1.1.2",
      "rule_name": "الهمزة المتوسطة",
      "severity": "error|warning|info",
      "found": "النص الخاطئ أو الجزء منه",
      "suggested_fix": "التصحيح المقترح",
      "explanation": "سبب الخطأ باختصار"
    }
  ]
}]
إذا كان النص صحيحاً في جميع النقاط، أعد: {"index": N, "violations": []}
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
