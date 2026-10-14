import { AutoFirmaError, checkNativeError } from "../core/errors.js";
import { deadline, delay } from "../core/lifecycle.js";
import type { OperationContext, OperationRequest, Transport } from "../core/types.js";
import { buildOperationUrl, operationParameters } from "../protocol/request.js";
import { base64ToText, textToBase64 } from "../encoding/index.js";
import { launchNative } from "../browser/launch.js";
import { postText } from "../browser/network.js";
import { localLaunch, localPorts, randomSession, type LocalTransportOptions } from "./session.js";

export interface HttpsOptions extends LocalTransportOptions {
  readonly fetch?: typeof fetch;
  readonly fragmentSize?: number;
  readonly maxFragments?: number;
}

export class HttpsTransport implements Transport {
  readonly kind = "https" as const;
  readonly #options: HttpsOptions;
  #port: number | null = null;
  #session: string | null = null;
  #disposed: boolean = false;
  #busy: boolean = false;
  #active: AbortController | null = null;

  constructor(options: HttpsOptions = {}) {
    for (const value of [options.fragmentSize ?? 458752, options.maxFragments ?? 1024])
      if (!Number.isSafeInteger(value) || value < 1)
        throw new RangeError("Invalid fragmentation limits.");
    this.#options = { ...options, ...(options.ports ? { ports: localPorts(options.ports) } : {}) };
  }

  async #post(port: number, body: string, context: OperationContext): Promise<string> {
    return postText(
      `https://127.0.0.1:${port}/afirma`,
      `${body}idsession=${this.#session}@EOF`,
      context.signal,
      context.config.maxResponseLength,
      this.#options.fetch,
    );
  }

  async #connect(context: OperationContext): Promise<number> {
    const ports = localPorts(this.#options.ports);
    this.#session = randomSession();
    (this.#options.launch ?? launchNative)(
      localLaunch("service", ports, this.#session, context.config.progressDialog),
    );
    await delay(this.#options.launchDelayMs ?? 3000, context.signal);
    for (let attempt = 0; attempt < (this.#options.retries ?? 15); attempt += 1) {
      for (const port of ports) {
        const scope = deadline(this.#options.probeTimeoutMs ?? 2000, context.signal);
        try {
          if (
            base64ToText(await this.#post(port, "echo=-", { ...context, signal: scope.signal }), {
              urlSafe: true,
            }) === "OK"
          ) {
            this.#port = port;
            return port;
          }
        } catch {
          context.signal.throwIfAborted();
        } finally {
          scope.dispose();
        }
      }
      await delay(this.#options.retryDelayMs ?? 2000, context.signal);
    }
    throw new AutoFirmaError("network", "Unable to connect to local HTTPS service.");
  }

  async execute(request: OperationRequest, context: OperationContext): Promise<string> {
    if (this.#disposed) throw new AutoFirmaError("disposed", "Transport is disposed.");
    if (this.#busy) throw new AutoFirmaError("busy", "Transport is busy.");
    const url = buildOperationUrl(
      request.operation,
      operationParameters(request, context, "https"),
      context.config.minimumVersion,
    );
    this.#active = new AbortController();
    context = { ...context, signal: AbortSignal.any([context.signal, this.#active.signal]) };
    this.#busy = true;
    try {
      const port = this.#port ?? (await this.#connect(context));
      const fragmentSize = this.#options.fragmentSize ?? 458752;
      const total = Math.ceil(url.length / fragmentSize);
      if (total > (this.#options.maxFragments ?? 1024))
        throw new AutoFirmaError("protocol", "Too many request fragments.");
      let response: string;
      if (total <= 1)
        response = await this.#post(port, `cmd=${textToBase64(url, { urlSafe: true })}`, context);
      else {
        for (let index = 0; index < total; index += 1) {
          const part = textToBase64(url.slice(index * fragmentSize, (index + 1) * fragmentSize), {
            urlSafe: true,
          });
          const acknowledgement = base64ToText(
            await this.#post(port, `fragment=@${index + 1}@${total}@${part}`, context),
            { urlSafe: true },
          );
          if (acknowledgement !== (index + 1 === total ? "OK" : "MORE_DATA_NEED"))
            throw new AutoFirmaError("protocol", "Invalid fragment acknowledgement.");
        }
        response = await this.#post(port, "firm=", context);
      }
      const count = base64ToText(response, { urlSafe: true });
      checkNativeError(count);
      if (request.operation === "save") return count;
      if (!/^[1-9]\d*$/.test(count) || Number(count) > (this.#options.maxFragments ?? 1024))
        throw new AutoFirmaError("protocol", "Invalid response fragment count.");
      const chunks: string[] = [];
      let length = 0;
      for (let part = 1; part <= Number(count); part += 1) {
        const chunk = base64ToText(await this.#post(port, `send=@${part}@${count}`, context), {
          urlSafe: true,
        });
        length += chunk.length;
        if (length > context.config.maxResponseLength)
          throw new AutoFirmaError("protocol", "Response exceeds configured limit.");
        chunks.push(chunk);
      }
      return chunks.join("");
    } catch (error) {
      this.#port = null;
      throw error;
    } finally {
      this.#busy = false;
      this.#active = null;
    }
  }

  dispose(): void {
    this.#disposed = true;
    this.#active?.abort(new AutoFirmaError("disposed", "Transport is disposed."));
    this.#port = null;
  }
}
