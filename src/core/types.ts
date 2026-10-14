import type { KeyStore } from "./constants.js";
import type { ErrorDialogKind } from "./errors.js";

/** Operaciones criptograficas que realiza Autofirma. */
export type SignOperation = "sign" | "cosign" | "countersign";

/**
 * Algoritmo de firma. Desde Autofirma 1.8 basta con el algoritmo de huella (`SHA256`) y el
 * tipo de clave se decide segun el certificado.
 */
export type SignAlgorithm =
  | "SHA1"
  | "SHA256"
  | "SHA384"
  | "SHA512"
  | "SHA1withRSA"
  | "SHA256withRSA"
  | "SHA384withRSA"
  | "SHA512withRSA"
  | "SHA256withECDSA"
  | "SHA384withECDSA"
  | "SHA512withECDSA"
  | (string & {});

/** Formato de firma. Los terminados en `tri` se firman de forma trifasica. */
export type SignFormat =
  | "CAdES"
  | "CAdEStri"
  | "CAdES-ASiC-S"
  | "CAdES-ASiC-S-tri"
  | "XAdES"
  | "XAdEStri"
  | "XAdES-ASiC-S"
  | "XAdES-ASiC-S-tri"
  | "PAdES"
  | "PAdEStri"
  | "FacturaE"
  | "FacturaEtri"
  | "CMS/PKCS#7"
  | "XMLdSig"
  | "ODF"
  | "OOXML"
  | "NONE"
  | "AUTO"
  | (string & {});

/**
 * Parametros adicionales de configuracion (`extraParams`). Puede ser el texto de Properties
 * (`clave=valor` separados por `\n`) o un objeto; las entradas `null`/`undefined` se omiten.
 */
export type ExtraParams =
  | string
  | Readonly<Record<string, string | number | boolean | null | undefined>>;

/** Opciones comunes a todas las operaciones. */
export interface OperationOptions {
  /** Permite abortar la espera en el navegador. No cancela una firma ya iniciada en Autofirma. */
  readonly signal?: AbortSignal;
}

/** Peticion de firma. */
export interface SignRequest extends OperationOptions {
  /**
   * Datos en Base64 (estandar o URL-safe), una URL http(s) o una referencia para el gestor de
   * documentos del servicio trifasico. Si se omite, Autofirma pide al usuario el fichero.
   */
  readonly data?: string | null;
  readonly algorithm: SignAlgorithm;
  readonly format: SignFormat;
  readonly extraParams?: ExtraParams | null;
}

/** Peticion de cofirma o contrafirma sobre una firma existente. */
export interface MultiSignRequest extends OperationOptions {
  /** Firma en Base64. Si se omite, Autofirma pide al usuario el fichero de firma. */
  readonly signature?: string | null;
  readonly algorithm: SignAlgorithm;
  readonly format: SignFormat;
  readonly extraParams?: ExtraParams | null;
}

/** Peticion de firma, cofirma o contrafirma con guardado del resultado en disco. */
export interface SignAndSaveRequest extends SignRequest {
  /** Operacion criptografica a realizar. Por defecto, `sign`. */
  readonly operation?: SignOperation;
  /** Nombre de fichero propuesto al usuario. */
  readonly fileName?: string | null;
}

/** Peticion de seleccion de certificado. */
export interface SelectCertificateRequest extends OperationOptions {
  /** Filtros de certificados y demas opciones (`filters`, `headless`...). */
  readonly extraParams?: ExtraParams | null;
}

/** Resultado de una firma, cofirma o contrafirma. */
export interface SignResult {
  /** Firma generada en Base64. */
  readonly signature: string;
  /** Certificado de firma en Base64, si Autofirma lo devuelve. */
  readonly certificate: string | null;
  /** Datos adicionales en texto (JSON), por ejemplo el nombre del fichero firmado. */
  readonly extraData: string | null;
}

/** Estado de cada firma de un lote. */
export type BatchSignState =
  | "DONE_AND_SAVED"
  | "DONE_BUT_ERROR_SAVING"
  | "ERROR_PRE"
  | "ERROR_POST"
  | "NOT_STARTED"
  | "DONE_BUT_NOT_SAVED_YET"
  | "DONE_BUT_SAVED_SKIPPED"
  | "SKIPPED"
  | "SAVE_ROLLBACKED";

