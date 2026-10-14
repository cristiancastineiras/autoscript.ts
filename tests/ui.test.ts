// @vitest-environment jsdom
import { afterEach, describe, expect, test } from "vitest";
import { detectPlatform } from "../src/browser/environment.js";
import { localeMessages, LOCALES } from "../src/ui/messages.js";
import { SupportDialog } from "../src/ui/dialog.js";
import { sanitizeHtml } from "../src/ui/sanitize.js";
import { installSupportDialogStyles, SUPPORT_DIALOG_CSS } from "../src/ui/styles.js";

const services = { checked: true, failing: true, compatible: true };
const overlay = (): HTMLElement | null => document.getElementById("afirmaSupportDialog");
const label = (): string => document.getElementById("afirmaSupportDialogLabel")?.innerHTML ?? "";

afterEach(() => {
  document.body.replaceChildren();
  document.head.replaceChildren();
});

describe("idiomas", () => {
  test("seis idiomas con las mismas claves y es_ES por defecto", () => {
    const keys = Object.keys(LOCALES.es_ES);
    for (const locale of Object.values(LOCALES)) expect(Object.keys(locale)).toEqual(keys);
    expect(localeMessages("xx_XX")).toBe(LOCALES.es_ES);
    expect(localeMessages(null)).toBe(LOCALES.es_ES);
    expect(localeMessages("eu_ES").close).toBe("Itxi");
  });
});

describe("estilos", () => {
  test("se insertan una sola vez y admiten nonce", () => {
    installSupportDialogStyles(document, "abc");
    installSupportDialogStyles(document, "abc");
    const styles = document.querySelectorAll("style");
    expect(styles).toHaveLength(1);
    expect(styles[0]!.nonce).toBe("abc");
    expect(SUPPORT_DIALOG_CSS).toContain(".afirma-modal-backdrop{");
    expect(SUPPORT_DIALOG_CSS).toContain("data:image/png;base64,");
  });
});

describe("saneado de HTML", () => {
  test("conserva formato, enlaces e imagenes seguros", () => {
    const fragment = sanitizeHtml(
      document,
      "<p><a href='https://a.es' target='_blank'>a</a><img src='data:image/png;base64,AA' alt='x'><b>b</b></p>",
    );
    const container = document.createElement("div");
    container.append(fragment);
    expect(container.innerHTML).toBe(
      '<p><a href="https://a.es" target="_blank">a</a><img src="data:image/png;base64,AA" alt="x"><b>b</b></p>',
    );
  });

  test("elimina scripts, eventos, URLs peligrosas y desenvuelve etiquetas no permitidas", () => {
    const container = document.createElement("div");
    container.append(
      sanitizeHtml(
        document,
        "<!-- c --><font color=red>t</font><iframe src='https://x'></iframe><a href='vbscript:x' style='background:url(x)'>v</a><img src='https://a.es/i.png' onload='x()'><a href='http://['>m</a>",
      ),
    );
    expect(container.innerHTML).toBe('t<a>v</a><img src="https://a.es/i.png"><a>m</a>');
  });
});

