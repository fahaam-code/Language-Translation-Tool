# CodeAlpha — Language Translation Tool

**CodeAlpha AI Internship · Task 1**

A Flask web application that translates text between 100+ languages, with
auto-detection, a copy button, and text-to-speech playback.

## ✨ Features

- **Translate text** between 100+ languages via the Google Translate API
  (through the free [`deep-translator`](https://deep-translator.readthedocs.io/) library)
- **Auto-detect** the source language — or pick it manually
- **Swap languages** (and the text) with one click
- **📋 Copy** the translation to the clipboard
- **🔊 Text-to-speech** — listen to the translation in the target language
  (Web Speech API, no extra dependencies)
- Character counter, loading state, and friendly error messages
- Responsive dark UI

## 🛠️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Python, Flask                       |
| Translation | `deep-translator` (Google Translate API) |
| Detection | `langdetect` (via deep-translator)  |
| Frontend  | HTML, CSS, vanilla JavaScript       |

## 🚀 Setup & Run

```bash
# 1. Create and activate a virtual environment
py -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the app
python app.py
```

Then open **http://127.0.0.1:5000** in your browser.

> An internet connection is required — translation requests go to the
> Google Translate endpoint.

## 📁 Project Structure

```
CodeAlpha_LanguageTranslationTool/
├── app.py                  # Flask routes (/ , /api/translate, /api/detect)
├── templates/
│   └── index.html          # Main UI page
├── static/
│   ├── style.css           # Styling
│   └── script.js           # Front-end logic (translate, copy, TTS, swap)
├── requirements.txt
└── README.md
```

## 🔌 API

| Endpoint          | Method | Body                                   | Response                     |
|-------------------|--------|----------------------------------------|------------------------------|
| `/api/translate`  | POST   | `{"text", "source", "target"}`         | `{"translated", ...}`        |
| `/api/detect`     | POST   | `{"text"}`                             | `{"code", "name"}`           |

## 📸 Screenshot

_(Add a screenshot of the running app here before submitting — e.g. a
translation from English to Spanish.)_

---
Built as part of the [CodeAlpha](https://www.codealpha.tech/) AI Internship.
