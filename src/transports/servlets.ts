import type { Environment, PageLocation } from "../browser/environment.js";
import { DEFAULT_RETRIEVER_PATH, DEFAULT_STORAGE_PATH } from "../core/constants.js";
import { AutoFirmaError, ERRORS, EXCEPTION } from "../core/errors.js";
import type { Servlets } from "../core/types.js";

/**
 * Servicios del servidor intermedio. Sin configuracion explicita se usan los del origen de la
 * pagina o, si se indica, los de la direccion base `clientAddress` (sin su ruta).
 */
export function resolveServlets(
  servlets: Servlets | null,
  location: PageLocation | null,
  clientAddress?: string | null,
): Servlets {
  if (servlets) return servlets;
  let base = clientAddress || location?.origin || null;
  if (base?.includes("://")) {
    const slash = base.indexOf("/", base.indexOf("://") + 3);
    if (slash !== -1) base = base.slice(0, slash);
  }
  if (!base) throw AutoFirmaError.from(EXCEPTION.ILLEGAL_ARGUMENT, ERRORS.STORAGE_URL_NOT_FOUND);
  return { storage: base + DEFAULT_STORAGE_PATH, retriever: base + DEFAULT_RETRIEVER_PATH };
}

/** Comprueba que los servicios de almacenamiento y recuperacion responden (`op=check`). */
export async function checkServlets(env: Environment, servlets: Servlets): Promise<boolean> {
  const check = async (url: string): Promise<boolean> => {
    try {
      const response = await env.fetch(`${url}?op=check`, { cache: "no-store" });
      return response.ok;
    } catch {
      return false;
    }
  };
  const [storage, retriever] = await Promise.all([
    check(servlets.storage),
    check(servlets.retriever),
  ]);
  return storage && retriever;
}
