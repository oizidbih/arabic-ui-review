#!/usr/bin/env python3
"""
Search for Arabic text in a codebase.
Usage: python search_arabic.py [--root .] [--segment all|components|pages|notifications|errors|forms|templates|api|config]
"""

import re
import os
import sys
import json
import argparse
from pathlib import Path

ARABIC_PATTERN = re.compile(
    r'[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]+'
)

SKIP_DIRS = {
    'node_modules', '.git', 'dist', 'build', '.next', 'vendor',
    '__pycache__', '.dart_tool', '.pub-cache', 'Pods', '.gradle',
    'DerivedData', 'coverage', '.nyc_output', 'out', '.turbo'
}

SOURCE_EXTENSIONS = {
    '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte',
    '.py', '.rb', '.php', '.dart', '.swift', '.kt', '.java',
    '.html', '.htm', '.xml', '.yml', '.yaml', '.json',
    '.strings', '.arb', '.po', '.pot'
}

SEGMENT_PATTERNS = {
    'components': [r'component', r'widget', r'ui'],
    'pages':      [r'page', r'screen', r'view', r'route'],
    'notifications': [r'notif', r'alert', r'toast', r'snack', r'push'],
    'errors':     [r'error', r'exception', r'validat', r'warn'],
    'forms':      [r'form', r'input', r'field', r'label', r'placeholder'],
    'templates':  [r'template', r'email', r'sms', r'mail'],
    'api':        [r'api', r'controller', r'service', r'endpoint', r'handler'],
    'config':     [r'constant', r'config', r'setting', r'env'],
}


def file_matches_segment(filepath: str, segment: str) -> bool:
    if segment == 'all':
        return True
    patterns = SEGMENT_PATTERNS.get(segment, [])
    lower = filepath.lower()
    return any(re.search(p, lower) for p in patterns)


def scan_file(filepath: Path) -> list[dict]:
    results = []
    try:
        text = filepath.read_text(encoding='utf-8', errors='ignore')
        for lineno, line in enumerate(text.splitlines(), 1):
            matches = list(ARABIC_PATTERN.finditer(line))
            if matches:
                arabic_strings = [m.group() for m in matches]
                results.append({
                    'file': str(filepath),
                    'line': lineno,
                    'content': line.strip(),
                    'arabic_strings': arabic_strings,
                })
    except (PermissionError, OSError):
        pass
    return results


def scan_codebase(root: Path, segment: str = 'all') -> list[dict]:
    all_results = []
    for dirpath, dirnames, filenames in os.walk(root):
        # prune skip dirs in-place
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith('.')]

        for filename in filenames:
            filepath = Path(dirpath) / filename
            if filepath.suffix.lower() not in SOURCE_EXTENSIONS:
                continue
            rel_path = str(filepath.relative_to(root))
            if not file_matches_segment(rel_path, segment):
                continue
            results = scan_file(filepath)
            all_results.extend(results)

    return all_results


def group_by_segment(results: list[dict]) -> dict[str, list[dict]]:
    grouped = {seg: [] for seg in SEGMENT_PATTERNS}
    grouped['other'] = []

    for result in results:
        assigned = False
        for seg, patterns in SEGMENT_PATTERNS.items():
            lower = result['file'].lower()
            if any(re.search(p, lower) for p in patterns):
                grouped[seg].append(result)
                assigned = True
                break
        if not assigned:
            grouped['other'].append(result)

    return {k: v for k, v in grouped.items() if v}


def main():
    parser = argparse.ArgumentParser(description='Search for Arabic text in codebase')
    parser.add_argument('--root', default='.', help='Root directory to scan')
    parser.add_argument('--segment', default='all',
                        choices=['all'] + list(SEGMENT_PATTERNS.keys()),
                        help='Limit scan to a logical segment')
    parser.add_argument('--output', default='-', help='Output file (- for stdout)')
    parser.add_argument('--format', default='json', choices=['json', 'text'],
                        help='Output format')
    args = parser.parse_args()

    root = Path(args.root).resolve()
    print(f"Scanning: {root} (segment: {args.segment})", file=sys.stderr)

    results = scan_codebase(root, args.segment)

    if args.segment == 'all':
        output = {
            'total_hits': len(results),
            'by_segment': group_by_segment(results),
            'raw': results
        }
    else:
        output = {
            'segment': args.segment,
            'total_hits': len(results),
            'results': results
        }

    if args.format == 'json':
        text = json.dumps(output, ensure_ascii=False, indent=2)
    else:
        lines = []
        for r in results:
            strings = ', '.join(f'"{s}"' for s in r['arabic_strings'])
            lines.append(f"{r['file']}:{r['line']}: {strings}")
            lines.append(f"  {r['content']}")
        text = '\n'.join(lines)

    if args.output == '-':
        print(text)
    else:
        Path(args.output).write_text(text, encoding='utf-8')
        print(f"Results saved to: {args.output}", file=sys.stderr)

    print(f"Found {len(results)} lines with Arabic text.", file=sys.stderr)


if __name__ == '__main__':
    main()