/** Resultado de una firma de un lote. Se relaciona con el documento por `id`, no por posicion. */
export interface BatchSignOutcome {
  readonly id: string;
  readonly result: BatchSignState | (string & {});
  readonly description?: string;
  /** Firma en Base64, solo en lotes locales (monofasicos). */
  readonly signature?: string;
}

/** Resultado JSON de un lote. */
export interface BatchResult {
  readonly signs: readonly BatchSignOutcome[];
}

/** Respuesta de una firma de lote. */
export interface BatchSignResult {
  /** Resultado JSON del lote o, si no es JSON (lotes XML), el texto devuelto. */
  readonly result: BatchResult | string;
  /** Certificado de firma en Base64. */
  readonly certificate: string | null;
}

/** Peticion de guardado de datos en disco. */
export interface SaveRequest extends OperationOptions {
  /** Datos en Base64. */
  readonly data: string;
  readonly title?: string | null;
  readonly fileName?: string | null;
  readonly extension?: string | null;
  readonly description?: string | null;
}

/** Peticion de carga de ficheros mediante Autofirma. */
export interface LoadRequest extends OperationOptions {
  readonly title?: string | null;
  /** Extensiones permitidas separadas por comas. */
  readonly extensions?: string | null;
  readonly description?: string | null;
  /** Ruta propuesta en el dialogo. */
  readonly filePath?: string | null;
}

/** Fichero cargado. */
export interface LoadedFile {
  readonly name: string;
  /** Contenido en Base64. */
  readonly data: string;
}

/** Canal de comunicacion con Autofirma. */
export type TransportKind = "websocket" | "https" | "intermediate";

/** Rango de puertos locales en el que Autofirma escuchara. */
export interface PortRange {
  readonly min: number;
  readonly max: number;
}

/** Servicios de almacenamiento y recuperacion del servidor intermedio. */
export interface Servlets {
  readonly storage: string;
  readonly retriever: string;
}

/** Configuracion de un cliente. */
export interface ClientSettings {
  /** Almacen de certificados por defecto. `null` usa el del sistema. */
  readonly keyStore: KeyStore | (string & {}) | null;
  /** Mantiene el certificado seleccionado para las siguientes operaciones. */
  readonly stickySignatory: boolean;
  /** Nombre de la aplicacion que se muestra en Autofirma. Por defecto, el dominio de la pagina. */
  readonly appName: string | null;
  /** Version minima de Autofirma requerida (`mcv`). */
  readonly minimumClientVersion: string | null;
  /** Tiempo maximo de lectura de servicios por parte de Autofirma, en milisegundos. */
  readonly serviceTimeout: number | null;
  /** Muestra el dialogo de espera nativo de Autofirma. */
  readonly progressDialog: boolean;
  /** Rango de puertos locales. `null` usa el rango dinamico 49152-65535. */
  readonly portRange: PortRange | null;
  /** Servicios del servidor intermedio. `null` usa los del origen de la pagina. */
  readonly servlets: Servlets | null;
  /** Intentos de conexion con Autofirma. */
  readonly connectionRetries: number;
  /** Espera entre intentos de conexion, en milisegundos. */
  readonly launchingTime: number;
}

/** Estado de las comprobaciones de los servicios del servidor intermedio. */
export interface ServiceStatus {
  /** Se ha hecho alguna comprobacion. */
  checked: boolean;
  /** La ultima comprobacion fallo. */
  failing: boolean;
  /** El tramite se puede completar desde este dispositivo. */
  compatible: boolean;
}

/**
 * Presentacion de dialogos durante una operacion. La implementa `autoscript-ts/ui` con el
 * mismo aspecto que el script original, pero el integrador puede ofrecer la suya.
 */
export interface OperationDialogs {
  /** Muestra el dialogo de carga. */
  showLoading(): void;
  /** Cierra el dialogo visible. */
  close(): void;
  /**
   * Muestra un dialogo de error. Resuelve `true` si el usuario pide reintentar y `false` si lo
   * cierra. Devuelve `null` si los dialogos de error estan desactivados.
   */
  showError(kind: ErrorDialogKind, services: Readonly<ServiceStatus>): Promise<boolean> | null;
  /** Avisa de que el contexto no es seguro. Devuelve `null` si no se muestra. */
  showInsecureContextWarning(): Promise<void> | null;
  /** Indica si hay un dialogo abierto. */
  isOpen(): boolean;
}
