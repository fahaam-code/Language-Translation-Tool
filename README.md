# Language Translation Tool

A clean, minimal, and modern web application that translates text between 100+ languages with automatic detection and seamless language swapping.

## ✨ Features

- **Multi-language translation** across 100+ languages via Google Translate (through [`deep-translator`](https://deep-translator.readthedocs.io/))
- **Automatic language detection** with manual override option
- **One-click language & text swap**
- **Live character counter** and input clear button
- **Aesthetic warm beige UI** with responsive layout for mobile and desktop

## 🛠️ Tech Stack

| Layer       | Technology                                |
|-------------|-------------------------------------------|
| Backend     | Python, Flask                             |
| Translation | `deep-translator` (Google Translate API)  |
| Detection   | `langdetect` (fallback engine)            |
| Frontend    | HTML5, Vanilla CSS (Warm Beige), JavaScript |

## 🚀 Setup & Run

```bash
# 1. Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the app
python app.py
```

Then open **http://127.0.0.1:5000** in your browser.

> An active internet connection is required for fetching translations.

## 📁 Project Structure

```
LanguageTranslationTool/
├── app.py                  # Flask application & /api/translate route
├── templates/
│   └── index.html          # Clean application interface
├── static/
│   ├── style.css           # Warm beige aesthetic design system
│   └── script.js           # Client-side translation & interaction logic
├── requirements.txt
└── README.md
```

## 🔌 API Endpoints

| Endpoint          | Method | Payload                                | Response                      |
|-------------------|--------|----------------------------------------|-------------------------------|
| `/api/translate`  | POST   | `{"text", "source", "target"}`         | `{"translated", ...}`         |
