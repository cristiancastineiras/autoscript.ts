# Migración desde `autoscript.js` 1.10.1

## Sustituir el fichero

`dist/autoscript.js` registra los mismos globals que el original (`AutoScript`, `MiniApplet`,
`SupportDialog` y `Base64`) con los mismos nombres, argumentos y callbacks. Basta con
reemplazar el fichero. El protocolo con Autofirma no cambia: las pruebas de
`tests/differential` envían las mismas operaciones con el original y con esta versión a un
Autofirma simulado y comparan cada mensaje, URL de invocación, subida cifrada y resultado.

Requisito nuevo: un navegador compatible con ES2022 (Chrome y Edge 94+, Firefox 93+,
Safari 15.4+). Internet Explorer, EdgeHTML, Safari 10 y Firefox 60 o anteriores ya no están
soportados.

## Diferencias intencionadas

Son correcciones de errores del original o retiradas de APIs obsoletas. Ninguna cambia el
formato de las firmas.

### Protocolo

| Cambio                                                | Original                                                                             | Ahora                                                                                                       |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Nombre de aplicación (`appname`) en WebSocket y HTTPS | Condición invertida: no se enviaba sin `setAppName` y, con él, se enviaba el dominio | Se envía el nombre configurado o, si no hay, el dominio de la página (como ya hacía el servidor intermedio) |
| `setAppName`                                          | Guardaba el nombre ya codificado y se volvía a codificar al enviarlo                 | Se codifica una sola vez                                                                                    |
| `enableProgressDialog(false)` en servidor intermedio  | Se ignoraba (`dlgload` sin valor)                                                    | Envía `dlgload=false`                                                                                       |
| Datos como URL por WebSocket                          | Se cambiaban `/` por `_`, rompiendo la URL                                           | La URL se envía codificada, igual que por HTTPS                                                             |
| Saltos de línea en datos Base64                       | Solo se eliminaban en el servidor intermedio                                         | Se eliminan en todos los canales                                                                            |
| XML de subida al servidor intermedio                  | Valores sin escapar (`&`, `<`, `"` rompían el XML)                                   | Valores escapados                                                                                           |
| `setServiceTimeout` con el canal HTTPS                | `ReferenceError` al firmar                                                           | Funciona                                                                                                    |
| Lote XML (`signBatch`) por servidor intermedio        | `ReferenceError` (`dataB64` no declarada)                                            | Funciona                                                                                                    |
| Respuestas `cert\|firma\|datosExtra` por HTTPS        | Los datos extra quedaban pegados a la firma                                          | Se separan como en WebSocket                                                                                |
| Datos extra sin relleno Base64                        | Se decodificaban con un carácter nulo al final                                       | Se decodifican correctamente                                                                                |

### Interfaz `AutoScript`

| Cambio                                       | Original                                                                         | Ahora                                                                         |
| -------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `getErrorType()` con WebSocket               | Devolvía el código (export duplicado) y `getErrorCode()` no existía              | Ambos funcionan en todos los canales                                          |
| Código en el callback de error               | `""`, `undefined` o el código de un error anterior                               | El código del error, o `""` si no lo tiene                                    |
| `getBase64FromText` / `Base64.encode`        | UTF-8 incorrecto fuera del plano básico (emojis) y cambiaba `\r\n` por `\n`      | UTF-8 estándar; no altera el texto                                            |
| `checkTime`                                  | Petición síncrona (obsoleta) que bloqueaba la página                             | Asíncrona; las operaciones esperan al resultado y `CT_OBLIGATORY` las bloquea |
| Avisos de `checkTime`                        | Mostraban entidades HTML (`p&aacute;gina`)                                       | Texto legible                                                                 |
| `downloadRemoteData`                         | Errores HTTP (404, 500) sin callback; descargas simultáneas compartían callbacks | Errores HTTP al callback de error (con un `Error`); descargas independientes  |
| Operaciones simultáneas                      | La segunda sustituía los callbacks de la primera, que nunca respondía            | La segunda falla con `java.lang.IllegalStateException`                        |
| `cargarAppAfirma` repetido                   | Dejaba abierto el socket anterior                                                | Libera el cliente anterior                                                    |
| Llamar a una operación sin `cargarAppAfirma` | `TypeError` genérico                                                             | Error explícito que indica qué falta                                          |

