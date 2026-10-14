/** Version de AutoScript. Coincide con la del `autoscript.js` original al que sustituye. */
export const VERSION: string = __AUTOSCRIPT_VERSION__;

/** Version del cliente JavaScript que se notifica a Autofirma (`jvc`). */
export const VERSION_CODE = 4;

/** Version del protocolo de invocacion de Autofirma (`v` / `ver`). */
export const PROTOCOL_VERSION = 4;

/** Almacenes de certificados que Autofirma sabe abrir. */
export const KEYSTORE = {
  WINDOWS: "WINDOWS",
  APPLE: "APPLE",
  PKCS12: "PKCS12",
  PKCS11: "PKCS11",
  MOZILLA: "MOZ_UNI",
  SHARED_NSS: "SHARED_NSS",
  JAVA: "JAVA",
  JCEKS: "JCEKS",
  JAVACE: "JAVACE",
  DNIE: "DNIEJAVA",
} as const;

/** Identificador de almacen de certificados. */
export type KeyStore = (typeof KEYSTORE)[keyof typeof KEYSTORE];

/** Politicas de comprobacion de la hora del sistema frente a la del servidor. */
export const CHECKTIME = {
  NO: "CT_NO",
  RECOMMENDED: "CT_RECOMMENDED",
  OBLIGATORY: "CT_OBLIGATORY",
} as const;

/** Politica de comprobacion horaria. */
export type CheckTimeType = (typeof CHECKTIME)[keyof typeof CHECKTIME];

/** Espera entre intentos de conexion con Autofirma, en milisegundos. */
export const AUTOFIRMA_LAUNCHING_TIME = 2000;

/** Intentos de conexion antes de considerar que Autofirma no esta instalado. */
export const AUTOFIRMA_CONNECTION_RETRIES = 15;

/** Rutas por defecto de los servicios del servidor intermedio. */
export const DEFAULT_STORAGE_PATH = "/afirma-signature-storage/StorageService";
export const DEFAULT_RETRIEVER_PATH = "/afirma-signature-retriever/RetrieveService";
