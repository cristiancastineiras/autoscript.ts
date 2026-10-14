import { downloadRemoteData } from "../../dist/browser.js";
import { addLog, encodeInput, perform } from "./runtime.js";

const byId = (id) => document.getElementById(id);
const actionButton = (name) => document.querySelector(`[data-run="${name}"]`);

function getSigningOptions() {
  return {
    data: encodeInput(byId("data").value, byId("data-encoding").value),
    algorithm: byId("algorithm").value,
    format: byId("format").value,
    properties: byId("properties").value,
  };
}

function showSignature(result) {
  byId("result-signature").value = result.signature;
  byId("result-certificate").value = result.certificate ?? "";
  byId("result-extra").value = result.extraInfo ?? "";
}

actionButton("sign").addEventListener("click", () =>
  perform("Firma", async (client, signal) => {
    showSignature(await client.sign(getSigningOptions(), { signal }));
  }),
);

actionButton("cosign").addEventListener("click", () =>
  perform("Cofirma", async (client, signal) => {
    showSignature(
      await client.cosign(
        { ...getSigningOptions(), data: byId("signature").value.trim() || null },
        { signal },
      ),
    );
  }),
);

actionButton("countersign").addEventListener("click", () =>
  perform("Contrafirma", async (client, signal) => {
    showSignature(
      await client.counterSign(
        { ...getSigningOptions(), data: byId("signature").value.trim() || null },
        { signal },
      ),
    );
  }),
);

actionButton("sign-and-save").addEventListener("click", () =>
  perform("Firma y guardado", async (client, signal) => {
    showSignature(
      await client.signAndSave(
        {
          ...getSigningOptions(),
          signOperation: "sign",
          filename: byId("output-filename").value || "firma.csig",
        },
        { signal },
      ),
    );
  }),
);

actionButton("select-certificate").addEventListener("click", () =>
  perform("Selección de certificado", async (client, signal) => {
    byId("result-signature").value = await client.selectCertificate(byId("properties").value, {
      signal,
    });
    byId("result-certificate").value = "";
    byId("result-extra").value = "";
  }),
);

actionButton("load-file").addEventListener("click", () =>
  perform("Carga de archivo", async (client, signal) => {
    const result = await client.loadFiles({ multiple: byId("multiple-files").checked }, { signal });
    byId("result-files").value = result.files
      .map(({ name, data }) => `${name}\n${data}`)
      .join("\n\n");
    if (!byId("multiple-files").checked && result.files[0]) {
      byId("data").value = result.files[0].data;
      byId("data-encoding").value = "base64";
    }
  }),
);

actionButton("save-file").addEventListener("click", () =>
  perform("Guardado de archivo", async (client, signal) => {
    const data = byId("save-data").value.trim();
    if (!data) throw new TypeError("Indica el contenido Base64 que quieres guardar.");
    await client.saveDataToFile(
      {
        data,
        title: byId("save-title").value,
        filename: byId("save-name").value,
        extensions: "",
        description: "",
      },
      { signal },
    );
  }),
);

actionButton("download").addEventListener("click", () =>
  perform("Descarga remota", async (_client, signal) => {
    const url = byId("remote-url").value.trim();
    if (!url) throw new TypeError("Indica una URL HTTPS.");
    const base64 = await downloadRemoteData(url, { signal });
    byId("data").value = base64;
    byId("data-encoding").value = "base64";
    addLog("Descarga lista para firmar; pulsa la acción de firma para abrir AutoFirma.");
  }),
);
