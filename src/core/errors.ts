/** Codigo y mensaje de un error conocido del cliente JavaScript. */
export interface ErrorDescriptor {
  readonly code: string;
  readonly message: string;
}

/** Nombre de un error del catalogo {@link ERRORS}. */
export type ErrorName =
  | "CIPHERING_ERROR"
  | "DECIPHERING_ERROR"
  | "BROWSER_CANT_PREPROCESS"
  | "WEBSOCKET_INVALID_RESP"
  | "BROWSER_CANT_RECOVER_RESULT"
  | "UPLOADING_TO_SERVER"
  | "CANT_CONNECT_SERVER"
  | "WEBSOCKET_CLOSE"
  | "SOCKET_CONNECTING_APP"
  | "SOCKET_NETWORK_ERROR"
  | "WEBSERVER_NETWORK_ERROR"
  | "CANCELLED_OP"
  | "UPLOAD_FILE_SERVER"
  | "UPLOAD_MULTIPLE_FILE_SERVER"
  | "NON_OPERATIVE_JS_METHOD"
  | "RETRIEVE_URL_NOT_FOUND"
  | "STORAGE_URL_NOT_FOUND"
  | "TOO_LONG_URL"
  | "UPLOADING_TO_APP"
  | "WEBSOCKET_INVOICE_APP"
  | "WEBSOCKET_MEMORY_ERROR"
  | "WEBSOCKET_UNKNOWN_ERROR"
  | "SOCKET_INVOICE_APP"
  | "SOCKET_MEMORY_ERROR"
  | "SOCKET_UNKNOWN_ERROR"
  | "WEBSERVER_INVOICE_APP"
  | "WEBSERVER_INVOICE_APP_TIMEOUT"
  | "WEBSERVER_ERROR_CONNECTING_SERVICE";

/** Catalogo de errores de AutoScript con los mismos codigos que el script original. */
export const ERRORS: Readonly<Record<ErrorName, ErrorDescriptor>> = {
  CIPHERING_ERROR: {
    code: "AS200007",
    message: "Error al cifrar los datos para el envio al cliente de firma",
  },
  DECIPHERING_ERROR: {
    code: "AS200008",
    message: "Error al descifrar los datos recibidos del cliente de firma",
  },
  BROWSER_CANT_PREPROCESS: {
    code: "AS220005",
    message: "Su navegador no permite preprocesar los datos que desea tratar",
  },
  WEBSOCKET_INVALID_RESP: { code: "AS220006", message: "Respuesta no valida" },
  BROWSER_CANT_RECOVER_RESULT: {
    code: "AS220007",
    message: "Su navegador no permite obtener el resultado de la operacion",
  },
  UPLOADING_TO_SERVER: {
    code: "AS300302",
    message:
      "Ocurrio un error al enviar los datos al servicio intermedio para la comunicacion con la aplicacion nativa",
  },
  CANT_CONNECT_SERVER: { code: "AS400003", message: "No se pudo conectar con el servidor remoto" },
  WEBSOCKET_CLOSE: {
    code: "AS420002",
    message: "Autofirma se ha cerrado o ha cerrado el websocket de comunicacion",
  },
  SOCKET_CONNECTING_APP: {
    code: "AS420503",
    message: "Se ha perdido la conexion con la aplicacion Autofirma",
  },
  SOCKET_NETWORK_ERROR: {
    code: "AS420504",
    message: "Ocurrio un error de red en la llamada al servicio de firma",
  },
  WEBSERVER_NETWORK_ERROR: {
    code: "AS420505",
    message: "Ocurrio un error de red en la llamada al servicio de firma",
  },
  CANCELLED_OP: { code: "AS500001", message: "Operacion cancelada por el usuario" },
  UPLOAD_FILE_SERVER: {
    code: "AS500008",
    message: "La operacion de carga de fichero no esta disponible por servidor intermedio",
  },
  UPLOAD_MULTIPLE_FILE_SERVER: {
    code: "AS500009",
    message:
      "La operacion de carga de multiples ficheros no esta disponible por servidor intermedio",
  },
  NON_OPERATIVE_JS_METHOD: {
    code: "AS500010",
    message: "El metodo JavaScript no se encuentra operativo",
  },
  RETRIEVE_URL_NOT_FOUND: {
    code: "AS600101",
    message: "No se ha indicado la direccion del servlet para la recuperacion de datos",
  },
  STORAGE_URL_NOT_FOUND: {
    code: "AS600102",
    message: "No se ha indicado la direccion del servlet para el guardado de datos",
  },
  TOO_LONG_URL: {
    code: "AS620014",
    message: "La URL de invocacion al servicio de firma es demasiado larga",
  },
  UPLOADING_TO_APP: {
    code: "AS620015",
    message: "Ocurrio un error al enviar los datos a la aplicacion nativa",
  },
  WEBSOCKET_INVOICE_APP: {
    code: "AS620017",
    message: "Ha ocurrido un error al intentar invocar a la aplicacion nativa mediante websocket",
  },
  WEBSOCKET_MEMORY_ERROR: {
    code: "AS620018",
    message:
      "El fichero que se pretende firmar o guardar excede de la memoria disponible para aplicacion",
  },
  WEBSOCKET_UNKNOWN_ERROR: { code: "AS620019", message: "Error desconocido" },
  SOCKET_INVOICE_APP: {
    code: "AS620020",
    message: "Ha ocurrido un error al intentar invocar a la aplicacion nativa mediante socket",
  },
  SOCKET_MEMORY_ERROR: { code: "AS620021", message: "Problema de memoria en servidor" },
  SOCKET_UNKNOWN_ERROR: { code: "AS620022", message: "Error desconocido" },
  WEBSERVER_INVOICE_APP: {
    code: "AS620023",
    message:
      "Ha ocurrido un error al intentar invocar a la aplicacion nativa mediante servidor intermedio",
  },
  WEBSERVER_INVOICE_APP_TIMEOUT: {
    code: "AS620024",
    message: "El tiempo para la recepcion de la firma por la pagina web ha expirado",
  },
  WEBSERVER_ERROR_CONNECTING_SERVICE: {
    code: "AS620025",
    message:
      "Error al conectar con el servicio de la aplicacion para recuperar el resultado de la operacion",
  },
};

