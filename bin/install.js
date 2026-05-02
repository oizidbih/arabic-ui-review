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
    installTarget: () => join(HOME, '.claude', 'skills', 'arabic-ui-review'),
    note: null,
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
    format: 'markdown',
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
    format: 'markdown',
    installTarget: () => join(HOME, '.config', 'opencode', 'rules'),
    note: null,
  },
  {
    id: 'aider',
    name: 'Aider',
    detect: () => which('aider'),
    format: 'markdown',
    installTarget: () => join(HOME, '.aider', 'rules'),
    note: null,
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
    format: 'markdown',
    installTarget: () => join(HOME, '.amp', 'rules'),
    note: null,
  },
  {
    id: 'zed',
    name: 'Zed AI',
    detect: () =>
      existsSync(join(HOME, '.config', 'zed')) ||
      existsSync(join(HOME, 'Library', 'Application Support', 'Zed')),
    format: 'markdown',
    installTarget: () => join(HOME, '.config', 'zed', 'rules'),
    note: null,
  },
];

// ─── Model definitions ────────────────────────────────────────────────────────

const MODELS = [
  {
    value: 'fanar',
    label: 'Fanar  — Arabic-specialized LLM (recommended)',
    hint: 'Get key at https://api.fanar.qa',
    apiBase: 'https://api.fanar.qa/v1',
    modelId: 'Fanar-S-1-Turbo',
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

function installAgent(agent) {
  const target = agent.installTarget();

  switch (agent.format) {
    case 'skill-dir': {
      ensureDir(target);
      cpSync(SKILL_SRC, target, { recursive: true });
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

function writeEnvConfig(model) {
  ensureDir(GLOBAL_CONFIG_DIR);

  const lines = [
    '# Arabic UI Review — LLM config',
    '# Generated by: npx arabic-ui-review',
    '# Edit this file to change model or add your API key.',
    '',
    `ARABIC_REVIEW_MODEL=${model.value}`,
  ];

  if (model.apiBase)  lines.push(`ARABIC_REVIEW_API_BASE=${model.apiBase}`);
  if (model.modelId)  lines.push(`ARABIC_REVIEW_MODEL_ID=${model.modelId}`);

  lines.push('');
  lines.push('# ↓  Replace the placeholder with your real API key');
  lines.push(`${model.envKey}=your_${model.value}_api_key_here`);
  lines.push('');

  writeFileSync(GLOBAL_ENV_FILE, lines.join('\n'), 'utf8');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

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

  // ── Write global .env config ───────────────────────────────────────────────
  writeEnvConfig(model);

  // ── Install for each selected agent ───────────────────────────────────────
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

  // ── .env instructions ──────────────────────────────────────────────────────
  console.log('');
  p.note(
    [
      `Config: ${kleur.bold(GLOBAL_ENV_FILE)}`,
      '',
      kleur.yellow(`  ARABIC_REVIEW_MODEL=${model.value}`),
      model.apiBase  ? kleur.yellow(`  ARABIC_REVIEW_API_BASE=${model.apiBase}`) : '',
      model.modelId  ? kleur.yellow(`  ARABIC_REVIEW_MODEL_ID=${model.modelId}`) : '',
      kleur.yellow(`  ${model.envKey}=your_${model.value}_api_key_here`),
      '',
      kleur.bold('→ Open the file and replace the placeholder with your real key.'),
      kleur.dim(`  ${model.hint}`),
    ].filter(Boolean).join('\n'),
    'API Key'
  );

  // ── Next steps ─────────────────────────────────────────────────────────────
  p.outro(
    [
      kleur.bold('Next steps:'),
      '',
      `  1.  Edit  ${kleur.cyan(GLOBAL_ENV_FILE)}`,
      `      Fill in  ${kleur.yellow(model.envKey)}`,
      '',
      '  2.  Copy those vars to your project .env, or source globally:',
      kleur.dim(`      echo 'source ${GLOBAL_ENV_FILE}' >> ~/.zshrc`),
      '',
      '  3.  Open a project and ask your agent:',
      kleur.cyan('      "review Arabic UI"'),
      kleur.cyan('      "find hardcoded Arabic strings"'),
      kleur.cyan('      "audit my Arabic translations"'),
    ].join('\n')
  );
}

main().catch(err => {
  console.error(kleur.red('\nError: ') + err.message);
  process.exit(1);
});
