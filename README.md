# Autoscript.ts

La idea de Autoscript.ts es modernizar y simplificar el código de autoscript.js

Estamos en 2026 y autoscript js es un fichero con 6k lineas de codigo? ni gestion de versiones ni modularidad. Autoscript.ts busca resolver estos problemas ofreciendo un código más limpio, modular y fácil de mantener y TIPADO.

Con este refactor, se busca que el código sea más mantenible, escalable y menos propenso a errores, aprovechando todas las ventajas que TypeScript ofrece sobre JavaScript.

No se intenta ni quiere despreciar o desmeritar el trabajo realizado en autoscript.js, sino más bien construir sobre él y mejorar la calidad del código para el futuro.

## Estudio de migración

El [estudio completo de refactor](Estudio/ESTUDIO-REFACTORIZACION.md) cubre el
JavaScript original y el manual de integración: contratos, defectos confirmados,
recortes de compatibilidad, módulos, TypeScript moderno, dependencias, seguridad,
rendimiento, pruebas y fases de migración. La implementación TypeScript ya está
en `src/`. El estudio conserva el estado histórico previo a la migración; las
pruebas locales no certifican firma real, certificados, móvil ni servidores.

## Librería modular

Cliente TypeScript con operaciones Promise, estado por instancia, lotes
independientes y tres transportes: WebSocket, HTTPS local y servidor intermedio.
Incluye builds ESM/CommonJS, tipos, sourcemaps y compatibilidad optativa.

La librería no ejecuta ni distribuye [Estudio/autoscript.js](Estudio/autoscript.js),
no implementa el motor de firma y no accede a claves privadas. Importarla no
abre conexiones ni registra globals. DES y la sanitización HTML son dependencias
aisladas en las entradas de compatibilidad y UI.

