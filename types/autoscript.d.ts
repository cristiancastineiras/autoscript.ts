// Tipos de los globals que registra la distribucion clasica (dist/autoscript.js).
// Uso: `/// <reference types="autoscript-ts/autoscript.js" />` o `import "autoscript-ts/autoscript.js";`

import type { LegacyAutoScript, LegacyBase64 } from "./compat.js";
import type { SupportDialogApi } from "./ui.js";

declare global {
  /** Cliente de Autofirma con la interfaz del autoscript.js original. */
  var AutoScript: LegacyAutoScript;
  /** @deprecated Alias historico de `AutoScript`. */
  var MiniApplet: LegacyAutoScript;
  /** Configuracion de los dialogos de soporte. */
  var SupportDialog: SupportDialogApi;
  /** Utilidades Base64 del script original. */
  var Base64: LegacyBase64;
}

export {};
