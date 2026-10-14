# autoscript-ts

## 1.10.1

Primera versión: reimplementación en TypeScript de `autoscript.js` 1.10.1 (Cliente @firma),
con la misma versión que el script al que sustituye.

- `dist/autoscript.js` y `dist/autoscript.min.js`: sustitutos directos del original, con los
  mismos globals (`AutoScript`, `MiniApplet`, `SupportDialog`, `Base64`) y el mismo protocolo
  con Autofirma en los canales WebSocket, HTTPS local y servidor intermedio.
- SDK en módulos ES: `createAutoFirmaClient` con API de promesas, `AbortSignal`, `Batch`,
  `AutoFirmaError` tipado, transportes independientes para tree-shaking y diálogos opcionales
  en `autoscript-ts/ui`. Sin dependencias en tiempo de ejecución.
- Correcciones de errores del original: `getErrorType`/`getErrorCode` en WebSocket,
  `setServiceTimeout` por HTTPS, lote XML por servidor intermedio, nombre de aplicación,
  `enableProgressDialog(false)` en servidor intermedio, UTF-8, escape del XML, descargas con
  errores HTTP y restauración de la página al cerrar los diálogos.
- Retirada de APIs obsoletas: XHR síncrono, polyfills y objetos de Internet Explorer,
  `MozWebSocket` y Sarissa.
- 56 % menos de peso (24 KB con gzip frente a 54,8 KB) y codecs entre 3 y 45 veces más rápidos.

Detalle de las diferencias en [docs/MIGRACION.md](docs/MIGRACION.md).
