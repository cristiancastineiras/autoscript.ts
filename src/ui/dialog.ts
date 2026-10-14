import createDOMPurify from "dompurify";
import { AutoFirmaError } from "../core/errors.js";
import { dialogMessages, resolveDialogLocale } from "./locales.js";
import type { DialogHelp } from "./locales.js";

export interface SupportDialog {
  enableSupportDialog(enabled: boolean): void;
  enableLoadingDialog(enabled: boolean): void;
  enableErrorDialog(enabled: boolean): void;
  setBackgroundClass(value: string): void;
  setDialogClass(value: string): void;
  setMessagePannelClass(value: string): void;
  setLoadingTextClass(value: string): void;
  setErrorTextClass(value: string): void;
  setWarningClass(value: string): void;
  setButtonContainerClass(value: string): void;
  setActionButtonClass(value: string): void;
  setCloseButtonClass(value: string): void;
  setLogoClass(value: string): void;
  setSpinnerClass(value: string): void;
  setPCDownloadURL(value: string): void;
  setAndroidDownloadURL(value: string): void;
  setIOSDownloadURL(value: string): void;
  setAdminContactInfo(value: string): void;
  setAlternativeAndroidAppLink(value: string): void;
  setAlternativeIOSAppLink(value: string): void;
}

export interface SupportController {
  readonly api: SupportDialog;
  showLoading(): void;
  showError(message: string, help?: DialogHelp): void;
  showWarning(message: string, help?: DialogHelp): void;
  close(): void;
  setLocale(locale: string): void;
  dispose(): void;
}
export interface DialogOptions {
  readonly document?: Document;
  readonly locale?: string;
  readonly onDismiss?: () => void;
}

