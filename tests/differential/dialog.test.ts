import { describe, expect, test } from "vitest";
import { createPage, FIREFOX_UA, invoke, type Flavor, type Page } from "../support/harness.js";

/** HTML del dialogo visible, sin el atributo `type` que la reescritura agrega a los botones. */
function dialogHtml(page: Page): string {
  return (page.window.document.getElementById("afirmaSupportDialog")?.outerHTML ?? "").replaceAll(
    ' type="button"',
    "",
  );
}

async function waitForDialog(page: Page, text: string): Promise<void> {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (dialogHtml(page).includes(text)) return;
    await page.settle();
  }
  throw new Error(`No aparece el dialogo con "${text}"`);
}

async function notInstalledDialog(flavor: Flavor, userAgent?: string): Promise<Page> {
  const page = createPage({
    flavor,
    native: { installed: false },
    ...(userAgent ? { userAgent } : {}),
  });
  page.globals.AutoScript.cargarAppAfirma();
  page.globals.AutoScript.sign(
    "QUJD",
    "SHA256",
    "CAdES",
    null,
    () => {},
    () => {},
  );
  await waitForDialog(page, "afirmaCloseButton");
  return page;
}

describe("dialogo de soporte con el mismo DOM que el original", () => {
  test.each([[undefined], [FIREFOX_UA]])("error de conexion con Autofirma (%s)", async (agent) => {
    const original = await notInstalledDialog("original", agent);
    const modern = await notInstalledDialog("modern", agent);
    expect(dialogHtml(modern)).toBe(dialogHtml(original));
    expect(dialogHtml(modern)).toContain("Reintentar operación");
  });

  test("error al comprobar los servicios del servidor intermedio", async () => {
    const pages: Page[] = [];
    for (const flavor of ["original", "modern"] as const) {
      const page = createPage({ flavor, native: { servletStatus: 500 } });
      page.globals.SupportDialog.setAdminContactInfo(
        "<a href='mailto:soporte@sede.gob.es'>soporte</a>",
      );
      page.globals.AutoScript.setForceWSMode(true);
      page.globals.AutoScript.cargarAppAfirma();
      await waitForDialog(page, "afirmaCloseButton");
      pages.push(page);
    }
    expect(dialogHtml(pages[1]!)).toBe(dialogHtml(pages[0]!));
    expect(dialogHtml(pages[1]!)).toContain("soporte@sede.gob.es");
  });

  test("clases e idioma personalizados", async () => {
    const pages: Page[] = [];
    for (const flavor of ["original", "modern"] as const) {
      const page = createPage({ flavor, native: { installed: false } });
      const { SupportDialog, AutoScript } = page.globals;
      SupportDialog.setBackgroundClass("fondo");
      SupportDialog.setDialogClass("caja");
      SupportDialog.setCloseButtonClass("cerrar");
      SupportDialog.setActionButtonClass("accion");
      SupportDialog.setPCDownloadURL("<a href='https://sede.gob.es/autofirma'>Descarga</a>");
      AutoScript.setLocale("en_US");
      AutoScript.cargarAppAfirma();
      AutoScript.sign(
        "QUJD",
        "SHA256",
        "CAdES",
        null,
        () => {},
        () => {},
      );
      await waitForDialog(page, "afirmaCloseButton");
      pages.push(page);
    }
    const html = dialogHtml(pages[1]!);
    expect(html).toContain('class="fondo"');
    expect(html).toContain('class="cerrar"');
    expect(html).toContain("https://sede.gob.es/autofirma");
    // El original fija los textos del dialogo al cargar el script; la reescritura respeta setLocale.
    expect(html).toContain(">Close<");
    expect(html).toContain("Retry operation");
  });
});

describe("comportamiento del dialogo", () => {
  test("reintentar relanza la operacion; cerrar invoca el callback de error", async () => {
    const page = createPage({ flavor: "modern", native: { installed: false } });
    const { AutoScript } = page.globals;
    AutoScript.AUTOFIRMA_CONNECTION_RETRIES = 2;
    AutoScript.cargarAppAfirma();
    const outcome = new Promise<unknown[]>((resolve) =>
      AutoScript.sign(
        "QUJD",
        "SHA256",
        "CAdES",
        null,
        () => resolve([]),
        (...args) => resolve(args),
      ),
    );
    await waitForDialog(page, "afirmaActionButton");
    page.window.document.getElementById("afirmaActionButton")!.click();
    await waitForDialog(page, "afirmaActionButton");
    expect(page.capture.launches).toHaveLength(2);
    page.window.document.getElementById("afirmaCloseButton")!.click();
    expect((await outcome)[2]).toBe("AS620017");
    expect(page.window.document.getElementById("afirmaSupportDialog")).toBeNull();
  });

  test("restaura aria-hidden, scroll y foco; Escape cierra", async () => {
    const page = createPage({ flavor: "modern", native: { installed: false } });
    const document = page.window.document;
    const aside = document.createElement("aside");
    aside.setAttribute("aria-hidden", "false");
    const button = document.createElement("button");
    document.body.append(aside, button);
    button.focus();
    document.body.style.overflow = "auto";
    page.globals.AutoScript.cargarAppAfirma();
    const outcome = new Promise<boolean>((resolve) =>
      page.globals.AutoScript.sign(
        "QUJD",
        "SHA256",
        "CAdES",
        null,
        () => resolve(true),
        () => resolve(false),
      ),
    );
    await waitForDialog(page, "afirmaCloseButton");
    expect(aside.getAttribute("aria-hidden")).toBe("true");
    expect(document.body.style.overflow).toBe("hidden");
    document.dispatchEvent(new page.window.KeyboardEvent("keydown", { key: "Escape" }));
    expect(await outcome).toBe(false);
    expect(aside.getAttribute("aria-hidden")).toBe("false");
    expect(document.getElementById("app")!.hasAttribute("aria-hidden")).toBe(false);
    expect(document.body.style.overflow).toBe("auto");
    expect(document.activeElement).toBe(button);
    expect(document.querySelectorAll("#afirmaSupportDialogStyles")).toHaveLength(1);
  });

  test("el HTML de los integradores se sanea", async () => {
    const page = createPage({ flavor: "modern", native: { installed: false } });
    page.globals.SupportDialog.setPCDownloadURL(
      "<a href='javascript:alert(1)' onclick='alert(2)'>x</a><img src=x onerror='alert(3)'><script>alert(4)</script><b>ok</b>",
    );
    page.globals.AutoScript.cargarAppAfirma();
    page.globals.AutoScript.sign(
      "QUJD",
      "SHA256",
      "CAdES",
      null,
      () => {},
      () => {},
    );
    await waitForDialog(page, "afirmaCloseButton");
    const html = dialogHtml(page);
    expect(html).not.toMatch(/javascript:|onclick|onerror|<script/);
    expect(html).toContain("<b>ok</b>");
  });

  test("dialogos desactivados: el error llega directamente al callback", async () => {
    const page = createPage({ flavor: "modern", native: { installed: false } });
    page.globals.SupportDialog.enableErrorDialog(false);
    page.globals.AutoScript.cargarAppAfirma();
    const outcome = await invoke(page, (ok, ko) =>
      page.globals.AutoScript.sign("QUJD", "SHA256", "CAdES", null, ok, ko),
    );
    expect(outcome.ok).toBe(false);
    expect(page.window.document.getElementById("afirmaSupportDialog")).toBeNull();
  });
});
