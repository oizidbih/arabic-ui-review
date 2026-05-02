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

RULE_CHECK_ORDER = """
افحص كل نص بالترتيب التالي:

1. الإملاء (1.x):
   - الهمزة في بداية الكلمة: همزة وصل vs همزة قطع
   - الهمزة المتوسطة: تحديد المقعد الصحيح (ي/و/ا/بدون مقعد) وفق أقوى الحركات
   - الهمزة المتطرفة: المقعد بحسب آخر حركة قبلها
   - الهاء والتاء المربوطة: التمييز بين ة وه في نهاية الكلمة
   - التاء المربوطة والتاء المفتوحة: ة (تُنطق هاء في الوقف) vs ت (تُنطق تاء دائماً)
   - الحروف المتقاربة صوتياً: ذ/ز/ظ، س/ص، ض/ظ، ث/س، ح/هـ، ع/ء
   - الحروف المتشابهة شكلاً: ر/ز، ب/ت/ث/ن/ي، ح/ج/خ، ع/غ، ف/ق، د/ذ
   - أخطاء متنوعة: ألف التفريق (واو الجماعة)، الألف اللينة، هذا/ذلك/لكن
   - أسماء الأعلام والكيانات: التحقق من الرسم الصحيح المعتمد
   - الكلمات الأجنبية: التحقق من اتساق التعريب مع الاتفاقيات الراسخة

2. التفقيط (2.x) — فقط إن احتوى النص على أرقام أو مبالغ مالية:
   - المبالغ الصحيحة: التوافق في التذكير/التأنيث والصياغة الصحيحة
   - المبالغ الكسرية: الربط بـ"و" والتوافق مع وحدة الكسر

3. القواعد (3.x):
   - الحالات الإعرابية للأعداد: تمييز العدد (3-10 جمع مجرور، 11-99 مفرد منصوب، مئة/ألف مفرد مجرور)
   - الفعل المضارع: المنصوب (بعد أن/لن/كي) vs المجزوم (بعد لم/لا الناهية) vs المرفوع (الأصل)
   - المجرورات: جمع المذكر السالم (ين)، المثنى (ين)، المفرد (كسرة)
   - إنّ وأخواتها: اسم إنّ منصوب وخبرها مرفوع، مع كل التوابع (صفة، بدل، مؤخر)
   - كان وأخواتها: اسم كان مرفوع وخبرها منصوب، مع كل التوابع
   - الممنوع من الصرف: فتحة في الجر بدلاً من كسرة، بدون تنوين (أفعل، جموع مفاعل/أفاعل، أعلام خاصة)
   - الكلمات المتغيرة بالإعراب: ذو/ذي/ذا، أبو/أبي/أبا
   - الجملة الاسمية: مبتدأ مرفوع وخبر مرفوع
   - الموافقة عدد/معدود تذكيراً وتأنيثاً (العكس في 3-10، التطابق في 11-12)
   - الموافقة عدد/معدود إفراداً وجمعاً (جمع في 3-10، مفرد منصوب في 11+)
   - كلا/كلتا، أحد/إحدى، ذو/ذات: التوافق مع ما يضاف إليه

4. الصياغة (4.x):
   - "قام بـ + مصدر" → استبدله بالفعل المباشر
   - الكلمات الأجنبية ذات المقابل الفصيح المعتمد (هاتف، حاسوب، بريد إلكتروني...)
   - الكلمات العامية ذات المقابل الفصيح (قليلاً بدل شوية، كثيراً بدل كتير...)
   - حروف الجر مع الأفعال: تحدّث عن/اهتمّ بـ/أسهم في
   - الأفعال المتعدية بدون حرف جر التي استُخدم معها حرف جر زائد
   - الاشتقاقات: اسم الفاعل/المفعول/المصدر الصحيح

5. التشكيل (5.x) — فقط إن احتوى النص على تشكيل:
   - التشكيل الكلي: التحقق من كل حركة
   - تشكيل الأواخر: مطابقة الحالة الإعرابية
   - التشكيل الجزئي: تصحيح ما هو موجود فقط

6. النص القرآني (6.x):
   - تحديد أي اقتباس قرآني أوّلاً
   - التحقق من مطابقته للرسم العثماني (الصلوة، الزكوة، يأيّها...)
   - لا تُطبّق قواعد الإملاء العادية على النص القرآني

7. علامات الترقيم (7.x):
   - الفاصلة ، : قبل العطف بين جمل طويلة، قبل ظروف الزمان (عندما/حين/إذ)، قبل لكن/بل/أمّا، قبل الشرط، قبل الأسماء الموصولة والإشارة، قبل إنّ وأخواتها، بعد نعم/لا/بلى، قبل أي التفسيرية
   - الفاصلة المنقوطة ؛ : قبل إذن/لذلك/ومن ثَمّ/وبالتالي
   - النقطة . : نهاية كل فقرة/جملة تامة، قبل أمّا عند تغيير الموضوع
   - الشرطتان — — : حول الجمل الدعائية المعترضة (رحمه الله، صلى الله عليه وسلم)
   - النقطتان الرأسيتان : : بعد قال/يلي/كالتالي/ما يلي
   - علامة الاستفهام ؟ : بعد كل سؤال مباشر
   - علامة التعجب ! : بعد الجمل التعجبية
"""


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
                    'أنت مراجع لغوي متخصص في واجهات المستخدم العربية ومتمكّن من قواعد اللغة العربية الفصحى.\n'
                    f'راجع النصوص العربية التالية. السياق: {context}\n\n'
                    + RULE_CHECK_ORDER +
                    '\nللمخرجات: أجب بصيغة JSON فقط، بدون أي نص إضافي:\n'
                    '[{\n'
                    '  "index": 1,\n'
                    '  "violations": [\n'
                    '    {\n'
                    '      "rule": "1.1.2",\n'
                    '      "rule_name": "الهمزة المتوسطة",\n'
                    '      "severity": "error|warning|info",\n'
                    '      "found": "الجزء الخاطئ من النص",\n'
                    '      "suggested_fix": "التصحيح المقترح",\n'
                    '      "explanation": "سبب الخطأ باختصار"\n'
                    '    }\n'
                    '  ]\n'
                    '}]\n'
                    'إذا كان النص صحيحاً في جميع النقاط: {"index": N, "violations": []}\n\n'
                    f'النصوص:\n{numbered}'
                ),
            }
        ],
        'temperature': 0.1,
        'max_tokens': 4000,
    }

    try:
        response = httpx.post(
            f"{config['api_base']}/chat/completions",
            headers=headers,
            json=payload,
            timeout=60,
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

    def count_severity(level: str) -> int:
        return sum(
            1 for r in all_results
            for v in r.get('violations', [])
            if v.get('severity') == level
        )

    # Build per-rule-category breakdown
    rule_breakdown: dict[str, int] = {}
    for r in all_results:
        for v in r.get('violations', []):
            cat = v.get('rule', '?').split('.')[0]  # top-level category number
            rule_breakdown[cat] = rule_breakdown.get(cat, 0) + 1

    CATEGORY_NAMES = {
        '1': 'الإملاء',
        '2': 'التفقيط',
        '3': 'القواعد',
        '4': 'الصياغة',
        '5': 'التشكيل',
        '6': 'النص القرآني',
        '7': 'علامات الترقيم',
    }

    summary = {
        'total_strings': len(strings),
        'strings_with_violations': sum(1 for r in all_results if r.get('violations')),
        'errors':   count_severity('error'),
        'warnings': count_severity('warning'),
        'info':     count_severity('info'),
        'by_category': {
            CATEGORY_NAMES.get(k, k): v for k, v in sorted(rule_breakdown.items())
        },
        'results': all_results,
    }

    out = json.dumps(summary, ensure_ascii=False, indent=2)
    if args.output == '-':
        print(out)
    else:
        Path(args.output).write_text(out, encoding='utf-8')
        print(f'Saved to: {args.output}', file=sys.stderr)

    print(
        f"Done. {summary['errors']} errors, {summary['warnings']} warnings, {summary['info']} info.",
        file=sys.stderr,
    )
    if summary['by_category']:
        for cat, count in summary['by_category'].items():
            print(f'  {cat}: {count}', file=sys.stderr)


if __name__ == '__main__':
    main()
