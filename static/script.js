/* Front-end logic for the Language Translation Tool. */
"use strict";

const $ = (id) => document.getElementById(id);

const input = $("input");
const output = $("output");
const sourceSel = $("source");
const targetSel = $("target");
const translateBtn = $("translate-btn");
const swapBtn = $("swap-btn");
const clearBtn = $("clear-btn");
const charCount = $("char-count");
const statusEl = $("status");
const errorEl = $("error");

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
  const label = translateBtn.querySelector("span");
  if (label) {
    label.textContent = busy ? "Translating…" : "Translate";
  } else {
    translateBtn.textContent = busy ? "Translating…" : "Translate";
  }
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
    const engineNote = data.engine && data.engine.includes("fallback") ? " (fallback engine)" : "";
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

  // Swap dropdown selections: if source was auto, swap target into source, and set target to en
  sourceSel.value = t;
  targetSel.value = s === "auto" ? "en" : s;

  // If both panes have content, swap text too
  if (output.textContent && input.value) {
    const temp = input.value;
    input.value = output.textContent;
    output.textContent = "";
    statusEl.textContent = "";
    updateCharCount();
  }
}

/* ------------------------------------------------------------------ */
/* Clear                                                              */
/* ------------------------------------------------------------------ */

function clearAll() {
  input.value = "";
  output.textContent = "";
  statusEl.textContent = "";
  clearError();
  updateCharCount();
  input.focus();
}

/* ------------------------------------------------------------------ */
/* Event Listeners                                                    */
/* ------------------------------------------------------------------ */

translateBtn.addEventListener("click", translate);
input.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") translate();
});
input.addEventListener("input", updateCharCount);
swapBtn.addEventListener("click", swapLanguages);
clearBtn.addEventListener("click", clearAll);

updateCharCount();
