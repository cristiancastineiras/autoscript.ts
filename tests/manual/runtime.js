import { createAutoFirmaClient, textToBase64 } from "../../dist/index.js";

const connectionForm = document.querySelector("#connection-form");
const connectionState = document.querySelector("[data-connection-state]");
const operationState = document.querySelector("[data-operation-state]");
const operationLog = document.querySelector("#operation-log");
const cancelButton = document.querySelector("#cancel-operation");
const runButtons = [...document.querySelectorAll("[data-run]")];
let client = null;
let activeController = null;

function addLog(message, kind = "info") {
  const item = document.createElement("li");
  const time = document.createElement("time");
  time.dateTime = new Date().toISOString();
  time.textContent = new Date().toLocaleTimeString();
  const text = document.createElement("span");
  text.textContent = message;
  item.dataset.kind = kind;
  item.append(time, text);
  operationLog?.prepend(item);
}

function setState(node, message, kind = "ready") {
  if (!node) return;
  node.textContent = message;
  node.dataset.kind = kind;
}

function readConfiguration() {
  const values = new FormData(connectionForm);
  const timeoutMs = Number(values.get("timeoutMs"));
  const portValue = String(values.get("port") ?? "").trim();
  const port = portValue ? Number(portValue) : null;
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0)
    throw new RangeError("El timeout debe ser un entero positivo.");
  if (port !== null && (!Number.isInteger(port) || port < 1024 || port > 65535))
    throw new RangeError("El puerto debe estar entre 1024 y 65535.");

  const selectedTransport = String(values.get("transport"));
  const options = {
    transport: selectedTransport,
    config: {
      timeoutMs,
      appName: String(values.get("appName") ?? "") || null,
      minimumVersion: String(values.get("minimumVersion") ?? "") || null,
      progressDialog: values.get("progressDialog") === "on",
    },
  };
  if (port !== null) {
    options.websocket = { ports: [port] };
    options.https = { ports: [port] };
  }
  if (selectedTransport === "intermediate") {
    const storageUrl = String(values.get("storageUrl") ?? "").trim();
    const retrieveUrl = String(values.get("retrieveUrl") ?? "").trim();
    if (!storageUrl || !retrieveUrl)
      throw new TypeError("Indica ambos servicios HTTPS para el modo intermedio.");
    options.intermediate = { storageUrl, retrieveUrl };
  }
  return options;
}

function applyConfiguration() {
  if (activeController) {
    setState(connectionState, "Hay una operación activa.", "error");
    return false;
  }
  try {
    const nextClient = createAutoFirmaClient(readConfiguration());
    client?.dispose();
    client = nextClient;
    setState(connectionState, `Cliente listo · ${client.config.timeoutMs} ms`, "ready");
    addLog("Configuración aplicada; todavía no se abrió AutoFirma.");
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Configuración inválida.";
    setState(connectionState, message, "error");
    addLog(message, "error");
    return false;
  }
}

async function perform(label, operation) {
  if (activeController) return;
  if (!client && !applyConfiguration()) return;
  activeController = new AbortController();
  const signal = activeController.signal;
  for (const button of runButtons) button.disabled = true;
  if (cancelButton) cancelButton.disabled = false;
  setState(operationState, `${label} en curso…`, "busy");
  addLog(`${label}: iniciada.`);
  try {
    await operation(client, signal);
    setState(operationState, `${label}: completada.`, "ready");
    addLog(`${label}: completada.`);
  } catch (error) {
    const failure = error && typeof error === "object" ? error : {};
    const kind = typeof failure.kind === "string" ? failure.kind : "error";
    const code = typeof failure.code === "string" ? ` · ${failure.code}` : "";
    const message = error instanceof Error ? error.message : "La operación no pudo completarse.";
    setState(operationState, `${label}: ${kind}${code}`, "error");
    addLog(message, "error");
  } finally {
    activeController = null;
    for (const button of runButtons) button.disabled = false;
    if (cancelButton) cancelButton.disabled = true;
  }
}

function encodeInput(text, mode) {
  const value = text.trim();
  if (!value) return null;
  return mode === "base64" ? value : textToBase64(text);
}

function clearLog() {
  operationLog?.replaceChildren();
}

connectionForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  applyConfiguration();
});

function showIntermediateSettings(transport) {
  const fieldset = document.querySelector("#intermediate-settings");
  const mobile = /Android|Kindle|iPad|iPhone|iPod/i.test(navigator.userAgent);
  if (fieldset)
    fieldset.dataset.visible =
      transport === "intermediate" || (transport === "auto" && mobile) ? "true" : "false";
}

connectionForm?.querySelector("#transport")?.addEventListener("change", (event) => {
  showIntermediateSettings(event.currentTarget.value);
});

cancelButton?.addEventListener("click", () => {
  activeController?.abort(new DOMException("Espera local detenida", "AbortError"));
  client?.cancel();
});

document.querySelector("#clear-log")?.addEventListener("click", clearLog);

showIntermediateSettings(connectionForm?.querySelector("#transport")?.value ?? "auto");
applyConfiguration();

export { addLog, encodeInput, perform };
