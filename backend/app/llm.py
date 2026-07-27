"""
Thin wrapper around the Groq SDK. Kept in one place so every LangGraph node
calls the same function instead of re-implementing client setup, retries,
and JSON parsing.
"""
import json
import re
from groq import Groq

from app.config import get_settings

settings = get_settings()
_client = Groq(api_key=settings.groq_api_key) if settings.groq_api_key else None


def _extract_json(raw: str) -> dict:
    """LLMs sometimes wrap JSON in prose or code fences — pull the object out."""
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        raise ValueError(f"No JSON object found in model output: {raw[:200]}")
    return json.loads(match.group(0))


def call_json(model: str, system: str, user: str, temperature: float = 0.2) -> dict:
    """Call Groq's chat completion API and parse a JSON object out of the reply."""
    if _client is None:
        raise RuntimeError("GROQ_API_KEY is not set")

    response = _client.chat.completions.create(
        model=model,
        temperature=temperature,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        response_format={"type": "json_object"},
    )
    content = response.choices[0].message.content
    return _extract_json(content)


def call_text(model: str, system: str, user: str, temperature: float = 0.3) -> str:
    if _client is None:
        raise RuntimeError("GROQ_API_KEY is not set")

    response = _client.chat.completions.create(
        model=model,
        temperature=temperature,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    )
    return response.choices[0].message.content.strip()
