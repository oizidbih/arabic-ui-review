# arabic-ui-review

Arabic UI language review skill for AI coding agents.

Installs into **Claude Code**, **Cursor**, **Windsurf**, **Cline**, **Continue**, **OpenCode**, **Aider**, **GitHub Copilot**, **Amp**, and **Zed AI**.

## Install

```bash
npx arabic-ui-review
```

Interactive installer will:
1. Detect which coding agents are on your machine
2. Let you select which ones to install for
3. Ask which LLM to use for Arabic quality checks (default: **Fanar**)
4. Write `~/.arabic-review/.env` with model config + API key placeholder

## What it does

Once installed, ask your agent:

```
"review Arabic UI"
"find hardcoded Arabic strings"
"audit my Arabic translations"
"check Arabic text quality"
```

The skill will:

- **Find translation files** — `ar.json`, `ar.yaml`, `values-ar/strings.xml`, `app_ar.arb`, `ar.lproj/*.strings`, etc.
- **Compare against reference language** — flag missing keys, empty values, placeholder mismatches
- **Search hardcoded Arabic** — Unicode range scan across all source files, chunked by logical segment (components, pages, notifications, errors, forms, API, config) for large codebases
- **Check with graphify** — if available, uses it for structured discovery
- **Quality check via LLM** — spelling, grammar, formality (MSA vs dialect), RTL markers, diacritics, placeholder integrity
- **Generate a report** — `arabic-review-report.md` with 🔴 errors / 🟡 warnings / 🔵 info
- **Fix loop** — suggests fixes, asks your approval before touching any file

## Supported frameworks

React · Next.js · Vue · Angular · Flutter · iOS (Swift) · Android (Kotlin/Java) · Django · Rails · Laravel · Elixir/Phoenix · and more (auto-detected)

## LLM models

| Model | Default |
|-------|---------|
| **Fanar** (Arabic-specialized, Qatar) | ✓ |
| OpenAI GPT-4o | |
| Anthropic Claude | |
| Groq (fast, free tier) | |
| Custom (any OpenAI-compatible endpoint) | |

Config lives in `~/.arabic-review/.env`. Add your API key there.

## Manual config

```env
# ~/.arabic-review/.env
ARABIC_REVIEW_MODEL=fanar
ARABIC_REVIEW_API_BASE=https://api.fanar.qa/v1
ARABIC_REVIEW_MODEL_ID=Fanar-S-1-Turbo
FANAR_API_KEY=your_key_here
```

Get a Fanar key at [api.fanar.qa](https://api.fanar.qa).

## License

MIT
