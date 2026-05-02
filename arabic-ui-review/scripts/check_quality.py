#!/usr/bin/env python3
"""
Check Arabic string quality using a configured LLM.
Config is read (in priority order) from:
  1. Environment variables (FANAR_API_KEY / ARABIC_REVIEW_* vars)
  2. ~/.arabic-review/.env  (written by the npx installer)
  3. .arabic-review.json in current directory (legacy)

Usage: python check_quality.py --strings-file strings.json --context "UI Components"
"""

import json
import os
import re
import sys
import argparse
from pathlib import Path


# ─── Config loading ───────────────────────────────────────────────────────────

def _load_dotenv(path: Path) -> dict:
    """Parse a simple KEY=VALUE .env file."""
    env = {}
    if not path.exists():
        return env
    for line in path.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, _, value = line.partition('=')
        env[key.strip()] = value.strip()
    return env


def load_config() -> dict:
    """
    Build config from env vars, ~/.arabic-review/.env, and .arabic-review.json.
    Returns a dict with api_key, api_base, model_id.
    Raises SystemExit with a helpful message if api_key is missing.
    """
    # 1. Load ~/.arabic-review/.env (written by installer)
    global_env = _load_dotenv(Path.home() / '.arabic-review' / '.env')

    # 2. Load project .arabic-review.json (legacy)
    legacy_json = {}
    legacy_path = Path('.arabic-review.json')
    if legacy_path.exists():
        try:
            legacy_json = json.loads(legacy_path.read_text())
        except json.JSONDecodeError:
            pass

    def get(key, fallback=None):
        """Priority: shell env → global .env file → legacy JSON → fallback."""
        return (
            os.environ.get(key)
            or global_env.get(key)
            or fallback
        )

    api_base = get('ARABIC_REVIEW_API_BASE', legacy_json.get('api_base', 'https://api.fanar.qa/v1'))
    model_id = get('ARABIC_REVIEW_MODEL_ID', legacy_json.get('model_id', 'Fanar-S-1-Turbo'))

    # API key: try model-specific var first, then generic var, then legacy JSON
    model_name = get('ARABIC_REVIEW_MODEL', legacy_json.get('model', 'fanar'))
    model_key_map = {
        'fanar':   'FANAR_API_KEY',
        'openai':  'OPENAI_API_KEY',
        'claude':  'ANTHROPIC_API_KEY',
        'groq':    'GROQ_API_KEY',
    }
    specific_key_var = model_key_map.get(model_name, 'ARABIC_REVIEW_API_KEY')

    api_key = (
        os.environ.get(specific_key_var)
        or global_env.get(specific_key_var)
        or os.environ.get('ARABIC_REVIEW_API_KEY')
        or global_env.get('ARABIC_REVIEW_API_KEY')
        or legacy_json.get('api_key')
    )

    if not api_key or 'your_' in api_key:
        print(
            '\nERROR: No API key found.\n'
            f'Set {specific_key_var} in your environment, or edit:\n'
            f'  ~/.arabic-review/.env\n\n'
            'Re-run the installer:  npx arabic-ui-review\n',
            file=sys.stderr,
        )
        sys.exit(1)

    return {'api_key': api_key, 'api_base': api_base, 'model_id': model_id}


# ─── LLM call ─────────────────────────────────────────────────────────────────

