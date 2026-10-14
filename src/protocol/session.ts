import type { PortRange } from "../core/types.js";

/** Alfabeto de los identificadores de sesion del protocolo (sin `v`, como el original). */
const SESSION_ALPHABET = "1234567890abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const SESSION_LENGTH = 20;

/** Puerto minimo seleccionable. */
export const MIN_PORT = 1024;
/** Puerto maximo seleccionable. */
export const MAX_PORT = 65535;
/** Inicio del rango de puertos dinamicos que se usa por defecto. */
export const DEFAULT_MIN_PORT = 49152;

/** Genera un identificador de sesion aleatorio de 20 caracteres. */
export function newSessionId(crypto: Crypto): string {
  const values = crypto.getRandomValues(new Uint32Array(SESSION_LENGTH));
  let id = "";
  for (const value of values) id += SESSION_ALPHABET[value % SESSION_ALPHABET.length];
  return id;
}

/** Genera la clave numerica de 8 digitos del cifrado DES heredado. */
export function newDesKey(crypto: Crypto): string {
  const [value] = crypto.getRandomValues(new Uint32Array(1));
  return String(value! % 100_000_000).padStart(8, "0");
}

/**
 * Normaliza un rango de puertos con las reglas de `AutoScript.setPortRange`: los valores fuera
 * de rango se ajustan y, si solo se indica el minimo, se usa unicamente ese puerto.
 */
export function normalizePortRange(min?: number | null, max?: number | null): PortRange {
  const lower = min && min >= MIN_PORT && min <= MAX_PORT ? min : MIN_PORT;
  const upper = max
    ? max <= MAX_PORT && max >= lower
      ? max
      : MAX_PORT
    : min && min === lower
      ? lower
      : MAX_PORT;
  return { min: lower, max: upper };
}

/** Elige hasta tres puertos distintos del rango indicado (por defecto, 49152-65535). */
export function randomPorts(crypto: Crypto, range: PortRange | null): number[] {
  const min = range ? Math.max(range.min, MIN_PORT) : DEFAULT_MIN_PORT;
  const max = range ? Math.min(range.max, MAX_PORT) : MAX_PORT;
  const size = max - min + 1;
  if (size <= 1) return [min];
  const count = Math.min(3, size);
  const ports = new Set<number>();
  const random = new Uint32Array(1);
  while (ports.size < count) {
    crypto.getRandomValues(random);
    ports.add(min + (random[0]! % size));
  }
  return [...ports];
}
