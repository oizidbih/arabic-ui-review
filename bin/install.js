#!/usr/bin/env node

import * as p from '@clack/prompts';
import kleur from 'kleur';
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, cpSync, writeFileSync, readFileSync, appendFileSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOME = homedir();
const SKILL_SRC = join(__dirname, '..', 'arabic-ui-review');
const GLOBAL_CONFIG_DIR = join(HOME, '.arabic-review');
const GLOBAL_ENV_FILE = join(GLOBAL_CONFIG_DIR, '.env');

// ─── Agent definitions ────────────────────────────────────────────────────────

/** Check if a command exists in PATH — uses execFileSync (no shell injection) */
function which(cmd) {
  try {
    execFileSync('which', [cmd], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/** Check if any entry in dir starts with prefix (sync, no shell). */
function hasDirChild(parentDir, prefix) {
  if (!existsSync(parentDir)) return false;
  try {
    const result = execFileSync('ls', [parentDir], { encoding: 'utf8' });
    return result.split('\n').some(f => f.startsWith(prefix));
  } catch {
    return false;
  }
}

const AGENTS = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    detect: () => existsSync(join(HOME, '.claude')),
    format: 'skill-dir',
    // Install to both ~/.claude/skills/ and ~/.agents/skills/ (both are scanned)
    installTargets: () => [
      join(HOME, '.claude', 'skills', 'arabic-ui-review'),
      join(HOME, '.agents', 'skills', 'arabic-ui-review'),
    ],
    installTarget: () => join(HOME, '.claude', 'skills', 'arabic-ui-review'),
    note: 'Installed to ~/.claude/skills/ and ~/.agents/skills/',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    detect: () =>
      existsSync(join(HOME, '.cursor')) ||
      existsSync('/Applications/Cursor.app') ||
      which('cursor'),
    format: 'cursor-mdc',
    installTarget: () => join(HOME, '.cursor', 'rules'),
    note: 'Rule added to ~/.cursor/rules/arabic-ui-review.mdc',
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    detect: () =>
      existsSync(join(HOME, '.codeium', 'windsurf')) ||
      existsSync('/Applications/Windsurf.app') ||
      which('windsurf'),
    format: 'windsurf',
    installTarget: () => join(HOME, '.codeium', 'windsurf', 'memories'),
    note: 'Added to Windsurf global memories',
  },
  {
    id: 'continue',
    name: 'Continue.dev',
    detect: () => existsSync(join(HOME, '.continue')),
    format: 'continue',
    installTarget: () => join(HOME, '.continue', 'rules'),
    note: null,
  },
  {
    id: 'cline',
    name: 'Cline (VS Code)',
    detect: () =>
      hasDirChild(join(HOME, '.vscode', 'extensions'), 'saoudrizwan.claude-dev') ||
      hasDirChild(join(HOME, '.vscode', 'extensions'), 'cline'),
    format: 'clinerules',
    installTarget: () => process.cwd(),
    note: 'Adds .clinerules to current project directory',
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    detect: () =>
      existsSync(join(HOME, '.config', 'opencode')) ||
      which('opencode'),
    format: 'opencode',
    installTarget: () => join(HOME, '.config', 'opencode', 'rules'),
    note: null,
  },
  {
    id: 'aider',
    name: 'Aider',
    detect: () => which('aider'),
    format: 'aider',
    installTarget: () => join(HOME, '.aider', 'rules'),
    note: 'Add --read ~/.aider/rules/arabic-ui-review.md to your aider command',
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    detect: () =>
      hasDirChild(join(HOME, '.vscode', 'extensions'), 'github.copilot') ||
      which('gh'),
    format: 'copilot',
    installTarget: () => join(process.cwd(), '.github'),
    note: 'Adds .github/copilot-instructions.md to current project',
  },
  {
    id: 'amp',
    name: 'Amp (Sourcegraph)',
    detect: () => existsSync(join(HOME, '.amp')) || which('amp'),
    format: 'amp',
    installTarget: () => join(HOME, '.amp', 'rules'),
    note: null,
  },
  {
    id: 'zed',
    name: 'Zed AI',
    detect: () =>
      existsSync(join(HOME, '.config', 'zed')) ||
      existsSync(join(HOME, 'Library', 'Application Support', 'Zed')),
    format: 'zed',
    installTarget: () => join(HOME, '.config', 'zed', 'rules'),
    note: null,
  },
  {
    id: 'roo-code',
    name: 'Roo Code',
    detect: () => existsSync(join(HOME, '.roo')),
    format: 'skill-dir',
    installTarget: () => join(HOME, '.roo', 'skills', 'arabic-ui-review'),
    note: null,
  },
  {
    id: 'kilo-code',
    name: 'Kilo Code',
    detect: () =>
      existsSync(join(HOME, '.kilocode')) ||
      existsSync(join(HOME, '.kilo')),
    format: 'skill-dir',
    installTarget: () =>
      existsSync(join(HOME, '.kilocode'))
        ? join(HOME, '.kilocode', 'skills', 'arabic-ui-review')
        : join(HOME, '.kilo', 'skills', 'arabic-ui-review'),
    note: null,
  },
  {
    id: 'hermes',
    name: 'Hermes Agent',
    detect: () => existsSync(join(HOME, '.hermes')),
    format: 'skill-dir',
    // Hermes organises skills under category subdirs; software-development is the right category
    installTarget: () => join(HOME, '.hermes', 'skills', 'software-development', 'arabic-ui-review'),
    note: null,
  },
  {
    id: 'pi',
    name: 'Pi Agent',
    detect: () => existsSync(join(HOME, '.pi', 'agent')),
    format: 'skill-dir',
    installTarget: () => join(HOME, '.pi', 'agent', 'skills', 'arabic-ui-review'),
    note: null,
  },
  {
    id: 'warp',
    name: 'Warp',
    detect: () =>
      existsSync(join(HOME, '.warp')) ||
      existsSync('/Applications/Warp.app'),
    format: 'warp',
    installTarget: () => join(HOME, '.warp', 'prompts'),
    note: 'Prompt saved to ~/.warp/prompts/arabic-ui-review.md — load it via Warp AI prompt library',
  },
  {
    id: 'openclaw',
    name: 'OpenClaw',
    detect: () =>
      existsSync(join(HOME, '.openclaw')) ||
      existsSync(join(HOME, '.config', 'openclaw')) ||
      which('openclaw'),
    format: 'openclaw',
    installTarget: () =>
      existsSync(join(HOME, '.openclaw'))
        ? join(HOME, '.openclaw', 'rules')
        : join(HOME, '.config', 'openclaw', 'rules'),
    note: null,
  },
  {
    id: 'codex',
    name: 'Codex CLI (OpenAI)',
    detect: () => existsSync(join(HOME, '.codex')) || which('codex'),
    format: 'codex',
    installTarget: () => join(HOME, '.codex', 'rules'),
    note: '/arabic-review registered in ~/.codex/prompts/',
  },
];

// ─── Model definitions ────────────────────────────────────────────────────────

const MODELS = [
  {
    value: 'fanar',
    label: 'Fanar  — Arabic-specialized LLM (recommended)',
    hint: 'Get key at https://api.fanar.qa',
    apiBase: 'https://api.fanar.qa/v1',
    modelId: 'Fanar-C-2-27B',
    envKey: 'FANAR_API_KEY',
  },
  {
    value: 'openai',
    label: 'OpenAI GPT-4o',
    hint: 'Get key at https://platform.openai.com',
    apiBase: 'https://api.openai.com/v1',
    modelId: 'gpt-4o',
    envKey: 'OPENAI_API_KEY',
  },
  {
    value: 'claude',
    label: 'Anthropic Claude (claude-sonnet-4-6)',
    hint: 'Get key at https://console.anthropic.com',
    apiBase: 'https://api.anthropic.com/v1',
    modelId: 'claude-sonnet-4-6',
    envKey: 'ANTHROPIC_API_KEY',
  },
  {
    value: 'groq',
    label: 'Groq  — fast, has free tier',
    hint: 'Get key at https://console.groq.com',
    apiBase: 'https://api.groq.com/openai/v1',
    modelId: 'llama-3.1-70b-versatile',
    envKey: 'GROQ_API_KEY',
  },
  {
    value: 'custom',
    label: 'Custom / Configure later in .env',
    hint: 'Set ARABIC_REVIEW_API_BASE, ARABIC_REVIEW_MODEL_ID, ARABIC_REVIEW_API_KEY',
    apiBase: null,
    modelId: null,
    envKey: 'ARABIC_REVIEW_API_KEY',
  },
];

// ─── Install helpers ──────────────────────────────────────────────────────────

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function readTemplate(name) {
  const templatePath = join(__dirname, '..', 'templates', name);
  return existsSync(templatePath) ? readFileSync(templatePath, 'utf8') : null;
}

function buildGenericRule() {
  const skillMd = join(SKILL_SRC, 'SKILL.md');
  return existsSync(skillMd) ? readFileSync(skillMd, 'utf8') : '# Arabic UI Review\nReview Arabic UI language when asked.';
}

/** Builds the slash-command markdown file content (same format for Claude Code, OpenCode, Codex, Amp). */
function buildCommandContent() {
  return [
    '---',
    'description: Review Arabic UI language in this codebase (translations, hardcoded strings, quality)',
    '---',
    '',
    'Use the arabic-ui-review skill to conduct a full Arabic UI language audit on this codebase.',
    '',
    'If arguments were passed after the command, interpret them as follows:',
    '- A path argument → scan that path instead of the current directory',
    '- `--translations-only` → only audit translation/i18n files',
    '- `--hardcoded-only` → only search for hardcoded Arabic in source files',
    '- `--segment <name>` → scan one segment: components, pages, notifications, errors, forms, templates, api, or config',
    '- `--fix` → run the full audit then immediately enter the fix loop',
    '- `--rules` → print the full Arabic rules reference without scanning anything',
    '- `--rule <code>` → check only the specified rule category (e.g. 1.1, 3, 7)',
    '- `--summary` → reprint the last arabic-review-report.md without rescanning',
    '',
    'Follow the skill instructions exactly, starting from Phase 0.',
  ].join('\n');
}

/** Write a slash-command file to a given directory (creates dir if needed). */
function writeCommandFile(dir) {
  ensureDir(dir);
  writeFileSync(join(dir, 'arabic-review.md'), buildCommandContent(), 'utf8');
}

/** Patch ~/.continue/config.json to add /arabic-review slash command (no-op if file absent). */
function patchContinueConfig() {
  const configPath = join(HOME, '.continue', 'config.json');
  if (!existsSync(configPath)) return;
  let config;
  try { config = JSON.parse(readFileSync(configPath, 'utf8')); } catch { return; }
  if (!Array.isArray(config.slashCommands)) config.slashCommands = [];
  if (config.slashCommands.some(c => c.name === 'arabic-review')) return; // already present
  config.slashCommands.push({
    name: 'arabic-review',
    description: 'Review Arabic UI language in this codebase',
    prompt: buildCommandContent().replace(/^---[\s\S]*?---\n\n/, ''), // strip frontmatter
  });
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
}

function installAgent(agent) {
  const target = agent.installTarget();

  switch (agent.format) {
    case 'skill-dir': {
      // Install to all target locations (e.g. both ~/.claude/skills/ and ~/.agents/skills/)
      const targets = agent.installTargets ? agent.installTargets() : [target];
      for (const t of targets) {
        ensureDir(t);
        cpSync(SKILL_SRC, t, { recursive: true });

        // Claude Code: register /arabic-review in ~/.claude/commands/ (command palette)
        if (agent.id === 'claude-code') {
          writeCommandFile(join(HOME, '.claude', 'commands'));
        }

        // Hermes requires extra frontmatter: version, author, license, tags
        if (agent.id === 'hermes') {
          const skillMdPath = join(t, 'SKILL.md');
          if (existsSync(skillMdPath)) {
            const original = readFileSync(skillMdPath, 'utf8');
            const patched = original.replace(
              /^---\n/,
              '---\nversion: 1.0.0\nauthor: ElTechnology\nlicense: MIT\nmetadata:\n  hermes:\n    tags: [arabic, i18n, l10n, rtl, ui-review, translation]\n    related_skills: []\n'
            );
            writeFileSync(skillMdPath, patched, 'utf8');
          }
        }
      }
      break;
    }

    case 'cursor-mdc': {
      ensureDir(target);
      const content = readTemplate('cursor-rule.md') || buildGenericRule();
      writeFileSync(join(target, 'arabic-ui-review.mdc'), content, 'utf8');
      break;
    }

    case 'windsurf': {
      ensureDir(target);
      const content = readTemplate('windsurf-rule.md') || buildGenericRule();
      writeFileSync(join(target, 'arabic-ui-review.md'), content, 'utf8');
      break;
    }

    case 'clinerules': {
      const content = readTemplate('clinerules.md') || buildGenericRule();
      const dest = join(target, '.clinerules');
      if (existsSync(dest)) {
        appendFileSync(dest, '\n\n' + content, 'utf8');
      } else {
        writeFileSync(dest, content, 'utf8');
      }
      break;
    }

    case 'copilot': {
      ensureDir(target);
      const content = readTemplate('copilot-instructions.md') || buildGenericRule();
      const dest = join(target, 'copilot-instructions.md');
      if (existsSync(dest)) {
        appendFileSync(dest, '\n\n' + content, 'utf8');
      } else {
        writeFileSync(dest, content, 'utf8');
      }
      break;
    }

    case 'opencode': {
      ensureDir(target);
      const content = readTemplate('opencode-rule.md') || buildGenericRule();
      writeFileSync(join(target, 'arabic-ui-review.md'), content, 'utf8');
      // Also register /arabic-review in ~/.config/opencode/commands/ (slash command palette)
      writeCommandFile(join(HOME, '.config', 'opencode', 'commands'));
      break;
    }

    case 'aider': {
      ensureDir(target);
      const content = readTemplate('aider-rule.md') || buildGenericRule();
      writeFileSync(join(target, 'arabic-ui-review.md'), content, 'utf8');
      break;
    }

    case 'continue': {
      ensureDir(target);
      const content = readTemplate('continue-rule.md') || buildGenericRule();
      writeFileSync(join(target, 'arabic-ui-review.md'), content, 'utf8');
      // Also patch ~/.continue/config.json slashCommands if it exists
      patchContinueConfig();
      break;
    }

    case 'amp': {
      ensureDir(target);
      const content = readTemplate('amp-rule.md') || buildGenericRule();
      writeFileSync(join(target, 'arabic-ui-review.md'), content, 'utf8');
      // Also register /arabic-review in ~/.amp/prompts/ (slash command palette)
      writeCommandFile(join(HOME, '.amp', 'prompts'));
      break;
    }

    case 'zed': {
      ensureDir(target);
      const content = readTemplate('zed-rule.md') || buildGenericRule();
      writeFileSync(join(target, 'arabic-ui-review.md'), content, 'utf8');
      break;
    }

    case 'warp': {
      ensureDir(target);
      const content = readTemplate('warp-prompt.md') || buildGenericRule();
      writeFileSync(join(target, 'arabic-ui-review.md'), content, 'utf8');
      break;
    }

    case 'openclaw': {
      ensureDir(target);
      const content = readTemplate('openclaw-rule.md') || buildGenericRule();
      writeFileSync(join(target, 'arabic-ui-review.md'), content, 'utf8');
      break;
    }

    case 'codex': {
      ensureDir(target);
      const content = readTemplate('generic-rule.md') || buildGenericRule();
      writeFileSync(join(target, 'arabic-ui-review.md'), content, 'utf8');
      // Register /arabic-review in ~/.codex/prompts/ (slash command palette)
      writeCommandFile(join(HOME, '.codex', 'prompts'));
      break;
    }

    case 'markdown':
    default: {
      ensureDir(target);
      const content = readTemplate('generic-rule.md') || buildGenericRule();
      writeFileSync(join(target, 'arabic-ui-review.md'), content, 'utf8');
      break;
    }
  }
}

// ─── .env helpers ─────────────────────────────────────────────────────────────

function writeEnvConfig(model, apiKey) {
  ensureDir(GLOBAL_CONFIG_DIR);

  const lines = [
    '# Arabic UI Review — LLM config',
    '# Generated by: npx arabic-ui-review',
    '',
    `ARABIC_REVIEW_MODEL=${model.value}`,
  ];

  if (model.apiBase)  lines.push(`ARABIC_REVIEW_API_BASE=${model.apiBase}`);
  if (model.modelId)  lines.push(`ARABIC_REVIEW_MODEL_ID=${model.modelId}`);

  lines.push('');
  lines.push(`${model.envKey}=${apiKey || `your_${model.value}_api_key_here`}`);
  lines.push('');

  writeFileSync(GLOBAL_ENV_FILE, lines.join('\n'), 'utf8');
}

function detectShellConfig() {
  const shell = process.env.SHELL || '';
  if (shell.includes('zsh'))  return join(HOME, '.zshrc');
  if (shell.includes('fish')) return join(HOME, '.config', 'fish', 'config.fish');
  return join(HOME, '.bashrc');
}

function isAlreadySourced(shellConfig) {
  if (!existsSync(shellConfig)) return false;
  return readFileSync(shellConfig, 'utf8').includes(GLOBAL_ENV_FILE);
}

function addToShellConfig(shellConfig) {
  const line = `\n# Arabic UI Review\nsource "${GLOBAL_ENV_FILE}"\n`;
  appendFileSync(shellConfig, line, 'utf8');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const { version } = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

const args = process.argv.slice(2);
if (args.includes('--version') || args.includes('-v')) {
  console.log(version);
  process.exit(0);
}
if (args.includes('--help') || args.includes('-h')) {
  console.log(`arabic-ui-review v${version}

  Installs the Arabic UI Review skill into your AI coding agents.

  Usage:
    npx arabic-ui-review            Interactive installer
    npx arabic-ui-review --version  Print version
    npx arabic-ui-review --list     List all supported agents

  Supported agents:
    Claude Code, Roo Code, Kilo Code, Hermes, Pi, Cursor, Windsurf,
    Cline, Continue, Aider, Copilot, OpenCode, Amp, Zed, Warp, OpenClaw

  Docs: https://github.com/El-Technology/arabic-ui-review
  `);
  process.exit(0);
}
if (args.includes('--list')) {
  AGENTS.forEach(a => {
    const detected = (() => { try { return a.detect(); } catch { return false; } })();
    console.log(`  ${detected ? '✓' : '○'}  ${a.name}`);
  });
  process.exit(0);
}

async function main() {
  console.log('');
  p.intro(kleur.bold().cyan(' Arabic UI Review — Skill Installer '));

  // ── Detect agents ──────────────────────────────────────────────────────────
  const detected = AGENTS.filter(a => { try { return a.detect(); } catch { return false; } });
  const undetected = AGENTS.filter(a => !detected.includes(a));

  if (detected.length > 0) {
    p.note(
      detected.map(a => kleur.green('✓') + '  ' + a.name).join('\n'),
      'Detected on your system'
    );
  } else {
    p.log.warn('No agents detected automatically — you can still select any to install.');
  }

  // ── Select agents ──────────────────────────────────────────────────────────
  const agentOptions = [
    ...detected.map(a => ({ value: a.id, label: a.name, hint: 'detected' })),
    ...undetected.map(a => ({ value: a.id, label: a.name, hint: 'not detected' })),
  ];

  const selectedIds = await p.multiselect({
    message: 'Install for which agents?  ' + kleur.dim('space = toggle  ·  a = all  ·  enter = confirm'),
    options: agentOptions,
    initialValues: detected.map(a => a.id),
    required: true,
  });

  if (p.isCancel(selectedIds)) { p.cancel('Cancelled.'); process.exit(0); }

  // ── Select model ───────────────────────────────────────────────────────────
  const modelChoice = await p.select({
    message: 'Arabic quality-check model?  ' + kleur.dim('enter = Fanar (recommended)'),
    options: MODELS.map(m => ({ value: m.value, label: m.label, hint: m.hint })),
    initialValue: 'fanar',
  });

  if (p.isCancel(modelChoice)) { p.cancel('Cancelled.'); process.exit(0); }

  const model = MODELS.find(m => m.value === modelChoice);

  // ── Ask for API key inline ─────────────────────────────────────────────────
  let apiKey = '';
  if (model.value !== 'custom') {
    p.log.info(kleur.dim(`Get your key at: ${model.hint}`));
    const keyInput = await p.text({
      message: `Paste your ${model.label.split('—')[0].trim()} API key:`,
      placeholder: 'sk-… or press Enter to skip and add later',
      validate: v => undefined,   // always valid — skip is fine
    });
    if (p.isCancel(keyInput)) { p.cancel('Cancelled.'); process.exit(0); }
    apiKey = (keyInput || '').trim();
  }

  // ── Write global .env config (with key if provided) ────────────────────────
  writeEnvConfig(model, apiKey);

  // ── Auto-add to shell config ───────────────────────────────────────────────
  const shellConfig = detectShellConfig();
  let sourcedShell = false;

  if (!isAlreadySourced(shellConfig)) {
    const addToShell = await p.confirm({
      message: `Add config to ${kleur.cyan(shellConfig)} so it loads automatically?`,
      initialValue: true,
    });
    if (p.isCancel(addToShell)) { p.cancel('Cancelled.'); process.exit(0); }
    if (addToShell) {
      addToShellConfig(shellConfig);
      sourcedShell = true;
    }
  } else {
    sourcedShell = true;   // already there from a previous run
  }

  // ── Install skill files ────────────────────────────────────────────────────
  const spinner = p.spinner();
  spinner.start('Copying skill files…');

  const results = [];
  for (const id of selectedIds) {
    const agent = AGENTS.find(a => a.id === id);
    try {
      installAgent(agent);
      results.push({ agent, ok: true });
    } catch (err) {
      results.push({ agent, ok: false, err: err.message });
    }
  }

  spinner.stop('Skill files installed');

  // ── Show per-agent results ─────────────────────────────────────────────────
  for (const { agent, ok, err } of results) {
    if (ok) {
      p.log.success(`${kleur.bold(agent.name)}  →  ${kleur.dim(agent.installTarget())}`);
      if (agent.note) p.log.info(kleur.dim('    ' + agent.note));
    } else {
      p.log.error(`${agent.name}  failed: ${err}`);
    }
  }

  // ── Outro ──────────────────────────────────────────────────────────────────
  console.log('');

  if (!apiKey && model.value !== 'custom') {
    p.note(
      [
        `You skipped the API key. Add it any time:`,
        '',
        `  1. Open ${kleur.cyan(GLOBAL_ENV_FILE)}`,
        `  2. Replace the placeholder on the ${kleur.yellow(model.envKey)} line`,
        `  3. Get your key at: ${kleur.dim(model.hint)}`,
      ].join('\n'),
      '⚠  API key missing'
    );
  }

  const reloadNote = sourcedShell
    ? `Run ${kleur.cyan(`source ${shellConfig}`)} in your current terminal, or open a new one.`
    : `Manually add this to your shell config:\n  ${kleur.dim(`source "${GLOBAL_ENV_FILE}"`)}`;

  p.outro(
    [
      kleur.green('✓  All done!'),
      '',
      reloadNote,
      '',
      'Then open any project and ask your agent:',
      kleur.cyan('  "review Arabic UI"'),
      kleur.cyan('  "find hardcoded Arabic strings"'),
      kleur.cyan('  /arabic-review'),
    ].join('\n')
  );
}

main().catch(err => {
  console.error(kleur.red('\nError: ') + err.message);
  process.exit(1);
});
