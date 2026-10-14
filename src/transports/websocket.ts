import { sleep, type Environment, type WebSocketLike } from "../browser/environment.js";
import { AutoFirmaError, ERRORS, EXCEPTION } from "../core/errors.js";
import type { NativeResult, WireOperation } from "../protocol/operation.js";
import { launchUrl, websocketUrl } from "../protocol/requests.js";
import { parseLocalResponse, WEBSOCKET_CODES } from "../protocol/responses.js";
import { newSessionId, randomPorts } from "../protocol/session.js";
import type { OperationContext, Transport } from "./transport.js";

const CONNECTING = 0;
const OPEN = 1;
/** Espera tras arrancar Autofirma antes del primer intento de conexion. */
const INITIAL_WAIT = 3000;
/** Espera entre consultas `getresult` cuando Autofirma responde `#wait`. */
const GETRESULT_WAIT = 2000;

interface PendingMessage {
  resolve(data: string): void;
  reject(error: unknown): void;
}

/**
 * Comunicacion con Autofirma por WebSocket seguro local (`wss://127.0.0.1`). Es el canal por
 * defecto en escritorio: se arranca la aplicacion una vez y el socket se reutiliza para las
 * operaciones siguientes.
 */
export class WebSocketTransport implements Transport {
  readonly kind = "websocket" as const;
  #socket: WebSocketLike | null = null;
  #session: string | null = null;
  #pending: PendingMessage | null = null;
  #disposed = false;

  async execute(operation: WireOperation, context: OperationContext): Promise<NativeResult> {
    if (this.#disposed) throw disposedError();
    const { env, signal, dialogs } = context;
    const session = (this.#session ??= newSessionId(env.crypto));
    const url = websocketUrl(operation, context.settings, session, env.location?.hostname ?? null);
    try {
      const socket =
        this.#socket?.readyState === OPEN ? this.#socket : await this.#connect(context, session);
      await this.#send(socket, `echo=-idsession=${session}@EOF`, signal);
      dialogs?.close();
      let data = await this.#send(socket, url, signal);
      while (data === "#wait") {
        await sleep(env, GETRESULT_WAIT, signal);
        data = await this.#send(socket, `getresult?idsession=${session}`, signal);
      }
      return parseLocalResponse(operation, data, WEBSOCKET_CODES);
    } catch (error) {
      // Un abort local deja a Autofirma trabajando: no se reutiliza el socket para no mezclar
      // su respuesta tardia con la siguiente operacion.
      if (signal.aborted) this.#drop();
      throw error;
    }
  }

  dispose(): void {
    this.#disposed = true;
    this.#pending?.reject(disposedError());
    this.#drop();
  }

  #drop(): void {
    const socket = this.#socket;
    this.#socket = null;
    this.#pending = null;
    socket?.close();
  }

  #send(socket: WebSocketLike, message: string, signal: AbortSignal): Promise<string> {
    signal.throwIfAborted();
    return new Promise((resolve, reject) => {
      const abort = (): void => {
        this.#pending = null;
        reject(signal.reason);
      };
      signal.addEventListener("abort", abort, { once: true });
      this.#pending = {
        resolve(data) {
          signal.removeEventListener("abort", abort);
          resolve(data);
        },
        reject(error) {
          signal.removeEventListener("abort", abort);
          reject(error);
        },
      };
      try {
        socket.send(message);
      } catch (cause) {
        this.#pending = null;
        signal.removeEventListener("abort", abort);
        reject(closedError(cause));
      }
    });
  }

  #adopt(socket: WebSocketLike): WebSocketLike {
    this.#socket = socket;
    socket.addEventListener("message", (event) => {
      if (socket !== this.#socket) return;
      const pending = this.#pending;
      this.#pending = null;
      pending?.resolve(typeof event.data === "string" ? event.data : String(event.data));
    });
    socket.addEventListener("close", () => {
      if (socket !== this.#socket) return;
      this.#socket = null;
      const pending = this.#pending;
      this.#pending = null;
      pending?.reject(closedError());
    });
    return socket;
  }

  async #connect(context: OperationContext, session: string): Promise<WebSocketLike> {
    const { env, settings, signal, dialogs } = context;
    this.#drop();
    dialogs?.showLoading();
    const ports = randomPorts(env.crypto, settings.portRange);
    try {
      env.launch(launchUrl("websocket", ports, session, settings.progressDialog));
    } catch (cause) {
      dialogs?.close();
      throw AutoFirmaError.from(EXCEPTION.IO, ERRORS.WEBSOCKET_INVOICE_APP, {
        cause,
        dialog: "connecting-afirma",
      });
    }
    await sleep(env, INITIAL_WAIT, signal);
    const candidates = new Map<number, WebSocketLike>();
    let winner: WebSocketLike | null = null;
    try {
      winner = await waitForSocket(
        env,
        ports,
        candidates,
        settings.connectionRetries,
        settings.launchingTime,
        signal,
      );
    } finally {
      for (const socket of candidates.values()) if (socket !== winner) socket.close();
    }
    if (winner) return this.#adopt(winner);
    dialogs?.close();
    throw AutoFirmaError.from(EXCEPTION.APP_NOT_FOUND, ERRORS.WEBSOCKET_INVOICE_APP, {
      dialog: "connecting-afirma",
    });
  }
}

/**
 * Intenta abrir un socket en alguno de los puertos durante `retries` rondas. Los sockets que
 * siguen conectando se conservan entre rondas (por ejemplo, mientras el navegador pide permiso
 * de acceso a la red local) y solo se recrean los cerrados.
 */
function waitForSocket(
  env: Environment,
  ports: readonly number[],
  candidates: Map<number, WebSocketLike>,
  retries: number,
  launchingTime: number,
  signal: AbortSignal,
): Promise<WebSocketLike | null> {
  return new Promise((resolve, reject) => {
    let round = 0;
    let handle: unknown;
    const finish = (socket: WebSocketLike | null): void => {
      env.clearTimeout(handle);
      signal.removeEventListener("abort", abort);
      resolve(socket);
    };
    const abort = (): void => {
      env.clearTimeout(handle);
      reject(signal.reason);
    };
    const attempt = (): void => {
      if (round >= retries) {
        finish(null);
        return;
      }
      round += 1;
      for (const port of ports) {
        const current = candidates.get(port);
        if (current && current.readyState === OPEN) {
          finish(current);
          return;
        }
        if (current && current.readyState === CONNECTING) continue;
        let socket: WebSocketLike;
        try {
          socket = env.createWebSocket(`wss://127.0.0.1:${port}`);
        } catch {
          continue;
        }
        candidates.set(port, socket);
        socket.addEventListener("open", () => {
          if (candidates.get(port) === socket && !signal.aborted) finish(socket);
        });
      }
      handle = env.setTimeout(attempt, launchingTime);
    };
    signal.addEventListener("abort", abort, { once: true });
    attempt();
  });
}

function closedError(cause?: unknown): AutoFirmaError {
  return AutoFirmaError.from(
    EXCEPTION.INTERRUPTED,
    ERRORS.WEBSOCKET_CLOSE,
    cause === undefined ? {} : { cause },
  );
}

function disposedError(): AutoFirmaError {
  return new AutoFirmaError(EXCEPTION.ILLEGAL_STATE, "El cliente de Autofirma se ha liberado");
}
