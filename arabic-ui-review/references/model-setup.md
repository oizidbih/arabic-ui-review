# Arabic LLM Model Setup

## Config file: `.arabic-review.json`

Place in project root (add to `.gitignore` — contains your API key):

```json
{
  "model": "fanar",
  "api_key": "YOUR_KEY_HERE",
  "api_base": "https://api.fanar.qa/v1",
  "model_id": "Fanar-S-1-Turbo"
}
```

## Fanar API (default)

Fanar is a Qatar-based Arabic-specialized LLM. Docs: https://api.fanar.qa/docs

**Get API key:** Register at https://api.fanar.qa

**API call format (OpenAI-compatible):**

```python
import httpx, json

def check_arabic_quality(strings: list[str], context: str, config: dict) -> list[dict]:
    headers = {
        "Authorization": f"Bearer {config['api_key']}",
        "Content-Type": "application/json"
    }
    
    numbered = "\n".join(f'{i+1}. "{s}"' for i, s in enumerate(strings))
    
    payload = {
        "model": config.get("model_id", "Fanar-S-1-Turbo"),
        "messages": [
            {
                "role": "user",
                "content": f"""أنت مراجع لغوي متخصص في واجهات المستخدم العربية.
راجع النصوص العربية التالية من تطبيق برمجي.
السياق: {context}

لكل نص، حدد: الأخطاء الإملائية، الأخطاء النحوية، عدم مناسبة المستوى الرسمي،
مشاكل اتجاه النص (RTL)، وأي مشاكل جودة أخرى.

النصوص:
{numbered}

أجب بصيغة JSON فقط:
[{{"index": 1, "issues": ["وصف المشكلة"], "severity": "error|warning|info", "suggested_fix": "النص المقترح أو null"}}]"""
            }
        ],
        "temperature": 0.1,
        "max_tokens": 2000
    }
    
    response = httpx.post(
        f"{config['api_base']}/chat/completions",
        headers=headers,
        json=payload,
        timeout=30
    )
    response.raise_for_status()
    content = response.json()["choices"][0]["message"]["content"]
    
    # Extract JSON from response
    import re
    match = re.search(r'\[.*\]', content, re.DOTALL)
    if match:
        return json.loads(match.group())
    return []
```

## Alternative Models

Change `api_base` and `model_id` in `.arabic-review.json` to use:

| Model | api_base | model_id |
|-------|----------|----------|
| **Fanar (default)** | `https://api.fanar.qa/v1` | `Fanar-S-1-Turbo` |
| **OpenAI GPT-4o** | `https://api.openai.com/v1` | `gpt-4o` |
| **Anthropic Claude** | Use Anthropic SDK directly | `claude-sonnet-4-6` |
| **Groq (fast)** | `https://api.groq.com/openai/v1` | `llama-3.1-70b-versatile` |
| **Together AI** | `https://api.together.xyz/v1` | `mistralai/Mixtral-8x7B` |

## Calling via Bash

If you prefer running the quality check as a script rather than inline:

```bash
python scripts/check_quality.py \
  --config .arabic-review.json \
  --strings-file /tmp/arabic_strings.json \
  --context "UI Components"
```