/** Clases de excepcion Java con las que Autofirma y el script original tipifican los errores. */
export const EXCEPTION = {
  GENERIC: "java.lang.Exception",
  IO: "java.lang.IOException",
  CANCELLED: "es.gob.afirma.core.AOCancelledOperationException",
  OUT_OF_MEMORY: "es.gob.afirma.core.OutOfMemoryError",
  APP_NOT_FOUND: "es.gob.afirma.standalone.ApplicationNotFoundException",
  TIMEOUT: "java.util.concurrent.TimeoutException",
  INTERRUPTED: "java.lang.InterruptedException",
  UNSUPPORTED: "java.lang.UnsupportedOperationException",
  ILLEGAL_ARGUMENT: "java.lang.IllegalArgumentException",
  ILLEGAL_STATE: "java.lang.IllegalStateException",
} as const;

/** Dialogos de error con los que el integrador puede ofrecer reintentar la operacion. */
export type ErrorDialogKind =
  | "connecting-afirma"
  | "no-compatible-procedure"
  | "connecting-service"
  | "checking-service";

/** Opciones adicionales de un {@link AutoFirmaError}. */
export interface AutoFirmaErrorOptions {
  /** Error que origino este. */
  readonly cause?: unknown;
  /** Dialogo de ayuda que corresponde mostrar al usuario para este error. */
  readonly dialog?: ErrorDialogKind;
}

/**
 * Error de una operacion con Autofirma.
 *
 * `type` conserva el nombre de excepcion Java que el script original pasaba como primer
 * argumento del callback de error; `code` es el codigo `ASxxxxxx` (o el que devuelva Autofirma).
 */
export class AutoFirmaError extends Error {
  override readonly name: string = "AutoFirmaError";
  /** Tipo de error (nombre de excepcion Java). */
  readonly type: string;
  /** Codigo del error, si se conoce. */
  readonly code: string | null;
  /** Dialogo de ayuda asociado, si lo hay. */
  readonly dialog: ErrorDialogKind | null;

  constructor(
    type: string,
    message: string,
    code: string | null = null,
    options: AutoFirmaErrorOptions = {},
  ) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.type = type;
    this.code = code;
    this.dialog = options.dialog ?? null;
  }

  /** Codigo sin el prefijo de dos caracteres (`AS`), como `getErrorCodeNumber()`. */
  get codeNumber(): string | null {
    return this.code ? this.code.slice(2) : null;
  }

  /** Crea un error a partir de una entrada del catalogo {@link ERRORS}. */
  static from(
    type: string,
    descriptor: ErrorDescriptor,
    options?: AutoFirmaErrorOptions,
  ): AutoFirmaError {
    return new AutoFirmaError(type, descriptor.message, descriptor.code, options);
  }
}

/** Error de operacion abortada localmente mediante `AbortSignal` o `dispose()`. */
export function abortError(reason?: unknown): AutoFirmaError {
  if (reason instanceof AutoFirmaError) return reason;
  return new AutoFirmaError(EXCEPTION.INTERRUPTED, "Operacion abortada en el navegador", null, {
    cause: reason,
  });
}

/** Convierte cualquier valor lanzado en un {@link AutoFirmaError}. */
export function toAutoFirmaError(error: unknown): AutoFirmaError {
  if (error instanceof AutoFirmaError) return error;
  if (error instanceof Error && error.name === "AbortError") return abortError(error);
  return new AutoFirmaError(
    EXCEPTION.GENERIC,
    error instanceof Error ? error.message : String(error),
    null,
    { cause: error },
  );
}

/** Codigos que cada canal usa para los errores genericos de Autofirma. */
export interface NativeErrorCodes {
  readonly memory: ErrorDescriptor;
  readonly unknown: ErrorDescriptor;
}

/**
 * Interpreta los mensajes de error que devuelve Autofirma: `CANCEL`, `err-XX:= CODIGO - MENSAJE`,
 * `MEMORY_ERROR`, `SAF_*` y `NULL`. Devuelve `null` si la respuesta no es un error.
 */
export function parseNativeError(data: string, codes: NativeErrorCodes): AutoFirmaError | null {
  const text = data.replace(/\r?\n$/, "");
  if (text === "CANCEL") return AutoFirmaError.from(EXCEPTION.CANCELLED, ERRORS.CANCELLED_OP);
  if (text.length > 7 && text.slice(0, 4).toLowerCase() === "err-" && text.includes(":=")) {
    const type =
      text.slice(0, 7).toLowerCase() === "err-11:" ? EXCEPTION.CANCELLED : EXCEPTION.GENERIC;
    const detail = text.slice(text.indexOf(":=") + 2);
    const match = /^ ?(\S{8}) - ([\s\S]*)$/.exec(detail);
    return match
      ? new AutoFirmaError(type, match[2]!, match[1]!)
      : new AutoFirmaError(type, detail);
  }
  if (text === "MEMORY_ERROR") return AutoFirmaError.from(EXCEPTION.OUT_OF_MEMORY, codes.memory);
  if (text.length > 4 && text.startsWith("SAF_"))
    return new AutoFirmaError(EXCEPTION.GENERIC, text);
  if (text === "NULL") return AutoFirmaError.from(EXCEPTION.GENERIC, codes.unknown);
  return null;
}
