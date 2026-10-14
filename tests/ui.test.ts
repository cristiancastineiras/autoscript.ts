// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSupportDialog } from "../src/ui/dialog.js";
import { dialogMessages, localizedHelp, LOCALE_CODES } from "../src/ui/locales.js";
import { installDialogStyles } from "../src/ui/styles.js";

beforeEach(() => {
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: {
      configurable: true,
      writable: true,
      value(this: HTMLDialogElement) {
        this.open = true;
      },
    },
    close: {
      configurable: true,
      writable: true,
      value(this: HTMLDialogElement) {
        this.open = false;
        this.dispatchEvent(new Event("close"));
      },
    },
  });
});
afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("optional support dialog", () => {
  it("renders every locale's loading, close and warning labels", () => {
    const support = createSupportDialog();
    for (const locale of LOCALE_CODES) {
      support.setLocale(locale);
      support.showLoading();
      expect(document.querySelector('[role="status"]')?.textContent).toBe(
        dialogMessages(locale).loading,
      );
      expect(document.querySelector("dialog button")?.textContent).toBe(
        dialogMessages(locale).close,
      );
      support.showWarning("clock drift");
      expect(document.querySelector('[role="status"]')?.textContent).toBe("clock drift");
      expect(document.querySelector("dialog button")?.textContent).toBe(dialogMessages(locale).ok);
    }
    support.dispose();
  });
  it("renders safe localized links and a deliberate retry action", () => {
    const support = createSupportDialog({ locale: "en_US" });
    const retry = vi.fn();
    const help = localizedHelp("en_US", "connection", "desktop", true);
    support.showError("Unable to connect", {
      ...help,
      action: { label: dialogMessages("en_US").retryOperation, run: retry },
      links: [
        ...(help.links ?? []),
        { label: "unsafe", url: "javascript:alert(1)" },
        { label: "broken", url: "not a URL" },
      ],
    });
    expect(document.querySelectorAll("dialog a")).toHaveLength(1);
    expect(document.querySelector<HTMLAnchorElement>("dialog a")?.rel).toContain("noopener");
    expect(document.querySelectorAll("dialog button")).toHaveLength(2);
    expect(document.querySelector("dialog button")?.textContent).toBe("Retry operation");
    document.querySelector("dialog button")?.dispatchEvent(new MouseEvent("click"));
    expect(retry).toHaveBeenCalledTimes(1);
    support.dispose();
  });
  it("handles Escape without relying on container close watchers", () => {
    const onDismiss = vi.fn();
    const support = createSupportDialog({ onDismiss });
    support.showLoading();
    const dialog = document.querySelector("dialog")!;
    dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    expect(dialog.open).toBe(true);
    dialog.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
    );
    expect(document.querySelector("dialog")).toBe(null);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    support.dispose();
  });
  it("ignores deferred close events from an earlier dialog", async () => {
    vi.spyOn(HTMLDialogElement.prototype, "close").mockImplementation(function (
      this: HTMLDialogElement,
    ) {
      this.open = false;
      queueMicrotask(() => this.dispatchEvent(new Event("close")));
    });
    const support = createSupportDialog();
    support.showLoading();
    support.close();
    support.showError("new operation");
    await Promise.resolve();
    expect(document.querySelector("dialog")?.open).toBe(true);
    document.querySelector("dialog")?.dispatchEvent(new Event("close"));
    expect(document.querySelector("dialog")).toBe(null);
    support.dispose();
  });
  it("preserves host state, focus and localized content", () => {
    vi.spyOn(HTMLDialogElement.prototype, "showModal").mockImplementation(function (
      this: HTMLDialogElement,
    ) {
      this.open = true;
    });
    vi.spyOn(HTMLDialogElement.prototype, "close").mockImplementation(function (
      this: HTMLDialogElement,
    ) {
      this.open = false;
    });
    document.body.innerHTML = '<button id="host" aria-hidden="false">Host</button>';
    document.body.style.overflow = "scroll";
    const host = document.querySelector<HTMLButtonElement>("#host")!;
    host.focus();
    const support = createSupportDialog({ document });
    support.showLoading();
    expect(document.querySelector("dialog")?.open).toBe(true);
    support.setLocale("en_US");
    expect(document.querySelector('[role="status"]')?.textContent).toBe("Loading");
    support.setLocale("unknown");
    expect(document.querySelector('[role="status"]')?.textContent).toBe("Cargando");
    support.api.setDialogClass("custom");
    expect(document.querySelector("dialog")?.classList.contains("custom")).toBe(true);
    support.close();
    expect(document.activeElement).toBe(host);
    expect(host.getAttribute("aria-hidden")).toBe("false");
    expect(document.body.style.overflow).toBe("scroll");
    support.dispose();
    support.showLoading();
    expect(document.querySelector("dialog")).toBe(null);
  });
  it("sanitizes legacy HTML and handles all setters", () => {
    vi.spyOn(HTMLDialogElement.prototype, "showModal").mockImplementation(function (
      this: HTMLDialogElement,
    ) {
      this.open = true;
    });
    vi.spyOn(HTMLDialogElement.prototype, "close").mockImplementation(function (
      this: HTMLDialogElement,
    ) {
      this.open = false;
    });
    const dismiss = vi.fn();
    const support = createSupportDialog({ onDismiss: dismiss });
    for (const [name, setter] of Object.entries(support.api))
      if (name.startsWith("set"))
        (setter as (text: string) => void)(
          name.includes("Class")
            ? "custom"
            : '<a href="javascript:alert(1)" onclick="alert(1)">link</a><script>alert(1)</script>',
        );
    support.showError("failed");
    expect(document.querySelector("script")).toBe(null);
    expect(document.querySelector("a")?.hasAttribute("onclick")).toBe(false);
    expect(document.querySelector("a")?.hasAttribute("href")).toBe(false);
    document.querySelector("dialog button")?.dispatchEvent(new MouseEvent("click"));
    expect(dismiss).toHaveBeenCalledTimes(1);
    support.api.enableSupportDialog(false);
    support.showError("failed");
    expect(document.querySelector("dialog")).toBe(null);
    support.api.enableSupportDialog(true);
    support.api.enableLoadingDialog(false);
    support.showLoading();
    expect(document.querySelector("dialog")).toBe(null);
    support.api.enableLoadingDialog(true);
    support.showLoading();
    support.api.enableLoadingDialog(false);
    support.api.enableErrorDialog(false);
    support.showError("");
    expect(document.querySelector("dialog")).toBe(null);
    support.api.enableErrorDialog(true);
    support.showError("failed");
    support.api.enableErrorDialog(false);
    support.api.enableErrorDialog(true);
    support.showError("failed");
    document.querySelector("dialog")?.dispatchEvent(new Event("cancel", { cancelable: true }));
    expect(dismiss).toHaveBeenCalledTimes(2);
    const removeStyles = installDialogStyles(document, "test-nonce");
    expect(document.querySelector("style")?.nonce).toBe("test-nonce");
    removeStyles();
    const removeDefaultStyles = installDialogStyles(document);
    removeDefaultStyles();
    support.dispose();
  });
});
