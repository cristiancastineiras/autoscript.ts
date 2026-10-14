import { describe, expect, it } from "vitest";
import {
  dialogMessages,
  isDialogLocale,
  LOCALE_CODES,
  localizedHelp,
  resolveDialogLocale,
} from "../src/ui/locales.js";

const expectedKeys = [
  "accessFromPc",
  "androidDownloadLabel",
  "androidDownloadUrl",
  "checkTimeError",
  "checkTimeLocalTime",
  "checkTimeServerTime",
  "checkTimeWarn",
  "close",
  "contactAdmin",
  "error",
  "errorConnectingAutoFirma",
  "errorConnectingClient",
  "errorConnectingServerRecovering",
  "errorConnectingService",
  "firefoxReinstallMessage",
  "installClient",
  "iosDownloadLabel",
  "iosDownloadUrl",
  "loading",
  "noCompatibleProcedure",
  "ok",
  "pcDownloadLabel",
  "pcDownloadUrl",
  "procedureFromUrl",
  "restoreInstallation",
  "retryOperation",
  "timeoutReceivingSign",
  "unsecureContext",
  "warning",
];

describe("localized support messages", () => {
  it("contains the complete source message inventory in all six locales", () => {
    expect(LOCALE_CODES).toEqual(["es_ES", "gl_ES", "va_ES", "ca_ES", "eu_ES", "en_US"]);
    for (const locale of LOCALE_CODES) {
      const translation = dialogMessages(locale);
      const actualKeys = Object.keys(translation);
      expect(actualKeys).toHaveLength(expectedKeys.length);
      for (const key of expectedKeys) expect(actualKeys).toContain(key);
      expect(Object.values(translation).every((value) => value.trim().length > 0)).toBe(true);
      expect(translation.androidDownloadUrl).toMatch(/^https:\/\//);
      expect(translation.iosDownloadUrl).toMatch(/^https:\/\//);
      expect(translation.pcDownloadUrl).toMatch(/^https:\/\//);
    }
  });

  it("uses explicit supported locales and falls back for unknown values", () => {
    for (const locale of LOCALE_CODES) expect(isDialogLocale(locale)).toBe(true);
    expect(isDialogLocale("fr_FR")).toBe(false);
    expect(resolveDialogLocale("fr_FR")).toBe("es_ES");
    expect(dialogMessages("fr_FR")).toEqual(dialogMessages("es_ES"));
  });

  it("builds platform-specific help, Firefox guidance and service messages", () => {
    const desktop = localizedHelp("en_US", "connection", "desktop", true);
    expect(desktop.text).toContain("AutoFirma");
    expect(desktop.text).toContain(dialogMessages("en_US").firefoxReinstallMessage);
    expect(desktop.links?.[0]).toEqual({
      key: "pc",
      label: "Electronic Signature Portal",
      url: dialogMessages("en_US").pcDownloadUrl,
    });
    expect(localizedHelp("es_ES", "connection", "android").links?.[0]?.url).toBe(
      dialogMessages("es_ES").androidDownloadUrl,
    );
    expect(localizedHelp("es_ES", "connection", "ios").links?.[0]?.url).toBe(
      dialogMessages("es_ES").iosDownloadUrl,
    );
    expect(localizedHelp("ca_ES", "timeout", "desktop").text).toContain("client de signatura");
    expect(localizedHelp("gl_ES", "service", "desktop").text).toBe(
      dialogMessages("gl_ES").errorConnectingService,
    );
    expect(localizedHelp("va_ES", "recovering", "desktop").text).toBe(
      dialogMessages("va_ES").errorConnectingServerRecovering,
    );
    expect(localizedHelp("eu_ES", "unsupported", "ios").text).toContain(
      dialogMessages("eu_ES").accessFromPc,
    );
    expect(localizedHelp("en_US", "insecure", "desktop").text).toBe(
      dialogMessages("en_US").unsecureContext,
    );
  });
});
