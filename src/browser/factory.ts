import { AutoFirmaClient } from "../core/client.js";
import type { ClientSettings, OperationDialogs, TransportKind } from "../core/types.js";
import { HttpsTransport } from "../transports/https.js";
import { IntermediateTransport } from "../transports/intermediate.js";
import type { Transport } from "../transports/transport.js";
import { WebSocketTransport } from "../transports/websocket.js";
import { createEnvironment, isMobile, type Environment } from "./environment.js";

/** Opciones de {@link createAutoFirmaClient}. */
export interface CreateClientOptions extends Partial<ClientSettings> {
  /**
   * Canal de comunicacion. `auto` (por defecto) elige el servidor intermedio en moviles y el
   * WebSocket local en escritorio, como el script original.
   */
  readonly transport?: TransportKind | "auto" | Transport;
  /** En modo `auto`, fuerza el servidor intermedio (equivale a `setForceWSMode(true)`). */
  readonly forceIntermediate?: boolean;
  /** Dialogos de carga y error, por ejemplo los de `autoscript-ts/ui`. */
  readonly dialogs?: OperationDialogs | null;
  /** Dependencias del navegador. Por defecto, las de `globalThis`. */
  readonly environment?: Environment;
}

/** Elige el canal adecuado para el entorno. */
export function selectTransport(env: Environment, forceIntermediate = false): TransportKind {
  if (forceIntermediate || isMobile(env.platform)) return "intermediate";
  return env.webSocketSupported ? "websocket" : "https";
}

/** Crea el transporte del tipo indicado. */
export function createTransport(kind: TransportKind): Transport {
  switch (kind) {
    case "websocket":
      return new WebSocketTransport();
    case "https":
      return new HttpsTransport();
    case "intermediate":
      return new IntermediateTransport();
  }
}

/**
 * Crea un cliente de Autofirma eligiendo el canal adecuado.
 *
 * @example
 * ```ts
 * import { createAutoFirmaClient } from "autoscript-ts";
 *
 * const client = createAutoFirmaClient({ appName: "Mi sede" });
 * const certificate = await client.selectCertificate();
 * ```
 */
export function createAutoFirmaClient(options: CreateClientOptions = {}): AutoFirmaClient {
  const { transport = "auto", forceIntermediate, environment, ...rest } = options;
  const env = environment ?? createEnvironment();
  const channel =
    typeof transport === "object"
      ? transport
      : createTransport(transport === "auto" ? selectTransport(env, forceIntermediate) : transport);
  return new AutoFirmaClient({ ...rest, transport: channel, environment: env });
}