export function createSupportDialog(options: DialogOptions = {}): SupportController {
  let enabled = true;
  let loadingEnabled = true;
  let errorEnabled = true;
  let locale = resolveDialogLocale(options.locale ?? "es_ES");
  let dialog: HTMLDialogElement | null = null;
  let previous: HTMLElement | null = null;
  let state: "loading" | "error" | "warning" = "loading";
  let errorMessage = "";
  let help: DialogHelp | undefined;
  let disposed = false;
  const classes: Map<string, string> = new Map();
  const html: Map<string, string> = new Map();
  const close = (): void => {
    if (!dialog) return;
    const node = dialog;
    dialog = null;
    if (node.open) node.close();
    node.remove();
    previous?.focus();
    previous = null;
  };
  const render = (): void => {
    if (disposed || !enabled || (state === "loading" ? !loadingEnabled : !errorEnabled)) {
      close();
      return;
    }
    const doc = options.document ?? (typeof document === "undefined" ? null : document);
    if (!doc?.defaultView)
      throw new AutoFirmaError("unsupported", "Support dialogs require a browser document.");
    if (!dialog) {
      previous = doc.activeElement as HTMLElement | null;
      dialog = doc.createElement("dialog");
      if (typeof dialog.showModal !== "function")
        throw new AutoFirmaError("unsupported", "HTMLDialogElement.showModal is required.");
      dialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        close();
        options.onDismiss?.();
      });
      dialog.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          close();
          options.onDismiss?.();
        }
      });
      dialog.addEventListener("close", (event) => {
        if (event.target === dialog) close();
      });
      doc.body.append(dialog);
    }
    const node = dialog;
    node.className = `autoscript-dialog ${classes.get("background") ?? ""} ${classes.get("dialog") ?? ""}`;
    node.lang = locale.slice(0, 2);
    node.setAttribute("aria-label", "Autofirma");
    node.replaceChildren();
    const title = doc.createElement("h2");
    title.textContent = "Autofirma";
    title.className = classes.get("logo") ?? "";
    node.append(title);
    const message = doc.createElement("p");
    message.textContent = state === "loading" ? dialogMessages(locale).loading : errorMessage;
    message.className = `${classes.get("message") ?? ""} ${classes.get(state === "loading" ? "loading" : state) ?? ""}`;
    message.setAttribute("role", state === "error" ? "alert" : "status");
    node.append(message);
    if (state === "loading") {
      const progress = doc.createElement("progress");
      progress.className = classes.get("spinner") ?? "";
      progress.setAttribute("aria-label", dialogMessages(locale).loading);
      node.append(progress);
    } else {
      if (help) {
        const details = doc.createElement("p");
        details.textContent = help.text;
        details.className = classes.get("warning") ?? "";
        node.append(details);
        for (const link of help.links ?? []) {
          if (link.key && html.has(link.key)) continue;
          let target: URL;
          try {
            target = new URL(link.url);
          } catch {
            continue;
          }
          if (target.protocol !== "https:") continue;
          const anchor = doc.createElement("a");
          anchor.href = target.href;
          anchor.target = "_blank";
          anchor.rel = "noopener noreferrer";
          anchor.textContent = link.label;
          node.append(anchor);
        }
      }
      const purifier = createDOMPurify(doc.defaultView);
      for (const [key, value] of html) {
        if (key === "admin" || key.startsWith("alternative")) {
          const intro = doc.createElement("p");
          intro.textContent =
            key === "admin"
              ? dialogMessages(locale).contactAdmin
              : dialogMessages(locale).procedureFromUrl;
          node.append(intro);
        }
        const fragment = purifier.sanitize(value, {
          ALLOWED_TAGS: ["a", "p", "span", "strong", "em", "br"],
          ALLOWED_ATTR: ["href", "title"],
          RETURN_DOM_FRAGMENT: true,
        });
        const section = doc.createElement("div");
        section.className = classes.get(key === "admin" ? "warning" : "action") ?? "";
        section.append(fragment);
        node.append(section);
      }
    }
    const controls = doc.createElement("div");
    controls.className = classes.get("buttons") ?? "";
    if (state !== "loading" && help?.action) {
      const action = doc.createElement("button");
      action.type = "button";
      action.textContent = help.action.label;
      action.className = classes.get("action") ?? "";
      action.addEventListener("click", () => {
        close();
        help?.action?.run();
      });
      controls.append(action);
    }
    const button = doc.createElement("button");
    button.type = "button";
    button.textContent =
      state === "warning" ? dialogMessages(locale).ok : dialogMessages(locale).close;
    button.className = classes.get("close") ?? "";
    button.addEventListener("click", () => {
      close();
      options.onDismiss?.();
    });
    controls.append(button);
    node.append(controls);
    if (!node.open) node.showModal();
  };
  const setClass = (key: string, value: string): void => {
    classes.set(key, value);
    if (dialog) render();
  };
  const setHtml = (key: string, value: string): void => {
    html.set(key, value);
    if (dialog) render();
  };
  const api: SupportDialog = {
    enableSupportDialog(value) {
      enabled = value;
      if (!value) close();
    },
    enableLoadingDialog(value) {
      loadingEnabled = value;
      if (!value && state === "loading") close();
    },
    enableErrorDialog(value) {
      errorEnabled = value;
      if (!value && state === "error") close();
    },
    setBackgroundClass(value) {
      setClass("background", value);
    },
    setDialogClass(value) {
      setClass("dialog", value);
    },
    setMessagePannelClass(value) {
      setClass("message", value);
    },
    setLoadingTextClass(value) {
      setClass("loading", value);
    },
    setErrorTextClass(value) {
      setClass("error", value);
    },
    setWarningClass(value) {
      setClass("warning", value);
    },
    setButtonContainerClass(value) {
      setClass("buttons", value);
    },
    setActionButtonClass(value) {
      setClass("action", value);
    },
    setCloseButtonClass(value) {
      setClass("close", value);
    },
    setLogoClass(value) {
      setClass("logo", value);
    },
    setSpinnerClass(value) {
      setClass("spinner", value);
    },
    setPCDownloadURL(value) {
      setHtml("pc", value);
    },
    setAndroidDownloadURL(value) {
      setHtml("android", value);
    },
    setIOSDownloadURL(value) {
      setHtml("ios", value);
    },
    setAdminContactInfo(value) {
      setHtml("admin", value);
    },
    setAlternativeAndroidAppLink(value) {
      setHtml("alternativeAndroid", value);
    },
    setAlternativeIOSAppLink(value) {
      setHtml("alternativeIOS", value);
    },
  };
  return {
    api,
    showLoading() {
      state = "loading";
      help = undefined;
      render();
    },
    showError(message, details) {
      state = "error";
      errorMessage = message || dialogMessages(locale).error;
      help = details;
      render();
    },
    showWarning(message, details) {
      state = "warning";
      errorMessage = message || dialogMessages(locale).warning;
      help = details;
      render();
    },
    close,
    setLocale(value) {
      locale = resolveDialogLocale(value);
      if (dialog) render();
    },
    dispose() {
      close();
      disposed = true;
    },
  };
}
