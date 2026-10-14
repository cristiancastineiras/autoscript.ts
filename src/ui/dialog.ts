import { hostPlatform, isMobile, type Platform } from "../browser/environment.js";
import type { ErrorDialogKind } from "../core/errors.js";
import type { OperationDialogs, ServiceStatus } from "../core/types.js";
import { localeMessages, type DialogMessages } from "./messages.js";
import { sanitizeHtml } from "./sanitize.js";
import { installSupportDialogStyles } from "./styles.js";

/** Clases CSS del dialogo. Por defecto, las del script original. */
export interface SupportDialogClasses {
  background: string;
  dialog: string;
  messagePanel: string;
  loadingText: string;
  errorText: string;
  buttonContainer: string;
  actionButton: string;
  closeButton: string;
  logo: string;
  spinner: string;
  warning: string;
}

/** API publica del global `SupportDialog` (los 20 metodos del script original). */
export interface SupportDialogApi {
  enableSupportDialog(isEnabled: boolean): void;
  enableLoadingDialog(isEnabled: boolean): void;
  enableErrorDialog(isEnabled: boolean): void;
  setBackgroundClass(cls: string): void;
  setDialogClass(cls: string): void;
  setMessagePannelClass(cls: string): void;
  setLoadingTextClass(cls: string): void;
  setErrorTextClass(cls: string): void;
  setWarningClass(cls: string): void;
  setButtonContainerClass(cls: string): void;
  setActionButtonClass(cls: string): void;
  setCloseButtonClass(cls: string): void;
  setLogoClass(cls: string): void;
  setSpinnerClass(cls: string): void;
  /** Enlace (HTML) de descarga de Autofirma para escritorio. */
  setPCDownloadURL(url: string): void;
  /** Enlace (HTML) de descarga de Autofirma App para Android. */
  setAndroidDownloadURL(url: string): void;
  /** Enlace (HTML) de descarga de Autofirma App para iOS. */
  setIOSDownloadURL(url: string): void;
  /** Contacto (HTML) del administrador para los errores de servicio. */
  setAdminContactInfo(text: string): void;
  /** Aplicacion alternativa (HTML) para tramites no compatibles en Android. */
  setAlternativeAndroidAppLink(text: string): void;
  /** Aplicacion alternativa (HTML) para tramites no compatibles en iOS. */
  setAlternativeIOSAppLink(text: string): void;
}

/** Opciones de {@link SupportDialog}. */
export interface SupportDialogOptions {
  readonly document?: Document;
  readonly platform?: Platform;
  /** Idioma inicial (`es_ES`, `gl_ES`, `va_ES`, `ca_ES`, `eu_ES` o `en_US`). */
  readonly locale?: string | null;
  /** `nonce` CSP para el `<style>` de los estilos por defecto. */
  readonly styleNonce?: string;
}

interface DialogButton {
  readonly text: string;
  readonly onClick: () => void;
}

const DEFAULT_CLASSES: SupportDialogClasses = {
  background: "afirma-modal-backdrop",
  dialog: "afirma-modal-container",
  messagePanel: "afirma-modal-message-panel",
  loadingText: "afirma-modal-loading-message",
  errorText: "afirma-modal-error-message",
  buttonContainer: "afirma-modal-button-container",
  actionButton: "afirma-modal-action-button",
  closeButton: "afirma-modal-close-button",
  logo: "afirma-modal-logo",
  spinner: "afirma-modal-spinner",
  warning: "afirma-modal-warning",
};

const OVERLAY_ID = "afirmaSupportDialog";

/**
 * Dialogo de soporte de Autofirma: carga, errores con reintento y avisos. Reproduce el DOM, los
 * identificadores y las clases del script original para que los estilos personalizados de los
 * integradores sigan funcionando, y ademas restaura el estado de la pagina al cerrarse.
 */
export class SupportDialog implements OperationDialogs {
  /** Metodos de configuracion con los nombres del global `SupportDialog` original. */
  readonly api: SupportDialogApi;
  readonly classes: SupportDialogClasses = { ...DEFAULT_CLASSES };
  readonly #platform: Platform;
  readonly #styleNonce: string | undefined;
  #document: Document | undefined;
  #messages: DialogMessages;
  #enabled = true;
  #loadingEnabled = true;
  #errorEnabled = true;
  #pcDownloadUrl: string | null = null;
  #androidDownloadUrl: string | null = null;
  #iosDownloadUrl: string | null = null;
  #adminContactInfo: string | null = null;
  #alternativeAndroidAppLink: string | null = null;
  #alternativeIOSAppLink: string | null = null;
  #teardown: (() => void) | null = null;
  #onDismiss: (() => void) | null = null;

