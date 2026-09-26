"""Language Translation Tool.

Flask web app that translates text between 100+ languages using the free
Google Translate API (via the deep-translator library).

Features
--------
* Source / target language dropdowns (with auto-detect)
* One-click language & text swap
* Clear text & character counter
* Clean, minimal beige UI
"""

from __future__ import annotations

import logging
import time

from deep_translator import GoogleTranslator, MyMemoryTranslator
from deep_translator.exceptions import (
    LanguageNotSupportedException,
    NotValidPayload,
)

try:  # MyMemory needs full locale codes (en-GB), map them from 2-letter codes
    from deep_translator.constants import MY_MEMORY_LANGUAGES_TO_CODES as _MM_LANGS
except ImportError:  # pragma: no cover
    _MM_LANGS = {}
from flask import Flask, jsonify, render_template, request
from langdetect import LangDetectException, detect as langdetect_detect

app = Flask(__name__)

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("translation-tool")

MAX_CHARS = 5000
GOOGLE_RETRIES = 2  # free endpoint occasionally throttles — retry briefly


def _supported_languages() -> dict[str, str]:
    """Return a {language_name: language_code} mapping from deep-translator."""
    return GoogleTranslator().get_supported_languages(as_dict=True)


@app.get("/")
def index():
    languages = sorted(_supported_languages().items(), key=lambda item: item[0].lower())
    return render_template("index.html", languages=languages)


def _detect_language(text: str) -> str | None:
    """Best-effort local language detection (langdetect, used for fallback engine)."""
    try:
        return langdetect_detect(text)
    except LangDetectException:
        return None


def _translate_with_google(text: str, source: str, target: str) -> str:
    """Translate via Google, retrying briefly if the free endpoint throttles."""
    last_exc: Exception | None = None
    for attempt in range(GOOGLE_RETRIES):
        try:
            return GoogleTranslator(source=source, target=target).translate(text)
        except Exception as exc:
            last_exc = exc
            time.sleep(0.8 * (attempt + 1))
    raise last_exc  # type: ignore[misc]


def _mymemory_locale(code: str) -> str:
    """Map a 2-letter code ('en') to a MyMemory locale ('en-GB')."""
    code = (code or "").lower()
    for locale in _MM_LANGS.values():
        if locale.lower() == code:
            return locale
    for locale in _MM_LANGS.values():
        if locale.split("-")[0].lower() == code:
            return locale
    raise LanguageNotSupportedException(f"Language code '{code}' is not supported.")


def _chunks(text: str, size: int = 450):
    """Split text into word-safe chunks (MyMemory allows ~500 chars/request)."""
    words, current, length = text.split(), [], 0
    for word in words:
        if current and length + len(word) + 1 > size:
            yield " ".join(current)
            current, length = [], 0
        current.append(word)
        length += len(word) + 1
    if current:
        yield " ".join(current)


def _translate_fallback(text: str, source: str, target: str) -> str:
    """Fallback engine (MyMemory) — needs a concrete source language."""
    resolved = source if source != "auto" else (_detect_language(text) or "en")
    translator = MyMemoryTranslator(
        source=_mymemory_locale(resolved), target=_mymemory_locale(target)
    )
    return " ".join(translator.translate(chunk) for chunk in _chunks(text))


@app.post("/api/translate")
def translate():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    source = (data.get("source") or "auto").strip() or "auto"
    target = (data.get("target") or "").strip()

    if not text:
        return jsonify(error="Please enter some text to translate."), 400
    if not target:
        return jsonify(error="Please choose a target language."), 400
    if len(text) > MAX_CHARS:
        return jsonify(error=f"Text is too long — the limit is {MAX_CHARS:,} characters."), 400

    engine = "google"
    try:
        translated = _translate_with_google(text, source, target)
    except (LanguageNotSupportedException, NotValidPayload) as exc:
        return jsonify(error=str(exc)), 400
    except Exception:
        logger.warning("Google translate failed — trying MyMemory fallback")
        engine = "mymemory (fallback)"
        try:
            translated = _translate_fallback(text, source, target)
        except Exception:
            logger.exception("Translation request failed")
            return jsonify(error="Translation failed. Check your internet connection and try again."), 502

    return jsonify(translated=translated, source=source, target=target, engine=engine)


if __name__ == "__main__":
    app.run(debug=True)
