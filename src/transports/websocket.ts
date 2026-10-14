import { AutoFirmaError } from "../core/errors.js";
import { deadline, delay } from "../core/lifecycle.js";
import type { OperationContext, OperationRequest, Transport } from "../core/types.js";
import { buildOperationUrl, operationParameters } from "../protocol/request.js";
import { launchNative } from "../browser/launch.js";
import { localLaunch, localPorts, randomSession, type LocalTransportOptions } from "./session.js";

export interface Socket extends EventTarget {
  readonly readyState: number;
  send(data: string): void;
  close(): void;
}
export interface WebSocketOptions extends LocalTransportOptions {
  readonly createSocket?: (url: string) => Socket;
}

function exchange(
  socket: Socket,
  message: string,
  signal: AbortSignal,
  limit: number,
): Promise<string> {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const cleanup = (): void => {
      socket.removeEventListener("message", receive);
      socket.removeEventListener("error", fail);
      socket.removeEventListener("close", fail);
      signal.removeEventListener("abort", abort);
    };
    const receive = (event: Event): void => {
      cleanup();
      const value: unknown = (event as MessageEvent<unknown>).data;
      if (typeof value !== "string" || value.length > limit)
        reject(new AutoFirmaError("protocol", "Invalid or oversized WebSocket message."));
      else resolve(value);
    };
    const fail = (): void => {
      cleanup();
      reject(new AutoFirmaError("network", "Local WebSocket disconnected.", "AS420002"));
    };
    const abort = (): void => {
      cleanup();
      reject(signal.reason);
    };
    socket.addEventListener("message", receive);
    socket.addEventListener("error", fail);
    socket.addEventListener("close", fail);
    signal.addEventListener("abort", abort, { once: true });
    try {
      socket.send(message);
    } catch (error) {
      cleanup();
      reject(error);
    }
  });
}

function opened(socket: Socket, signal: AbortSignal): Promise<void> {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const cleanup = (): void => {
      socket.removeEventListener("open", open);
      socket.removeEventListener("error", fail);
      socket.removeEventListener("close", fail);
      signal.removeEventListener("abort", abort);
    };
    const open = (): void => {
      cleanup();
      resolve();
    };
    const fail = (): void => {
      cleanup();
      reject(new AutoFirmaError("network", "Local socket unavailable."));
    };
    const abort = (): void => {
      cleanup();
      reject(signal.reason);
    };
    socket.addEventListener("open", open);
    socket.addEventListener("error", fail);
    socket.addEventListener("close", fail);
    signal.addEventListener("abort", abort, { once: true });
  });
}

export class WebSocketTransport implements Transport {
  readonly kind = "websocket" as const;
  readonly #options: WebSocketOptions;
  #socket: Socket | null = null;
  #session: string | null = null;
  #disposed: boolean = false;
  #busy: boolean = false;
  #active: AbortController | null = null;

  constructor(options: WebSocketOptions = {}) {
    this.#options = { ...options, ...(options.ports ? { ports: localPorts(options.ports) } : {}) };
  }

  async #connect(context: OperationContext): Promise<Socket> {
    const ports = localPorts(this.#options.ports);
    this.#session ??= randomSession();
    (this.#options.launch ?? launchNative)(
      localLaunch("websocket", ports, this.#session, context.config.progressDialog),
    );
    await delay(this.#options.launchDelayMs ?? 3000, context.signal);
    for (let attempt = 0; attempt < (this.#options.retries ?? 15); attempt += 1) {
      const candidates: Socket[] = [];
      const scope = deadline(this.#options.probeTimeoutMs ?? 2000, context.signal);
      try {
        const winner = await Promise.any(
          ports.map(async (port) => {
            const socket = (
              this.#options.createSocket ?? ((url: string): Socket => new WebSocket(url))
            )(`wss://127.0.0.1:${port}`);
            candidates.push(socket);
            await opened(socket, scope.signal);
            await exchange(
              socket,
              `echo=-idsession=${this.#session}@EOF`,
              scope.signal,
              context.config.maxResponseLength,
            );
            scope.signal.throwIfAborted();
            return socket;
          }),
        );
        context.signal.throwIfAborted();
        this.#socket = winner;
        return winner;
      } catch {
        context.signal.throwIfAborted();
      } finally {
        scope.dispose();
        for (const socket of candidates) if (socket !== this.#socket) socket.close();
      }
      await delay(this.#options.retryDelayMs ?? 2000, context.signal);
    }
    throw new AutoFirmaError("network", "Unable to connect to AutoFirma.");
  }

  async execute(request: OperationRequest, context: OperationContext): Promise<string> {
    if (this.#disposed) throw new AutoFirmaError("disposed", "Transport is disposed.");
    if (this.#busy) throw new AutoFirmaError("busy", "Transport is busy.");
    const operation = operationParameters(request, context, "websocket");
    this.#active = new AbortController();
    context = { ...context, signal: AbortSignal.any([context.signal, this.#active.signal]) };
    this.#busy = true;
    try {
      const socket = this.#socket?.readyState === 1 ? this.#socket : await this.#connect(context);
      const parameters = [...operation, ["idsession", this.#session!] as const];
      let response = await exchange(
        socket,
        buildOperationUrl(
          request.operation,
          parameters,
          context.config.minimumVersion,
          "websocket",
        ),
        context.signal,
        context.config.maxResponseLength,
      );
      while (response === "#wait") {
        await delay(2000, context.signal);
        response = await exchange(
          socket,
          `getresult?idsession=${this.#session}`,
          context.signal,
          context.config.maxResponseLength,
        );
      }
      return response;
    } catch (error) {
      this.#socket?.close();
      this.#socket = null;
      throw error;
    } finally {
      this.#busy = false;
      this.#active = null;
    }
  }

  dispose(): void {
    this.#disposed = true;
    this.#active?.abort(new AutoFirmaError("disposed", "Transport is disposed."));
    this.#socket?.close();
    this.#socket = null;
  }
}
