// Compatibilidad con la interfaz global del autoscript.js original (callbacks y nombres).

export {
  createAutoScript,
  createLegacyBase64,
  installAutoScript,
  LEGACY_GLOBAL_NAMES,
  type AutoScriptOptions,
  type LegacyHostWindow,
} from "./autoscript.js";
export type {
  LegacyAutoScript,
  LegacyBase64,
  LegacyBatchCallback,
  LegacyErrorCallback,
  LegacyGlobals,
  LegacySignCallback,
} from "./types.js";
