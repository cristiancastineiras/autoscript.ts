import { Batch, textToBase64 } from "../../dist/index.js";
import { addLog, perform } from "./runtime.js";

const byId = (id) => document.getElementById(id);
let entries = [];

function makeId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function renderEntries() {
  const list = byId("entries");
  list.replaceChildren();
  byId("entry-count").textContent = String(entries.length);
  byId("empty-batch").hidden = entries.length > 0;
  entries.forEach((entry, index) => {
    const item = document.createElement("li");
    const summary = document.createElement("div");
    const id = document.createElement("strong");
    id.textContent = entry.id;
    const settings = document.createElement("span");
    settings.textContent =
      entry.format || entry.suboperation
        ? `${entry.format || "Formato general"} · ${entry.suboperation || "Operación general"}`
        : "Configuración general";
    summary.append(id, document.createElement("br"), settings);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Quitar";
    remove.setAttribute("aria-label", `Quitar firma ${entry.id}`);
    remove.addEventListener("click", () => {
      entries = entries.filter((_item, itemIndex) => itemIndex !== index);
      renderEntries();
    });
    item.append(summary, remove);
    list.append(item);
  });
}

byId("generate-id").addEventListener("click", () => {
  byId("entry-id").value = makeId();
});

byId("add-entry").addEventListener("click", () => {
  const id = byId("entry-id").value.trim();
  const typedReference = byId("entry-reference").value.trim();
  if (!id || !typedReference) {
    addLog("Cada firma necesita un ID y una referencia.", "error");
    return;
  }
  if (entries.some((entry) => entry.id === id)) {
    addLog("El ID ya existe en este lote.", "error");
    return;
  }
  const datareference = byId("encode-reference").checked
    ? textToBase64(typedReference)
    : typedReference;
  entries.push({
    id,
    datareference,
    format: byId("entry-format").value || undefined,
    suboperation: byId("entry-suboperation").value || undefined,
    extraparams: byId("entry-properties").value || undefined,
  });
  byId("entry-id").value = "";
  byId("entry-reference").value = "";
  byId("entry-properties").value = "";
  renderEntries();
});

byId("clear-batch").addEventListener("click", () => {
  entries = [];
  renderEntries();
});

byId("local-batch").addEventListener("change", (event) => {
  byId("triphase-fields").hidden = event.currentTarget.checked;
});

byId("sign-batch").addEventListener("click", () =>
  perform("Lote JSON", async (client, signal) => {
    if (entries.length === 0) throw new TypeError("Añade al menos una firma al lote.");
    const batch = new Batch(
      byId("batch-algorithm").value,
      byId("batch-format").value,
      byId("batch-suboperation").value,
      byId("batch-properties").value || undefined,
    );
    for (const entry of entries) batch.add(entry);
    const local = byId("local-batch").checked;
    const preSignerUrl = byId("presigner-url").value.trim();
    const postSignerUrl = byId("postsigner-url").value.trim();
    const result = await client.signBatchProcess(
      batch,
      byId("stop-on-error").checked,
      {
        local,
        ...(local || !preSignerUrl ? {} : { preSignerUrl }),
        ...(local || !postSignerUrl ? {} : { postSignerUrl }),
        properties: byId("batch-properties").value,
      },
      { signal },
    );
    byId("batch-result").value =
      typeof result.result === "string" ? result.result : JSON.stringify(result.result, null, 2);
    byId("batch-certificate").value = result.certificate ?? "";
  }),
);

renderEntries();
