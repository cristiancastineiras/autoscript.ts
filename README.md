# AutoScript TS

[![CI](https://github.com/cristiancastineiras/autoscript.ts/actions/workflows/ci.yml/badge.svg)](https://github.com/cristiancastineiras/autoscript.ts/actions/workflows/ci.yml)

`autoscript.js` es el script con el que una web pide firmas a [Autofirma](https://firmaelectronica.gob.es),
la aplicación de firma electrónica del Gobierno de España. Este proyecto lo reescribe en
TypeScript **manteniendo el mismo protocolo y la misma interfaz**, y añade un SDK moderno:

- **`autoscript.js` compatible**: sustituye al fichero original de la versión 1.10.1 sin cambiar
  una línea de la página. Expone los mismos globals (`AutoScript`, `MiniApplet`, `SupportDialog`,
  `Base64`) con los mismos 60 miembros, callbacks y diálogos.
- **SDK tipado**: módulos ES con API de promesas, `AbortSignal`, errores tipados y
  tree-shaking. Sin dependencias en tiempo de ejecución.

La versión del paquete (`1.10.1`) coincide con la del script original al que sustituye.

## Por qué

|                                     | Original 1.10.1                                                                                                                                                | AutoScript TS                                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Tamaño / gzip                       | 249 KB (sin minificar) / 54,8 KB                                                                                                                               | 72,9 KB (`autoscript.min.js`) / 24,0 KB                          |
| Solo WebSocket con el SDK           | —                                                                                                                                                              | 6,6 KB gzip (tree-shaking)                                       |
| Base64 de 256 KiB                   | 47 ms                                                                                                                                                          | 2 ms                                                             |
| DES de 64 KiB (servidor intermedio) | 5,1 ms                                                                                                                                                         | 1,6 ms                                                           |
| APIs obsoletas                      | XHR síncrono, `ActiveXObject`, `VBArray`, `MozWebSocket`, polyfills de IE, `navigator.platform`                                                                | Ninguna                                                          |
| Errores conocidos                   | `getErrorType` roto en WebSocket, `ReferenceError` con `setServiceTimeout` en HTTPS, lote XML roto por servidor intermedio, UTF-8 incorrecto, XML sin escapar… | Corregidos (ver [migración](docs/MIGRACION.md))                  |
| Pruebas                             | —                                                                                                                                                              | 143 pruebas, incluidas comparaciones automáticas con el original |

Las cifras de rendimiento salen de `pnpm bench` (Node 24); las de tamaño, de `pnpm size`.

## Uso como sustituto de `autoscript.js`

Descargue `autoscript.js` (o `autoscript.min.js`) de la
[última release](https://github.com/cristiancastineiras/autoscript.ts/releases/latest) y sustituya
el fichero actual. La página no necesita cambios:

```html
<script src="js/autoscript.js"></script>
<script>
  AutoScript.cargarAppAfirma();
  AutoScript.setServlets(
    window.location.origin + "/afirma-signature-storage/StorageService",
    window.location.origin + "/afirma-signature-retriever/RetrieveService",
  );

  function firmar() {
    AutoScript.sign(
      datosB64,
      "SHA512withRSA",
      "CAdES",
      "mode=implicit",
      (firma, certificado, datosExtra) => {
        /* ... */
      },
      (tipo, mensaje, codigo) => {
        /* ... */
      },
    );
  }
</script>
```

Las páginas de prueba del repositorio oficial están en [`demo/`](demo/) y funcionan con este
`autoscript.js` sin modificaciones.

## Uso del SDK

```sh
npm install https://github.com/cristiancastineiras/autoscript.ts/releases/download/v1.10.1/autoscript-ts-1.10.1.tgz
```

```ts
import { AutoFirmaError, createAutoFirmaClient } from "autoscript-ts";
import { SupportDialog } from "autoscript-ts/ui"; // opcional: diálogos con el aspecto original

const client = createAutoFirmaClient({
  appName: "Sede electrónica",
  dialogs: new SupportDialog(),
});

try {
  const { signature, certificate } = await client.sign({
    data: documentoBase64,
    algorithm: "SHA512withRSA",
    format: "PAdES",
    extraParams: { signaturePages: 1, signaturePositionOnPageLowerLeftX: 50 },
  });
} catch (error) {
  if (error instanceof AutoFirmaError) console.error(error.type, error.code, error.message);
}
```

Otras operaciones:

```ts
const certificado = await client.selectCertificate({ extraParams: "filters=nonexpired:" });

// Lotes trifásicos (o locales con `local: true`)
import { Batch } from "autoscript-ts";
const lote = new Batch({ algorithm: "SHA256", format: "CAdES" })
  .add({ id: "1", reference: referencia1 })
  .add({ id: "2", reference: referencia2, format: "XAdES" });
const { result } = await client.signBatch({
  batch: lote,
  stopOnError: true,
  preSignerUrl: "https://sede.gob.es/afirma-server-triphase-signer/presign",
  postSignerUrl: "https://sede.gob.es/afirma-server-triphase-signer/postsign",
});

// Dejar de esperar (no cancela una firma ya iniciada en Autofirma)
const controller = new AbortController();
client.sign({ algorithm: "SHA256", format: "CAdES", signal: controller.signal });
controller.abort();
```

El canal se elige como en el original: servidor intermedio en Android/iOS (o con
`forceIntermediate: true`), WebSocket en escritorio y HTTPS local si no hay WebSocket. Para
cargar solo el canal que necesita, cree el cliente con su transporte:

```ts
import { AutoFirmaClient, WebSocketTransport } from "autoscript-ts";
const client = new AutoFirmaClient({ transport: new WebSocketTransport() });
```

| Entrada                       | Contenido                                                                    |
| ----------------------------- | ---------------------------------------------------------------------------- |
| `autoscript-ts`               | Cliente, transportes, lotes, errores, codificación y utilidades              |
| `autoscript-ts/ui`            | Diálogo de soporte, estilos y textos en seis idiomas                         |
| `autoscript-ts/compat`        | Fachada `AutoScript` con callbacks (`createAutoScript`, `installAutoScript`) |
| `autoscript-ts/autoscript.js` | Script clásico (IIFE) con sus tipos de globals                               |

Importar el SDK no tiene efectos secundarios ni toca el DOM, así que es seguro en SSR.

## Compatibilidad

- **Protocolo**: idéntico al de `autoscript.js` 1.10.1 en los tres canales (WebSocket, HTTPS
  local y servidor intermedio con cifrado AES/DES). Las pruebas de `tests/differential`
  ejecutan el original y esta versión contra el mismo Autofirma simulado y comparan cada
  mensaje.
- **Navegadores**: los compatibles con ES2022 (Chrome y Edge 94+, Firefox 93+, Safari 15.4+).
  Se ha retirado el soporte de Internet Explorer, EdgeHTML, Safari 10 y Firefox 60 o anterior.
- **Diferencias intencionadas** respecto al original: están documentadas en
  [docs/MIGRACION.md](docs/MIGRACION.md).

## Desarrollo

Requisitos: Node.js 24 (fijado con Volta) o 22.22+, y pnpm 12 (`corepack enable`).

```sh
pnpm install
pnpm check        # formato, lint, tipos, pruebas con cobertura, build y validación del paquete
pnpm demo         # sirve las páginas de prueba (HOST=0.0.0.0 para acceder por IP)
pnpm bench        # rendimiento frente al original
pnpm size         # tamaño de las distribuciones y del tree-shaking
```

Autofirma rechaza las páginas servidas desde `localhost` o `127.0.0.1`: para probar con
Autofirma real use `HOST=0.0.0.0 pnpm demo` y abra la IP del equipo, o la
[demo publicada](https://cristiancastineiras.github.io/autoscript.ts/).

Estructura:

```text
src/
  core/         cliente, configuracion, errores, lotes y tipos
  protocol/     URLs afirma://, parametros por canal, XML y respuestas
  transports/   WebSocket, HTTPS local y servidor intermedio
  crypto/       DES heredado y AES-256-CBC (WebCrypto)
  encoding/     Base64 y UTF-8
  browser/      entorno, deteccion de plataforma, hora y descargas
  ui/           dialogo de soporte, estilos e idiomas
  compat/       fachada AutoScript con callbacks
  autoscript.ts entrada de dist/autoscript.js
tests/          unitarias, diferenciales frente al original y del paquete compilado
demo/           paginas de prueba del repositorio oficial
Estudio/        autoscript.js original, manual del integrador y estudio de refactorizacion
```

Más detalle en [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

### Versiones y releases

Los cambios se registran con [changesets](https://github.com/changesets/changesets):
`pnpm changeset` en cada PR. Al llegar a `main`, el flujo de GitHub abre la PR
«Version Packages»; al fusionarla se crea la etiqueta y la release con `autoscript.js`,
`autoscript.min.js`, su source map y el tarball del paquete. La demo se publica en GitHub Pages.

## Licencia

Como obra derivada del Cliente @firma, se distribuye bajo **GPL-2.0-or-later** o **EUPL-1.1**, a
elección de quien la use. Ver [LICENSE](LICENSE).