def check_batch(strings: list[str], context: str, config: dict) -> list[dict]:
    try:
        import httpx
    except ImportError:
        print('ERROR: httpx not installed. Run: pip install httpx', file=sys.stderr)
        sys.exit(1)

    headers = {
        'Authorization': f"Bearer {config['api_key']}",
        'Content-Type': 'application/json',
    }

    numbered = '\n'.join(f'{i + 1}. "{s}"' for i, s in enumerate(strings))

    payload = {
        'model': config['model_id'],
        'messages': [
            {
                'role': 'user',
                'content': (
                    'أنت مراجع لغوي متخصص في واجهات المستخدم العربية.\n'
                    'راجع النصوص العربية التالية من تطبيق برمجي.\n'
                    f'السياق: {context}\n\n'
                    'لكل نص، حدد: الأخطاء الإملائية، الأخطاء النحوية، عدم مناسبة المستوى الرسمي، '
                    'مشاكل اتجاه النص (RTL)، وأي مشاكل جودة أخرى.\n'
                    'إذا كان النص صحيحاً تماماً، أعد مصفوفة issues فارغة.\n\n'
                    f'النصوص:\n{numbered}\n\n'
                    'أجب بصيغة JSON فقط، بدون أي نص إضافي:\n'
                    '[{"index": 1, "issues": ["وصف المشكلة"], '
                    '"severity": "error|warning|info", '
                    '"suggested_fix": "النص المقترح أو null"}]'
                ),
            }
        ],
        'temperature': 0.1,
        'max_tokens': 2000,
    }

    try:
        response = httpx.post(
            f"{config['api_base']}/chat/completions",
            headers=headers,
            json=payload,
            timeout=45,
        )
        response.raise_for_status()
        content = response.json()['choices'][0]['message']['content']
        match = re.search(r'\[.*\]', content, re.DOTALL)
        return json.loads(match.group()) if match else []
    except httpx.HTTPStatusError as e:
        print(f'API error {e.response.status_code}: {e.response.text}', file=sys.stderr)
        return []
    except Exception as e:
        print(f'LLM call failed: {e}', file=sys.stderr)
        return []


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Check Arabic text quality via LLM')
    parser.add_argument('--strings-file', required=True,
                        help='JSON file: array of strings or objects with "text" field')
    parser.add_argument('--context', default='UI text',
                        help='What part of the app these strings are from')
    parser.add_argument('--batch-size', type=int, default=20)
    parser.add_argument('--output', default='-', help='Output file (- = stdout)')
    # Legacy flag kept for backwards compat but ignored (config auto-detected)
    parser.add_argument('--config', default=None, help='(legacy) path to .arabic-review.json')
    args = parser.parse_args()

    config = load_config()

    raw = json.loads(Path(args.strings_file).read_text(encoding='utf-8'))
    if isinstance(raw, list) and raw and isinstance(raw[0], str):
        strings = raw
    elif isinstance(raw, list) and raw and isinstance(raw[0], dict):
        strings = [item.get('text') or item.get('value') or '' for item in raw]
    else:
        print('ERROR: strings-file must be a JSON array of strings or objects with "text" field',
              file=sys.stderr)
        sys.exit(1)

    all_results = []
    for i in range(0, len(strings), args.batch_size):
        batch = strings[i:i + args.batch_size]
        print(f'Checking batch {i // args.batch_size + 1} ({len(batch)} strings)…', file=sys.stderr)
        results = check_batch(batch, args.context, config)
        for r in results:
            abs_idx = i + r['index'] - 1
            r['index'] = abs_idx
            r['original_text'] = strings[abs_idx] if abs_idx < len(strings) else ''
        all_results.extend(results)

    summary = {
        'total_strings': len(strings),
        'strings_with_issues': sum(1 for r in all_results if r.get('issues')),
        'errors':   sum(1 for r in all_results if r.get('severity') == 'error'),
        'warnings': sum(1 for r in all_results if r.get('severity') == 'warning'),
        'info':     sum(1 for r in all_results if r.get('severity') == 'info'),
        'results':  all_results,
    }

    out = json.dumps(summary, ensure_ascii=False, indent=2)
    if args.output == '-':
        print(out)
    else:
        Path(args.output).write_text(out, encoding='utf-8')
        print(f'Saved to: {args.output}', file=sys.stderr)

    print(f"Done. {summary['errors']} errors, {summary['warnings']} warnings.", file=sys.stderr)


if __name__ == '__main__':
    main()
