#!/usr/bin/env python3
"""
Check Arabic string quality using a configured LLM (Fanar by default).
Usage: python check_quality.py --config .arabic-review.json --strings-file strings.json --context "UI Components"
"""

import json
import re
import sys
import argparse
import httpx
from pathlib import Path


def load_config(config_path: str) -> dict:
    path = Path(config_path)
    if not path.exists():
        print(f"ERROR: Config file not found: {config_path}", file=sys.stderr)
        print("Create .arabic-review.json with your API key. See references/model-setup.md", file=sys.stderr)
        sys.exit(1)

    config = json.loads(path.read_text())
    if not config.get('api_key') or config['api_key'] == 'YOUR_KEY_HERE':
        print("ERROR: api_key not set in .arabic-review.json", file=sys.stderr)
        sys.exit(1)

    config.setdefault('api_base', 'https://api.fanar.qa/v1')
    config.setdefault('model_id', 'Fanar-S-1-Turbo')
    return config


def check_batch(strings: list[str], context: str, config: dict) -> list[dict]:
    headers = {
        'Authorization': f"Bearer {config['api_key']}",
        'Content-Type': 'application/json',
    }

    numbered = '\n'.join(f'{i+1}. "{s}"' for i, s in enumerate(strings))

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
                    'إذا كان النص صحيحاً، أعد مصفوفة issues فارغة.\n\n'
                    f'النصوص:\n{numbered}\n\n'
                    'أجب بصيغة JSON فقط، بدون أي نص إضافي:\n'
                    '[{"index": 1, "issues": ["وصف المشكلة"], "severity": "error|warning|info", "suggested_fix": "النص المقترح أو null"}]'
                )
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

        # Extract JSON array from response
        match = re.search(r'\[.*\]', content, re.DOTALL)
        if match:
            return json.loads(match.group())
        return []

    except httpx.HTTPStatusError as e:
        print(f"API error {e.response.status_code}: {e.response.text}", file=sys.stderr)
        return []
    except Exception as e:
        print(f"Error calling LLM: {e}", file=sys.stderr)
        return []


def main():
    parser = argparse.ArgumentParser(description='Check Arabic text quality via LLM')
    parser.add_argument('--config', default='.arabic-review.json')
    parser.add_argument('--strings-file', required=True,
                        help='JSON file with list of strings or objects with "text" field')
    parser.add_argument('--context', default='UI text', help='Describe what part of the app these strings are from')
    parser.add_argument('--batch-size', type=int, default=20)
    parser.add_argument('--output', default='-')
    args = parser.parse_args()

    config = load_config(args.config)

    raw = json.loads(Path(args.strings_file).read_text())
    if isinstance(raw, list) and raw and isinstance(raw[0], str):
        strings = raw
    elif isinstance(raw, list) and raw and isinstance(raw[0], dict):
        strings = [item.get('text', item.get('value', '')) for item in raw]
    else:
        print("ERROR: strings-file must be a JSON array of strings or objects with 'text' field", file=sys.stderr)
        sys.exit(1)

    all_results = []
    batch_size = args.batch_size

    for i in range(0, len(strings), batch_size):
        batch = strings[i:i + batch_size]
        print(f"Checking batch {i // batch_size + 1} ({len(batch)} strings)...", file=sys.stderr)
        results = check_batch(batch, args.context, config)

        # re-index to absolute positions
        for r in results:
            r['index'] = r['index'] + i - 1  # 0-based absolute index
            r['original_text'] = strings[r['index']] if r['index'] < len(strings) else ''
        all_results.extend(results)

    issues_only = [r for r in all_results if r.get('issues')]
    summary = {
        'total_strings': len(strings),
        'strings_with_issues': len(issues_only),
        'errors': sum(1 for r in all_results if r.get('severity') == 'error'),
        'warnings': sum(1 for r in all_results if r.get('severity') == 'warning'),
        'info': sum(1 for r in all_results if r.get('severity') == 'info'),
        'results': all_results,
    }

    output_text = json.dumps(summary, ensure_ascii=False, indent=2)
    if args.output == '-':
        print(output_text)
    else:
        Path(args.output).write_text(output_text, encoding='utf-8')
        print(f"Quality check results saved to: {args.output}", file=sys.stderr)

    print(f"Done. {summary['errors']} errors, {summary['warnings']} warnings.", file=sys.stderr)


if __name__ == '__main__':
    main()
