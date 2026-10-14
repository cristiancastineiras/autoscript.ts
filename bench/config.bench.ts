import { describe, test } from "vitest";
import { defineConfig } from "../src/core/index.js";

describe("core configuration", () => {
  test("default configuration", async ({ bench }) => {
    await bench("default configuration", () => {
      defineConfig();
    }).run();
  });

  test("custom configuration", async ({ bench }) => {
    await bench("custom configuration", () => {
      defineConfig({ timeoutMs: 5_000 });
    }).run();
  });
});