describe("SupportDialog", () => {
  test("dialogo de carga con spinner y cierre", () => {
    const dialog = new SupportDialog({ platform: detectPlatform("") });
    dialog.showLoading();
    expect(dialog.isOpen()).toBe(true);
    expect(document.querySelector(".afirma-modal-spinner")).not.toBeNull();
    expect(label()).toBe("Cargando");
    dialog.close();
    expect(overlay()).toBeNull();
    expect(dialog.isOpen()).toBe(false);
  });

  test("dialogos desactivados", () => {
    const dialog = new SupportDialog({ platform: detectPlatform("") });
    dialog.api.enableLoadingDialog(false);
    dialog.showLoading();
    expect(overlay()).toBeNull();
    dialog.api.enableLoadingDialog(true);
    dialog.api.enableErrorDialog(false);
    expect(dialog.showError("connecting-afirma", services)).toBeNull();
    expect(dialog.showInsecureContextWarning()).toBeNull();
    dialog.api.enableSupportDialog(false);
    expect(dialog.enabled).toBe(false);
    dialog.showLoading();
    expect(overlay()).toBeNull();
  });

  test("reintento resuelve true; un dialogo nuevo cierra el anterior como cancelado", async () => {
    const dialog = new SupportDialog({ platform: detectPlatform("") });
    const retry = dialog.showError("connecting-afirma", services)!;
    document.getElementById("afirmaActionButton")!.click();
    await expect(retry).resolves.toBe(true);
    const replaced = dialog.showError("connecting-service", services)!;
    dialog.showLoading();
    await expect(replaced).resolves.toBe(false);
  });

  test("aviso de contexto inseguro con boton Aceptar", async () => {
    const dialog = new SupportDialog({ platform: detectPlatform(""), locale: "gl_ES" });
    const closed = dialog.showInsecureContextWarning()!;
    expect(label()).toContain("afirmaWarningText");
    expect(document.getElementById("afirmaCloseButton")!.textContent).toBe("Aceptar");
    document.getElementById("afirmaCloseButton")!.click();
    await expect(closed).resolves.toBeUndefined();
  });

  test("mensajes segun la plataforma y enlaces alternativos", () => {
    const android = new SupportDialog({ platform: detectPlatform("Android") });
    android.api.setAndroidDownloadURL("<a href='https://play.example'>Play</a>");
    expect(android.downloadMessage()).toContain("https://play.example");
    expect(android.noCompatibleProcedureMessage()).toContain("Acceda desde un PC");
    android.api.setAlternativeAndroidAppLink("<a href='https://app.example'>App</a>");
    expect(android.noCompatibleProcedureMessage()).toContain("https://app.example");

    const ios = new SupportDialog({ platform: detectPlatform("iPhone") });
    ios.api.setIOSDownloadURL("IOS");
    ios.api.setAlternativeIOSAppLink("ALT");
    expect(ios.downloadMessage()).toContain("IOS");
    expect(ios.noCompatibleProcedureMessage()).toContain("ALT");
    void ios.showError("connecting-afirma", services);
    expect(label()).toContain("cliente de firma");
  });

  test("errores de servicio con y sin compatibilidad", () => {
    const dialog = new SupportDialog({ platform: detectPlatform("") });
    dialog.api.setAdminContactInfo("admin@sede.gob.es");
    void dialog.showError("connecting-service", services);
    expect(label()).toContain("admin@sede.gob.es");
    expect(document.getElementById("afirmaActionButton")).not.toBeNull();
    void dialog.showError("connecting-service", { ...services, compatible: false });
    expect(document.getElementById("afirmaActionButton")).toBeNull();
    void dialog.showError("no-compatible-procedure", services);
    expect(label()).toContain("no permite firmar");
  });

  test("todas las clases son configurables y los textos se pueden sustituir", () => {
    const dialog = new SupportDialog({ platform: detectPlatform("") });
    const api = dialog.api;
    api.setMessagePannelClass("panel");
    api.setLoadingTextClass("carga");
    api.setErrorTextClass("error");
    api.setWarningClass("aviso");
    api.setButtonContainerClass("botones");
    api.setLogoClass("logo");
    api.setSpinnerClass("giro");
    dialog.setMessages({ ...LOCALES.en_US, loading: "Espere" });
    dialog.showLoading();
    expect(document.querySelector(".panel .logo")).not.toBeNull();
    expect(document.querySelector(".giro")).not.toBeNull();
    expect(document.querySelector(".carga")!.textContent).toBe("Espere");
    expect(dialog.showMessage("<i>fallo</i>")).toBe(true);
    expect(document.querySelector(".botones .afirma-modal-close-button")).not.toBeNull();
    dialog.setLocale("ca_ES");
    expect(dialog.messages.close).toBe("Tancar");
  });
});
