import type { Environment } from "../browser/environment.js";
import type { OperationDialogs, ServiceStatus, TransportKind } from "../core/types.js";
import type { NativeResult, OperationSettings, WireOperation } from "../protocol/operation.js";

/** Contexto de una operacion en curso. */
export interface OperationContext {
  readonly settings: OperationSettings;
  readonly signal: AbortSignal;
  readonly env: Environment;
  readonly dialogs: OperationDialogs | null;
  readonly services: ServiceStatus;
}

/** Canal de comunicacion con Autofirma. Hay tres implementaciones con dialectos distintos. */
export interface Transport {
  readonly kind: TransportKind;
  /** Envia una operacion a Autofirma y devuelve su resultado interpretado. */
  execute(operation: WireOperation, context: OperationContext): Promise<NativeResult>;
  /** Libera sockets y estado. */
  dispose(): void;
}

/** Senal que se aborta con la del padre o al vencer el plazo indicado. */
export function deadlineSignal(
  env: Environment,
  milliseconds: number,
  parent: AbortSignal,
): { readonly signal: AbortSignal; dispose(): void } {
  const controller = new AbortController();
  const abort = (): void => controller.abort(parent.reason);
  if (parent.aborted) abort();
  else parent.addEventListener("abort", abort, { once: true });
  const handle = env.setTimeout(
    () => controller.abort(new DOMException("Plazo agotado", "TimeoutError")),
    milliseconds,
  );
  return {
    signal: controller.signal,
    dispose() {
      env.clearTimeout(handle);
      parent.removeEventListener("abort", abort);
    },
  };
}
