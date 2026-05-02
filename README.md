# arabic-ui-review

Arabic UI language review skill for AI coding agents.

Finds hardcoded Arabic text, audits translation/i18n files, checks Arabic quality with an Arabic-specialized LLM, and suggests fixes with your approval.

## Install

```bash
npx arabic-ui-review
```

Interactive installer detects which agents are on your machine, lets you pick which ones to install for, and sets up your LLM API key.

## Supported agents

| Agent | Install path | Format |
|-------|-------------|--------|
| **Claude Code** | `~/.claude/skills/` + `~/.agents/skills/` | Full skill (SKILL.md + scripts) |
| **Roo Code** | `~/.roo/skills/` | Full skill |
| **Kilo Code** | `~/.kilocode/skills/` | Full skill |
| **Hermes Agent** | `~/.hermes/skills/software-development/` | Full skill (with Hermes metadata) |
| **Pi Agent** | `~/.pi/agent/skills/` | Full skill |
| **Cursor** | `~/.cursor/rules/arabic-ui-review.mdc` | Rule with frontmatter |
| **Windsurf** | `~/.codeium/windsurf/memories/` | Markdown rule |
| **Cline** | `.clinerules` in project | Appended rule |
| **Continue.dev** | `~/.continue/rules/` | Markdown rule |
| **Aider** | `~/.aider/rules/` | Markdown rule |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Appended instructions |
| **OpenCode** | `~/.config/opencode/rules/` | Markdown rule |
| **Amp** | `~/.amp/rules/` | Markdown rule |
| **Zed AI** | `~/.config/zed/rules/` | Markdown rule |
| **Warp** | `~/.warp/prompts/` | Prompt file |
| **OpenClaw** | `~/.config/openclaw/rules/` | Markdown rule |

## What the skill does

Once installed, ask your agent:

```
"review Arabic UI"
"find hardcoded Arabic strings"
"audit my Arabic translations"
"check Arabic text quality"
```

The skill will:

1. **Find translation files** — `ar.json`, `ar.yaml`, `values-ar/strings.xml`, `app_ar.arb`, `ar.lproj/*.strings`, etc. Compare against reference language. Flag missing keys, empty values, placeholder mismatches.

2. **Search hardcoded Arabic** — Unicode range scan across all source files. For large codebases, chunks by logical segment: components → pages → notifications → errors → forms → templates → API → config.

3. **Use graphify** — if graphify skill is installed, uses it for structured per-component Arabic text discovery.

4. **Quality check via LLM** — spelling, grammar, formality (MSA vs dialect), RTL markers, diacritics, placeholder integrity.

5. **Generate report** — `arabic-review-report.md` with 🔴 errors / 🟡 warnings / 🔵 info.

6. **Fix loop** — suggests fixes, shows before/after diff, asks your approval before touching any file.

## Supported frameworks

React · Next.js · Vue · Angular · Flutter · iOS (Swift) · Android (Kotlin/Java) · Django · Rails · Laravel · Elixir/Phoenix · and more (auto-detected)

## LLM configuration

The installer writes `~/.arabic-review/.env`:

```env
ARABIC_REVIEW_MODEL=fanar
ARABIC_REVIEW_API_BASE=https://api.fanar.qa/v1
ARABIC_REVIEW_MODEL_ID=Fanar-S-1-Turbo
FANAR_API_KEY=your_key_here     # ← fill this in
```

Config is also read from project `.env` (takes priority over global config).

| Model | Default |
|-------|---------|
| **Fanar** — Arabic-specialized LLM (Qatar) | ✓ |
| OpenAI GPT-4o | |
| Anthropic Claude (claude-sonnet-4-6) | |
| Groq — fast, free tier | |
| Custom OpenAI-compatible endpoint | |

Get a Fanar key at [api.fanar.qa](https://api.fanar.qa).

## Manual config

Instead of the installer, create `~/.arabic-review/.env` manually:

```env
ARABIC_REVIEW_MODEL=fanar
ARABIC_REVIEW_API_BASE=https://api.fanar.qa/v1
ARABIC_REVIEW_MODEL_ID=Fanar-S-1-Turbo
FANAR_API_KEY=your_key_here
```

Then copy skill files manually:
- **Claude Code / Roo Code / Kilo Code / Pi / Hermes** — copy the `arabic-ui-review/` folder into the agent's skills directory
- **Other agents** — copy the relevant file from `templates/` into the agent's rules directory

## License

MIT — [El-Technology](https://github.com/El-Technology)