  constructor(options: SupportDialogOptions = {}) {
    this.#document = options.document ?? globalThis.document;
    this.#platform = options.platform ?? hostPlatform();
    this.#messages = localeMessages(options.locale);
    this.#styleNonce = options.styleNonce;
    this.api = this.#createApi();
  }

  /** Los dialogos estan activados. */
  get enabled(): boolean {
    return this.#enabled;
  }

  /** Textos del idioma actual. */
  get messages(): DialogMessages {
    return this.#messages;
  }

  /** Cambia el idioma (por defecto `es_ES` si no esta soportado). */
  setLocale(locale: string | null | undefined): void {
    this.#messages = localeMessages(locale);
  }

  /** Sustituye los textos por unos personalizados. */
  setMessages(messages: DialogMessages): void {
    this.#messages = messages;
  }

  /** Inserta los estilos por defecto, una sola vez por documento. */
  installStyles(): void {
    if (this.#document) installSupportDialogStyles(this.#document, this.#styleNonce);
  }

  isOpen(): boolean {
    return this.#teardown !== null;
  }

  showLoading(): void {
    this.#show(this.#messages.loading, null, null);
  }

  showError(kind: ErrorDialogKind, services: Readonly<ServiceStatus>): Promise<boolean> | null {
    let message: string;
    let retry = false;
    switch (kind) {
      case "connecting-afirma":
        message = `${isMobile(this.#platform) ? this.#messages.error_connecting_client : this.#messages.error_connecting_autofirma}<br>${this.downloadMessage()}`;
        retry = true;
        break;
      case "no-compatible-procedure":
        message = this.noCompatibleProcedureMessage();
        break;
      case "connecting-service":
        message = services.compatible
          ? this.#messages.error_connecting_server_recovering + this.#adminSuffix(services.failing)
          : this.noCompatibleProcedureMessage();
        retry = services.compatible;
        break;
      case "checking-service":
        message = this.#messages.error_connecting_service + this.#adminSuffix(true);
        break;
    }
    let shown = false;
    const choice = new Promise<boolean>((resolve) => {
      shown = this.#show(
        message,
        retry ? { text: this.#messages.retry_operation, onClick: () => resolve(true) } : null,
        { text: this.#messages.close, onClick: () => resolve(false) },
        () => resolve(false),
      );
    });
    return shown ? choice : null;
  }

  showInsecureContextWarning(): Promise<void> | null {
    let shown = false;
    const closed = new Promise<void>((resolve) => {
      shown = this.#show(
        this.#warningText() + this.#messages.unsecure_context,
        null,
        { text: this.#messages.ok, onClick: resolve },
        resolve,
      );
    });
    return shown ? closed : null;
  }

  /** Muestra un mensaje de error sin reintento. Devuelve si se ha mostrado. */
  showMessage(html: string, onClose?: () => void): boolean {
    return this.#show(html, null, { text: this.#messages.close, onClick: onClose ?? noop });
  }

  close(): void {
    const teardown = this.#teardown;
    const dismiss = this.#onDismiss;
    this.#teardown = null;
    this.#onDismiss = null;
    teardown?.();
    dismiss?.();
  }

  /** Mensaje con el enlace de descarga adecuado al dispositivo. */
  downloadMessage(): string {
    const messages = this.#messages;
    if (this.#platform.android)
      return `${this.#androidDownloadUrl ?? messages.android_download_url}<br>${messages.install_client}`;
    if (this.#platform.ios)
      return `${this.#iosDownloadUrl ?? messages.ios_download_url}<br>${messages.install_client}`;
    let text = `${this.#pcDownloadUrl ?? messages.pc_download_url}<br>${messages.restore_installation}`;
    if (this.#platform.firefox)
      text += `<br>${this.#warningText()}${messages.firefox_reinstall_message}`;
    return text;
  }

  /** Mensaje para tramites que no se pueden completar en el dispositivo. */
  noCompatibleProcedureMessage(): string {
    const messages = this.#messages;
    const alternative = this.#platform.android
      ? this.#alternativeAndroidAppLink
      : this.#platform.ios
        ? this.#alternativeIOSAppLink
        : null;
    return (
      messages.no_compatible_procedure +
      (alternative === null
        ? messages.access_from_pc
        : `${messages.procedure_from_url} ${alternative}`)
    );
  }

  #adminSuffix(include: boolean): string {
    return include && this.#adminContactInfo
      ? ` ${this.#messages.contact_admin} ${this.#adminContactInfo}`
      : "";
  }

  #warningText(): string {
    return `<span id='afirmaWarningText' class='${this.classes.warning}'>${this.#messages.warning}</span> `;
  }

  #show(
    html: string,
    action: DialogButton | null,
    close: DialogButton | null,
    onDismiss?: () => void,
  ): boolean {
    this.close();
    const document = this.#document;
    if (!this.#enabled || !document?.body) return false;
    const loading = action === null && close === null;
    if (loading ? !this.#loadingEnabled : !this.#errorEnabled) return false;
    this.installStyles();
    const classes = this.classes;
    const element = (tag: string, id: string | null, className: string): HTMLElement => {
      const node = document.createElement(tag);
      if (id) node.id = id;
      node.className = className;
      return node;
    };

    const overlay = element("div", OVERLAY_ID, classes.background);
    const container = element("div", "afirmaChildDiv", classes.dialog);
    container.setAttribute("role", "dialog");
    container.setAttribute("aria-modal", "true");
    container.setAttribute("aria-label", "Autofirma");
    container.tabIndex = -1;
    const panel = element("div", "afirmaMessagePanel", classes.messagePanel);
    const logo = element("div", "afirmaImgDiv", classes.logo);
    // Mismo orden de atributos que el original: clase y despues id.
    const text = document.createElement("span");
    text.className = loading ? classes.loadingText : classes.errorText;
    text.id = "afirmaSupportDialogLabel";
    text.append(sanitizeHtml(document, html));
    const message = document.createElement("div");
    message.append(text);
    panel.append(logo, message);
    if (loading) panel.append(element("div", null, classes.spinner));
    container.append(panel);
    if (!loading) {
      const buttons = element("div", null, classes.buttonContainer);
      for (const [button, id, className] of [
        [action, "afirmaActionButton", classes.actionButton],
        [close, "afirmaCloseButton", classes.closeButton],
      ] as const) {
        if (!button) continue;
        const node = element("button", id, className) as HTMLButtonElement;
        node.type = "button";
        node.textContent = button.text;
        node.addEventListener("click", () => {
          this.#onDismiss = null;
          this.close();
          button.onClick();
        });
        buttons.append(node);
      }
      container.append(buttons);
    }
    overlay.append(container);

    // Se oculta el resto de la pagina a los lectores de pantalla y se bloquea el scroll,
    // guardando el estado previo para restaurarlo exactamente al cerrar.
    const hidden = Array.from(
      document.body.children,
      (child) => [child, child.getAttribute("aria-hidden")] as const,
    );
    for (const [child] of hidden) child.setAttribute("aria-hidden", "true");
    const overflow = [document.body.style.overflow, document.documentElement.style.overflow];
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    const previousFocus = document.activeElement as HTMLElement | null;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") this.#dismissWith(close);
    };
    document.body.append(overlay);
    document.addEventListener("keydown", onKeyDown);
    container.focus();

    this.#onDismiss = onDismiss ?? null;
    this.#teardown = () => {
      document.removeEventListener("keydown", onKeyDown);
      overlay.remove();
      for (const [child, value] of hidden) {
        if (value === null) child.removeAttribute("aria-hidden");
        else child.setAttribute("aria-hidden", value);
      }
      document.body.style.overflow = overflow[0] ?? "";
      document.documentElement.style.overflow = overflow[1] ?? "";
      if (previousFocus?.isConnected) previousFocus.focus();
    };
    return true;
  }

  #dismissWith(button: DialogButton | null): void {
    this.#onDismiss = null;
    this.close();
    button?.onClick();
  }

  #createApi(): SupportDialogApi {
    const set =
      (key: keyof SupportDialogClasses) =>
      (cls: string): void => {
        this.classes[key] = cls;
      };
    return {
      enableSupportDialog: (isEnabled) => {
        this.#enabled = isEnabled;
      },
      enableLoadingDialog: (isEnabled) => {
        this.#loadingEnabled = isEnabled;
      },
      enableErrorDialog: (isEnabled) => {
        this.#errorEnabled = isEnabled;
      },
      setBackgroundClass: set("background"),
      setDialogClass: set("dialog"),
      setMessagePannelClass: set("messagePanel"),
      setLoadingTextClass: set("loadingText"),
      setErrorTextClass: set("errorText"),
      setWarningClass: set("warning"),
      setButtonContainerClass: set("buttonContainer"),
      setActionButtonClass: set("actionButton"),
      setCloseButtonClass: set("closeButton"),
      setLogoClass: set("logo"),
      setSpinnerClass: set("spinner"),
      setPCDownloadURL: (url) => {
        this.#pcDownloadUrl = url;
      },
      setAndroidDownloadURL: (url) => {
        this.#androidDownloadUrl = url;
      },
      setIOSDownloadURL: (url) => {
        this.#iosDownloadUrl = url;
      },
      setAdminContactInfo: (text) => {
        this.#adminContactInfo = text;
      },
      setAlternativeAndroidAppLink: (text) => {
        this.#alternativeAndroidAppLink = text;
      },
      setAlternativeIOSAppLink: (text) => {
        this.#alternativeIOSAppLink = text;
      },
    };
  }
}

function noop(): void {}
