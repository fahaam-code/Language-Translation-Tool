/* Front-end logic for the Language Translation Tool. */
"use strict";

const $ = (id) => document.getElementById(id);

const input = $("input");
const output = $("output");
const sourceSel = $("source");
const targetSel = $("target");
const translateBtn = $("translate-btn");
const swapBtn = $("swap-btn");
const detectBtn = $("detect-btn");
const clearBtn = $("clear-btn");
const copyBtn = $("copy-btn");
const speakBtn = $("speak-btn");
const charCount = $("char-count");
const statusEl = $("status");
const errorEl = $("error");
const detectedEl = $("detected");

const MAX_CHARS = 5000;

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
}

function clearError() {
  errorEl.textContent = "";
  errorEl.classList.add("hidden");
}

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function updateCharCount() {
  charCount.textContent = `${input.value.length.toLocaleString()} / ${MAX_CHARS.toLocaleString()}`;
}

function setBusy(busy) {
  translateBtn.disabled = busy;
  translateBtn.textContent = busy ? "Translating…" : "Translate →";
}

/* ------------------------------------------------------------------ */
/* Translate                                                          */
/* ------------------------------------------------------------------ */

async function translate() {
  const text = input.value.trim();
  clearError();
  if (!text) {
    showError("Please enter some text to translate.");
    input.focus();
    return;
  }

  setBusy(true);
  statusEl.textContent = "";
  try {
    const data = await postJSON("/api/translate", {
      text,
      source: sourceSel.value,
      target: targetSel.value,
    });
    output.textContent = data.translated;
    copyBtn.disabled = false;
    speakBtn.disabled = false;
    const engineNote = data.engine && data.engine.includes("fallback") ? " · via fallback engine" : "";
    statusEl.textContent = `✓ Translated to ${targetSel.options[targetSel.selectedIndex].text}${engineNote}`;
  } catch (err) {
    showError(err.message);
  } finally {
    setBusy(false);
  }
}

/* ------------------------------------------------------------------ */
/* Swap languages                                                     */
/* ------------------------------------------------------------------ */

function swapLanguages() {
  const s = sourceSel.value;
  const t = targetSel.value;
  if (s === "auto") {
    // Swapping from auto-detect: use the detected language if we know it.
    const detected = detectedEl.dataset.code;
    sourceSel.value = detected || "en";
  } else {
    sourceSel.value = t;
  }
  targetSel.value = s === "auto" ? "en" : s;
  detectedEl.textContent = "";
  delete detectedEl.dataset.code;

  // If both panes have content, swap the text too.
  if (output.textContent && input.value) {
    const temp = input.value;
    input.value = output.textContent;
    output.textContent = "";
    copyBtn.disabled = true;
    speakBtn.disabled = true;
    statusEl.textContent = "";
    updateCharCount();
  }
}

/* ------------------------------------------------------------------ */
/* Detect language                                                    */
/* ------------------------------------------------------------------ */

async function detectLanguage() {
  const text = input.value.trim();
  clearError();
  if (!text) {
    showError("Enter some text first, then press Detect.");
    return;
  }
  detectedEl.textContent = "Detecting…";
  try {
    const data = await postJSON("/api/detect", { text });
    detectedEl.textContent = `Detected: ${data.name}`;
    detectedEl.dataset.code = data.code;
  } catch (err) {
    detectedEl.textContent = "";
    showError(err.message);
  }
}

/* ------------------------------------------------------------------ */
/* Copy + text-to-speech                                              */
/* ------------------------------------------------------------------ */

async function copyOutput() {
  const text = output.textContent;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for browsers without the async clipboard API.
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  const original = copyBtn.textContent;
  copyBtn.textContent = "✓ Copied";
  setTimeout(() => (copyBtn.textContent = original), 1200);
}

function speakOutput() {
  const text = output.textContent;
  if (!text || !("speechSynthesis" in window)) {
    if (!("speechSynthesis" in window)) showError("Text-to-speech is not supported in this browser.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = targetSel.value; // e.g. "es", "fr", "hi"
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

/* ------------------------------------------------------------------ */
/* Wire up                                                            */
/* ------------------------------------------------------------------ */

translateBtn.addEventListener("click", translate);
input.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") translate();
});
input.addEventListener("input", updateCharCount);

swapBtn.addEventListener("click", swapLanguages);
detectBtn.addEventListener("click", detectLanguage);
clearBtn.addEventListener("click", () => {
  input.value = "";
  output.textContent = "";
  statusEl.textContent = "";
  detectedEl.textContent = "";
  delete detectedEl.dataset.code;
  copyBtn.disabled = true;
  speakBtn.disabled = true;
  clearError();
  updateCharCount();
  input.focus();
});
copyBtn.addEventListener("click", copyOutput);
speakBtn.addEventListener("click", speakOutput);

updateCharCount();