### Diálogos

| Cambio                                                         | Original                                                     | Ahora                                                               |
| -------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------- |
| Cerrar el diálogo                                              | Quitaba todos los `aria-hidden` y el `overflow` de la página | Restaura los valores previos y el foco                              |
| Estilos                                                        | Se añadía un `<style>` por cada `cargarAppAfirma`            | Una sola vez (admite `nonce` CSP con el SDK)                        |
| `setLocale`                                                    | Los enlaces de descarga quedaban en español                  | Los textos siguen al idioma elegido                                 |
| HTML de los integradores (`setPCDownloadURL`, etc.)            | Se insertaba sin control                                     | Se sanea: sin scripts, manejadores de eventos ni URLs `javascript:` |
| Insignia de App Store en euskera y texto en catalán/valenciano | HTML mal formado                                             | Corregido                                                           |

El DOM, los identificadores (`afirmaSupportDialog`, `afirmaActionButton`...) y las clases
(`afirma-modal-*`) son los mismos, así que los estilos personalizados siguen funcionando.

### Retirado

- Polyfills de Internet Explorer (`setTimeout`, `location.origin`), `ActiveXObject`, `VBArray`,
  `MozWebSocket`, `navigator.msLaunchUri` y el soporte de Sarissa.
- Los globals internos `Cipher` y `originalXMLHttpRequest`.
- Los mensajes de `console.log`, que incluían URLs con claves de cifrado.
- El generador pseudoaleatorio de respaldo: ids de sesión, claves y puertos usan siempre
  `crypto.getRandomValues`.

Los métodos y valores obsoletos de la interfaz (`cargarMiniApplet`, `setForceAFirma`,
`setJnlpService`, `isJNLP`, `needNativeAppInstalled`, `JAVA_ARGUMENTS`, `SYSTEM_PROPERTIES`) se
conservan sin cambios para no romper páginas existentes.

## Pasar del script clásico al SDK

| `AutoScript` (callbacks)                                                        | SDK (promesas)                                                                      |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `cargarAppAfirma()`                                                             | `createAutoFirmaClient(opciones)`                                                   |
| `setForceWSMode(true)`                                                          | `createAutoFirmaClient({ forceIntermediate: true })`                                |
| `setServlets(st, rt)`                                                           | `{ servlets: { storage: st, retriever: rt } }`                                      |
| `setKeyStore`, `setStickySignatory`, `setAppName`, `setPortRange`…              | `client.configure({ keyStore, stickySignatory, appName, portRange })`               |
| `sign(datos, alg, formato, params, ok, ko)`                                     | `await client.sign({ data, algorithm, format, extraParams })`                       |
| `coSign` / `cosign` / `counterSign`                                             | `client.coSign({ signature, ... })` / `client.counterSign(...)`                     |
| `signAndSaveToFile(op, ...)`                                                    | `client.signAndSave({ operation, ... })`                                            |
| `selectCertificate(params, ok, ko)`                                             | `await client.selectCertificate({ extraParams })`                                   |
| `createBatch` + `addDocumentToBatch` + `signBatchProcess`                       | `new Batch(...).add(...)` + `client.signBatch({ batch, ... })`                      |
| `signBatch` (XML)                                                               | `client.signBatchXml(...)`                                                          |
| `saveDataToFile` / `getFileNameContentBase64` / `getMultiFileNameContentBase64` | `client.saveDataToFile` / `client.loadFile` / `client.loadFiles`                    |
| `checkTime(tipo, max, url)`                                                     | `await checkTime({ url, maxSkew })`                                                 |
| `downloadRemoteData(url, ok, ko)`                                               | `await downloadRemoteData(url)`                                                     |
| `getErrorType()` / `getErrorMessage()` / `getErrorCode()`                       | `AutoFirmaError.type` / `.message` / `.code`                                        |
| `SupportDialog.*`                                                               | `new SupportDialog()` de `autoscript-ts/ui` (`dialog.api` tiene los mismos métodos) |

`extraParams` admite el texto de Properties de siempre o un objeto (`{ mode: "implicit" }`), que
se serializa escapando claves y valores.
