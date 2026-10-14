import { sleep } from "../browser/environment.js";
import { AutoFirmaError, ERRORS, EXCEPTION } from "../core/errors.js";
import { decodeBase64 } from "../encoding/base64.js";
import { decodeUtf8, textToBase64 } from "../encoding/utf8.js";
import type { NativeResult, WireOperation } from "../protocol/operation.js";
import { httpsUrl, launchUrl } from "../protocol/requests.js";
import { parseLocalResponse, SOCKET_CODES, throwIfNativeError } from "../protocol/responses.js";
import { newSessionId, randomPorts } from "../protocol/session.js";
import { deadlineSignal, type OperationContext, type Transport } from "./transport.js";

/** Tamano maximo de cada fragmento de la peticion (menor en Firefox para evitar corrupciones). */
const MAX_FRAGMENT = 1_048_576;
const MAX_FRAGMENT_FIREFOX = 458_752;
const MEMORY_ERROR = "MEMORY_ERROR";

function decodeText(value: string): string {
  return decodeUtf8(decodeBase64(value));
}

/**
 * Comunicacion con Autofirma mediante su servicio HTTPS local (`https://127.0.0.1:puerto/afirma`).
 * Se usa en navegadores sin WebSocket. Las peticiones grandes se fragmentan y la respuesta se
 * descarga por partes.
 */
export class HttpsTransport implements Transport {
  readonly kind = "https" as const;
  #port: number | null = null;
  #session = "";
  #disposed = false;

  async execute(operation: WireOperation, context: OperationContext): Promise<NativeResult> {
    if (this.#disposed)
      throw new AutoFirmaError(EXCEPTION.ILLEGAL_STATE, "El cliente de Autofirma se ha liberado");
    const { env, dialogs } = context;
    const url = httpsUrl(operation, context.settings, env.location?.hostname ?? null);
    try {
      const port = await this.#connect(context);
      const maxSize = env.platform.firefox ? MAX_FRAGMENT_FIREFOX : MAX_FRAGMENT;
      let first: string;
      if (url.length > maxSize) {
        const total = Math.ceil(url.length / maxSize);
        for (let part = 1; part <= total; part += 1) {
          const fragment = textToBase64(url.slice((part - 1) * maxSize, part * maxSize), {
            urlSafe: true,
          });
          const ack = decodeText(
            await this.#post(port, `fragment=@${part}@${total}@${fragment}`, context),
          );
          throwIfNativeError(ack, SOCKET_CODES);
          if (ack !== (part === total ? "OK" : "MORE_DATA_NEED"))
            throw AutoFirmaError.from(EXCEPTION.GENERIC, ERRORS.WEBSOCKET_INVALID_RESP);
        }
        first = await this.#post(port, "firm=", context);
      } else {
        first = await this.#post(port, `cmd=${textToBase64(url, { urlSafe: true })}`, context);
      }
      const head = decodeText(first);
      if (operation.kind === "save" || !/^\d+$/.test(head))
        return parseLocalResponse(operation, head, SOCKET_CODES);
      const total = Number(head);
      const chunks: Uint8Array[] = [];
      for (let part = 1; part <= total; part += 1) {
        const chunk = decodeBase64(await this.#post(port, `send=@${part}@${total}`, context));
        if (chunk.length === MEMORY_ERROR.length && decodeUtf8(chunk) === MEMORY_ERROR)
          throw AutoFirmaError.from(EXCEPTION.OUT_OF_MEMORY, ERRORS.SOCKET_MEMORY_ERROR);
        chunks.push(chunk);
      }
      return parseLocalResponse(operation, decodeUtf8(concat(chunks)), SOCKET_CODES);
    } catch (error) {
      if (!(error instanceof AutoFirmaError) || error.code === ERRORS.SOCKET_CONNECTING_APP.code)
        this.#port = null;
      throw error;
    } finally {
      dialogs?.close();
    }
  }

  dispose(): void {
    this.#disposed = true;
    this.#port = null;
  }

  async #post(port: number, command: string, context: OperationContext): Promise<string> {
    let response: Response;
    try {
      response = await context.env.fetch(`https://127.0.0.1:${port}/afirma`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        // Se termina con @EOF para que el socket TLS de Autofirma sepa que la peticion acaba.
        body: `${command}idsession=${this.#session}@EOF`,
        cache: "no-store",
        signal: context.signal,
      });
    } catch (cause) {
      context.signal.throwIfAborted();
      throw AutoFirmaError.from(EXCEPTION.IO, ERRORS.SOCKET_CONNECTING_APP, { cause });
    }
    const text = await response.text();
    if (!response.ok)
      throw new AutoFirmaError(
        EXCEPTION.IO,
        text || ERRORS.SOCKET_CONNECTING_APP.message,
        ERRORS.SOCKET_CONNECTING_APP.code,
      );
    return text;
  }

  async #echo(port: number, context: OperationContext): Promise<boolean> {
    const deadline = deadlineSignal(
      context.env,
      context.settings.launchingTime * 2,
      context.signal,
    );
    try {
      const response = await context.env.fetch(`https://127.0.0.1:${port}/afirma`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `echo=-idsession=${this.#session}@EOF`,
        cache: "no-store",
        signal: deadline.signal,
      });
      return response.ok && decodeText(await response.text()) === "OK";
    } catch {
      context.signal.throwIfAborted();
      return false;
    } finally {
      deadline.dispose();
    }
  }

  async #connect(context: OperationContext): Promise<number> {
    const { env, settings, signal, dialogs } = context;
    if (this.#port !== null) {
      // Si Autofirma no responde en la mitad de los intentos, se considera cerrado y se relanza.
      const attempts = Math.max(1, Math.ceil(settings.connectionRetries / 2));
      for (let attempt = 0; attempt < attempts; attempt += 1) {
        if (await this.#echo(this.#port, context)) return this.#port;
        await sleep(env, settings.launchingTime, signal);
      }
      this.#port = null;
    }
    dialogs?.showLoading();
    this.#session = newSessionId(env.crypto);
    const ports = randomPorts(env.crypto, settings.portRange);
    try {
      env.launch(launchUrl("service", ports, this.#session, settings.progressDialog));
    } catch (cause) {
      throw AutoFirmaError.from(EXCEPTION.IO, ERRORS.SOCKET_INVOICE_APP, {
        cause,
        dialog: "connecting-afirma",
      });
    }
    for (let attempt = 0; attempt < settings.connectionRetries; attempt += 1) {
      await sleep(env, settings.launchingTime, signal);
      const answers = await Promise.all(ports.map((port) => this.#echo(port, context)));
      const index = answers.indexOf(true);
      if (index !== -1) return (this.#port = ports[index]!);
    }
    throw AutoFirmaError.from(EXCEPTION.APP_NOT_FOUND, ERRORS.SOCKET_INVOICE_APP, {
      dialog: "connecting-afirma",
    });
  }
}

function concat(chunks: readonly Uint8Array[]): Uint8Array {
  const result = new Uint8Array(chunks.reduce((size, chunk) => size + chunk.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}