La arquitectura, los contratos y las diferencias intencionales están descritos
en [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

Versiones comprobadas el **14 de octubre de 2026**. Las versiones de 2027 todavía
no están disponibles para verificarlas; esta base permite actualizar y comprobar
el toolchain cuando se publiquen. Oxlint y Oxfmt usan las últimas versiones
estables que superan la ventana de seguridad de 24 horas elegida para el proyecto.

### Toolchain

| Herramienta                   | Versión         | Función                                                    |
| ----------------------------- | --------------- | ---------------------------------------------------------- |
| tsdown                        | 0.23.1          | Build de librería con Rolldown y Oxc, escritos en Rust     |
| TypeScript                    | 7.0.2           | Comprobación semántica de tipos                            |
| Oxlint                        | 1.87.0          | Lint nativo con errores, sospechas y reglas de rendimiento |
| Oxfmt                         | 0.72.0          | Formateo de código y configuración                         |
| Vitest                        | 5.0.4           | Tests, workers, cobertura V8 y benchmarks                  |
| pnpm                          | 12.11.2         | Instalación reproducible con versiones exactas y lockfile  |
| Publint + Are the Types Wrong | 0.3.25 + 0.18.5 | Validación del paquete y de sus tipos                      |

No necesitas instalar Rust ni Cargo: las herramientas usan sus binarios nativos
precompilados. Rust acelera el build y el análisis, pero el resultado sigue siendo
JavaScript; no garantiza por sí solo el rendimiento del código de firma.

### Empezar

Requisitos: Node **22.18.0+ de la rama 22**, **24.11.0+ de la rama 24** o **26+**,
y pnpm **12.11.2**. Node 24 LTS es una opción adecuada para desarrollar.

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm dev
```

Si tu instalación global de pnpm es anterior, puedes usar la versión fijada sin
modificarla:

```sh
npm exec --yes --package=pnpm@12.11.2 -- pnpm install --frozen-lockfile
npm exec --yes --package=pnpm@12.11.2 -- pnpm check
```

`pnpm dev` observa cambios y recompila la librería. No es un servidor web.

### Comandos

| Comando              | Resultado                                                             |
| -------------------- | --------------------------------------------------------------------- |
| `pnpm build`         | Genera JavaScript, declaraciones y sourcemaps en `dist/`              |
| `pnpm dev`           | Build en modo watch                                                   |
| `pnpm typecheck`     | Comprueba tipos sin emitir archivos                                   |
| `pnpm lint`          | Ejecuta Oxlint y rechaza también los avisos                           |
| `pnpm lint:fix`      | Aplica correcciones de lint disponibles                               |
| `pnpm format`        | Formatea los archivos de la plantilla                                 |
| `pnpm format:check`  | Comprueba el formato sin modificar archivos                           |
| `pnpm test`          | Ejecuta los tests unitarios                                           |
| `pnpm test:watch`    | Ejecuta los tests en modo watch                                       |
| `pnpm test:coverage` | Genera cobertura V8 con umbrales del 90 % por archivo                 |
| `pnpm test:package`  | Prueba los exports ESM y CommonJS después del build                   |
| `pnpm bench`         | Ejecuta los benchmarks de rendimiento                                 |
| `pnpm check:package` | Valida los metadatos del paquete construido                           |
| `pnpm check:types`   | Comprueba los tipos del paquete empaquetado                           |
| `pnpm check`         | Ejecuta formato, lint, tipos, cobertura, build y validadores en orden |
| `pnpm pack`          | Compila y genera el paquete local sin publicarlo                      |

El comando de validación se detiene en el primer fallo. Los benchmarks quedan
fuera de ese comando porque sus tiempos dependen de la máquina y de su carga.

### Estructura

```text
src/
  index.ts             Entrada moderna, sin efectos secundarios
  core/                Cliente, configuración, lotes, tipos y ciclo de operación
  encoding/            Base64 de bytes y UTF-8 estricto
  protocol/            Dialectos, Properties, XML y respuestas nativas
  transports/          WebSocket, HTTPS, intermedio y cifrado wire
  browser/             Lanzamiento, descargas y reloj asíncrono
  compat/              Fachada de callbacks, globals y DES optativo
  ui/                  Dialog, locales y estilos instalables explícitamente
tests/
  *.test.ts            Unitarias y contratos con sockets/fetch/DOM simulados
  package.test.mjs     Imports ESM/CommonJS e inventario de la referencia
bench/
	config.bench.ts      Ejemplo de benchmark con Vitest 5
scripts/
	check.mjs            Validación multiplataforma
Estudio/
	autoscript.js        Referencia original, excluida del build y de los controles
```

El build se define en [tsdown.config.ts](tsdown.config.ts), el contrato de
distribución en [package.json](package.json) y el modo estricto en
[tsconfig.json](tsconfig.json).

### Consumir la API

API moderna en el navegador, invocada desde una acción del usuario:

```ts
import { AutoFirmaClient } from "autoscript-ts/core";
import { WebSocketTransport } from "autoscript-ts/websocket";

const client = new AutoFirmaClient(new WebSocketTransport(), {
  appName: "Mi aplicación",
  timeoutMs: 120_000,
});

const result = await client.sign({
  data: "SG9sYQ==",
  algorithm: "SHA256withRSA",
  format: "CAdES",
  properties: { mode: "implicit" },
});

console.log(result.signature);
client.dispose();
```

Para seleccionar automáticamente el transporte existe `createAutoFirmaClient`.
En móvil o modo intermedio hay que proporcionar los servicios. No se cambia a
otro transporte ni se reenvía una firma automáticamente después de un error.

```js
const { createAutoFirmaClient } = require("autoscript-ts");

const client = createAutoFirmaClient({
  transport: "intermediate",
  intermediate: {
    storageUrl: "https://firma.example/StorageService",
    retrieveUrl: "https://firma.example/RetrieveService",
  },
});
```

Entradas públicas: `autoscript-ts`, `/core`, `/encoding`, `/browser`,
`/websocket`, `/https`, `/intermediate`, `/compat`, `/compat/des` y `/ui`.
Todas pueden importarse sin DOM, pero las operaciones nativas requieren un
navegador con Autofirma instalado y los permisos, TLS y CSP adecuados.

Compatibilidad de callbacks sin globals:

```ts
import { createLegacyAutoScript } from "autoscript-ts/compat";

const AutoScript = createLegacyAutoScript();
AutoScript.cargarAppAfirma();
AutoScript.sign("SG9sYQ==", "SHA256withRSA", "CAdES", "mode=implicit", onSuccess, onError);
```

`installGlobals()` registra explícitamente AutoScript, MiniApplet, SupportDialog
y Base64, y devuelve `dispose()` para retirarlos y restaurar los anteriores.
No sobrescribe globals existentes salvo con `overwrite: true`. Cipher y los
polyfills de IE no se registran. La fachada conserva 60 claves y las aridades
históricas; `await AutoScript.checkTime(...)` es una ruptura documentada.

La UI incluye el catálogo de 25 mensajes de `autoscript.js` para `es_ES`,
`gl_ES`, `va_ES`, `ca_ES`, `eu_ES` y `en_US`. `AutoScript.setLocale(...)`
actualiza el diálogo y el siguiente `checkTime`; un código desconocido vuelve a
`es_ES`. Los enlaces de Google Play, App Store y el portal de escritorio se
renderizan como enlaces HTTPS accesibles, no como HTML de badges con imágenes.
Los setters de HTML legacy siguen admitidos, pero el contenido se sanitiza.

DES requiere consentimiento explícito del integrador:

```ts
import { createLegacyDesCipher } from "autoscript-ts/compat/des";

const client = createAutoFirmaClient({
  transport: "intermediate",
  intermediate: {
    storageUrl: "https://firma.example/StorageService",
    retrieveUrl: "https://firma.example/RetrieveService",
    legacyCipher: createLegacyDesCipher,
  },
});
```

La primera subida larga del protocolo antiguo usa DES hasta negociar AES.
Sin ese consentimiento se rechaza antes del lanzamiento. No se sustituye
AES-CBC por AES-GCM, ni se promete integridad que el protocolo no proporciona.

`timeoutMs` es el plazo de espera del cliente; `serviceTimeoutMs` se envía al
nativo y no es un timeout HTTP. `cancel()`, AbortSignal y `dispose()` detienen
la espera local y liberan recursos; no cancelan una firma ya abierta en Autofirma.
El helper de plantilla `defineConfig` sigue disponible para consumidores previos;
la configuración operativa es `defineClientConfig` o la del constructor.

### Añadir módulos

1. Crea una carpeta bajo `src/` con implementación y un `index.ts` que exporte
   únicamente su API pública. Usa exports nombrados y `export type` para tipos.
2. Añade una entrada explícita al mapa `entry` de
   [tsdown.config.ts](tsdown.config.ts). No conviertas todos los archivos internos
   en entrypoints mediante un glob general.
3. Añade el subpath a `exports` en [package.json](package.json), siguiendo el
   ejemplo de `./core`: JavaScript y tipos separados para `import` y `require`.
   Añade también el fallback correspondiente en `typesVersions`.
4. Exporta el módulo desde [src/index.ts](src/index.ts) solo si debe estar
   disponible en la entrada general. Añade sus tests y un benchmark cuando
   exista una ruta de ejecución cuyo rendimiento importe.
5. Ejecuta `pnpm check` antes de integrar el módulo.

Empieza con módulos de dominio en un único paquete. Separa transporte, protocolo
y adaptadores de entorno cuando migres código real; evita dependencias de DOM o
Node en el núcleo. No inicialices conexiones, listeners ni estado global al
importar un módulo. Cuando necesites paquetes con versiones o consumidores
independientes, puedes incorporarlos al workspace en
[pnpm-workspace.yaml](pnpm-workspace.yaml).

### Decisiones de rendimiento

- `isolatedDeclarations` habilita la emisión rápida de declaraciones con Oxc.
  Los símbolos públicos necesitan tipos explícitos; el typecheck verifica su
  corrección por separado, porque transpilar no equivale a comprobar tipos.
- `sideEffects: false`, tree-shaking y subpaths permiten eliminar código no
  utilizado. Si añades inicializaciones al importar, declara esos archivos como
  efectos secundarios en vez de mantener una afirmación incorrecta.
- El target ES2022 conserva sintaxis moderna y la plataforma neutral evita
  acoplar el núcleo a Node. No se añaden polyfills automáticamente.
- No se minifica por defecto: la aplicación consumidora puede eliminar código y
  minificar una sola vez. Una distribución directa para navegador puede tener
  una configuración de build específica cuando sea necesaria.
- Los sourcemaps de JavaScript y declaraciones conservan navegación y depuración.
  El paquete incluye `src/` para que las referencias de los mapas sean válidas.
- Los tests usan workers, pero conservan el aislamiento entre archivos. Compara
  cambios con cargas representativas: el benchmark de configuración es solo un
  ejemplo, no una medida del rendimiento de Autofirma.

### CI, actualizaciones y publicación

[.github/workflows/ci.yml](.github/workflows/ci.yml) ejecuta el mismo `pnpm check`
en Linux con Node 22.18.0, 24 y 26, y en Windows con Node 24. Instala con
`--frozen-lockfile` y conserva los informes de cobertura.

[.github/dependabot.yml](.github/dependabot.yml) prepara actualizaciones semanales
de dependencias y GitHub Actions. Para actualizar manualmente:

```sh
pnpm update --latest
pnpm check
pnpm bench
```

Las versiones directas y el lockfile quedan fijados. La política de
[pnpm-workspace.yaml](pnpm-workspace.yaml) exige 24 horas desde la publicación de
las dependencias, incluidas las transitivas, y no contiene excepciones. Revisa
los cambios de API y los requisitos de Node al actualizar versiones mayores.

La plantilla tiene `private: true` y `UNLICENSED` para impedir una publicación
accidental o atribuir una licencia no acordada. Antes de publicar, elige un
nombre disponible, define la licencia compatible con el código que migres,
actualiza la versión y retira `private`. El hook `prepublishOnly` ejecuta la
validación completa; no se ha publicado ningún paquete con esta plantilla.
