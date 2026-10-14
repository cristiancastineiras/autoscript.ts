import { AutoFirmaError } from "../core/errors.js";

export function launchNative(url: string): void {
  if (typeof window === "undefined")
    throw new AutoFirmaError("unsupported", "Native launch requires a browser.");
  if (!url.startsWith("afirma://") && !url.startsWith("intent://"))
    throw new TypeError("Invalid native launch scheme.");
  window.location.href = url;
}

export function detectMobile(): boolean {
  return (
    typeof navigator !== "undefined" &&
    (/Android|iPad|iPhone|iPod|Kindle/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1))
  );
}
