import { AutoFirmaClient } from "../core/client.js";
import { AutoFirmaError } from "../core/errors.js";
import type { ClientConfig } from "../core/types.js";
import { WebSocketTransport, type WebSocketOptions } from "../transports/websocket.js";
import { HttpsTransport, type HttpsOptions } from "../transports/https.js";
import { IntermediateTransport, type IntermediateOptions } from "../transports/intermediate.js";
import { detectMobile } from "./launch.js";

export interface CreateClientOptions {
  readonly config?: Partial<ClientConfig>;
  readonly transport?: "auto" | "websocket" | "https" | "intermediate";
  readonly websocket?: WebSocketOptions;
  readonly https?: HttpsOptions;
  readonly intermediate?: IntermediateOptions;
}

export function createAutoFirmaClient(options: CreateClientOptions = {}): AutoFirmaClient {
  const selected =
    options.transport === undefined || options.transport === "auto"
      ? detectMobile()
        ? "intermediate"
        : "websocket"
      : options.transport;
  switch (selected) {
    case "websocket":
      return new AutoFirmaClient(new WebSocketTransport(options.websocket), options.config);
    case "https":
      return new AutoFirmaClient(new HttpsTransport(options.https), options.config);
    case "intermediate": {
      if (!options.intermediate)
        throw new AutoFirmaError(
          "unsupported",
          "Configure intermediate storage/retrieve services for mobile or forced mode.",
        );
      return new AutoFirmaClient(new IntermediateTransport(options.intermediate), options.config);
    }
  }
}
