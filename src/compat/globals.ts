import { createLegacyAutoScript, disposeLegacyAutoScript } from "./facade.js";
import type { LegacyAutoScript, LegacyOptions } from "./types.js";
import { createSupportDialog, type SupportController, type SupportDialog } from "../ui/dialog.js";
import { base64ToText, encodeBase64, textToBase64 } from "../encoding/index.js";

export interface InstallGlobalsOptions extends LegacyOptions {
  readonly target?: Record<string, unknown>;
  readonly overwrite?: boolean;
  readonly dialog?: SupportController;
}
export interface InstalledGlobals {
  readonly AutoScript: LegacyAutoScript;
  readonly SupportDialog: SupportDialog;
  dispose(): void;
}

export function installGlobals(options: InstallGlobalsOptions = {}): InstalledGlobals {
  const target = options.target ?? (globalThis as unknown as Record<string, unknown>);
  const keys = ["AutoScript", "MiniApplet", "SupportDialog", "Base64"];
  const descriptors = keys.map((key) => Object.getOwnPropertyDescriptor(target, key));
  if (
    keys.some(
      (key, index) =>
        (!options.overwrite && key in target) || descriptors[index]?.configurable === false,
    )
  )
    throw new TypeError("Refusing to overwrite existing AutoScript globals.");
  const support = options.dialog ?? createSupportDialog();
  const autoScript = createLegacyAutoScript({ ...options, support: options.support ?? support });
  const values: unknown[] = [
    autoScript,
    autoScript,
    support.api,
    {
      encode(text: string, urlSafe = false): string {
        return textToBase64(text, { urlSafe });
      },
      decode(data: string, urlSafe = false): string {
        return base64ToText(data, { urlSafe });
      },
      encodeArrayBuffer(data: ArrayBuffer, urlSafe = false): string {
        return encodeBase64(new Uint8Array(data), { urlSafe });
      },
      encodeByteArray(data: Uint8Array | readonly number[], urlSafe = false): string {
        return encodeBase64(new Uint8Array(data), { urlSafe });
      },
    },
  ];
  keys.forEach((key, index) =>
    Object.defineProperty(target, key, {
      configurable: true,
      writable: true,
      enumerable: true,
      value: values[index],
    }),
  );
  return {
    AutoScript: autoScript,
    SupportDialog: support.api,
    dispose() {
      disposeLegacyAutoScript(autoScript);
      support.dispose();
      keys.forEach((key, index) => {
        if (target[key] !== values[index]) return;
        const previous = descriptors[index];
        if (previous) Object.defineProperty(target, key, previous);
        else delete target[key];
      });
    },
  };
}
