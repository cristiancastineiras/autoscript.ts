# Arquitectura y contratos

Implementacion TypeScript nueva, sin ejecutar el JavaScript de referencia.
DRY concentra reglas de protocolo y encoding; YAGNI evita clases por formato,
contenedores DI y un motor criptografico de firma en el navegador.

## Modules

| Module     | Decide                                                      | No depende de                     |
| ---------- | ----------------------------------------------------------- | --------------------------------- |
| core       | Operacion activa, configuracion, snapshots, errores y lotes | DOM, UI, DES, transporte concreto |
| encoding   | Bytes Base64 y texto UTF-8 estricto                         | Estado del cliente, DOM           |
| protocol   | Dialectos, Properties, XML y resultados por operacion       | Red, UI, globals                  |
| transports | Handshake, mensajes, fragmentos, polling y cifrado wire     | Dialogos y callbacks legacy       |
| browser    | Lanzamiento, red acotada, reloj y seleccion del Adapter     | Globals legacy                    |
| compat     | Nombres/aridades/callbacks y registro explicito             | Monolito de referencia            |
| ui         | Dialog, sanitizacion, mensajes y estilos optativos          | Estado del transporte             |

La Interface de Transport existe porque hay tres Adapters reales. Sus pruebas
inyectan sockets, fetch, lanzamiento y cifrado; no se introduce una Interface
para cada funcion pura. Los imports usan `.js`, tipos explicitos y
isolatedDeclarations. El root es seguro de importar sin DOM.

## Operacion

Una instancia acepta una operacion nativa activa. Una segunda llamada falla con
busy; no se encola ni se reenvia una firma. La configuracion y las Properties se
capturan antes del primer await. Cambiar configuracion durante la operacion falla.

Cada ejecucion posee AbortController, plazo de espera y callbacks locales. finally
libera listeners y timers. Un error invalida el canal local; WebSocket cierra
candidatos perdedores y conserva solo el primero que completa el eco. HTTPS arma
fragmentos en orden y limita numero y longitud. Las descargas son independientes.

Abortar la espera no equivale a cancelar el proceso nativo. No iniciar otra firma
mientras siga abierto el proceso anterior en Autofirma. Los timers del navegador
pueden suspenderse en movil; el timeout local no garantiza caducidad del servidor.

## Contratos wire

- WebSocket: `afirma://websocket`, eco con idsession, URI de operacion plana,
  `#wait` y `getresult`, sin Socket.IO ni protocolos nuevos.
- HTTPS: POST local con sobres historicos `@EOF`; cmd o fragment/firm, seguido
  por send. No se convierte ese cuerpo a un formulario estandar incompatible.
- Intermedio: storage/retrieve por POST, XML escapado para peticiones largas,
  ids por operacion, espera por err-06 y #wait, limites y errores terminales.
- AES-256-CBC usa WebCrypto y el IV/formato existente; no se introduce AEAD sin
  negociar otra version. DES-ECB decimal se permite solo con legacyCipher.
  des.js sustituye la Implementacion criptografica copiada del monolito.
- La ultima respuesta DES conserva el recorte historico de ocho bytes extra.
  La respuesta local de firma sin certificado conserva la doble codificacion.
  Ambos contratos requieren fixtures nativos para confirmar paridad definitiva.
- Properties admite texto raw o un record tipado. El builder JSON de lote
  codifica extraparams en Base64 y usa Map para IDs unicos y orden estable.

No se registran documentos, firmas, certificados, PIN, claves, IV ni URIs.
Los endpoints exigen HTTPS sin credenciales salvo opt-in de servicios HTTP para
compatibilidad. Esto no evita CORS, permisos de red local, CSP ni confianza TLS.

## Diferencias intencionales

- UTF-8 correcto para astrales, CRLF conservado, BOM preservado y rechazo de
  surrogates aislados, UTF-8 invalido y Base64 no canonico.
- appname se codifica una vez; dlgload=false se transmite; timeout HTTPS no
  depende de helpers fuera de alcance; XML y sus atributos se escapan.
- Errores sin codigo no reutilizan el anterior. Los getters legacy Type y Code
  son distintos y todos los callbacks pertenecen a la peticion.
- CheckTime es async y obligatorio bloquea las operaciones hasta resolverse.
- SupportDialog tiene veinte setters, seis locales y HTML sanitizado. No conserva
  HTML peligroso, estilos/PNG embebidos, soporte IE ni mutaciones del body.
- Globals se registran solo con installGlobals. MiniApplet es el mismo objeto.
  Base64 publica cuatro operaciones; Cipher y helpers privados antiguos no son
  una oferta criptografica publica nueva.
- VERSION de la fachada identifica la referencia 1.10.1, no la version nativa
  instalada ni la version de distribucion de este paquete.

## Localizacion y soporte

`src/ui/locale-catalog.ts` conserva las 25 claves de mensaje de la referencia en
es_ES, gl_ES, va_ES, ca_ES, eu_ES y en_US. TypeScript exige la misma estructura
para cada idioma; los tests verifican clave, texto no vacio y fallback a es_ES.
`setLocale` actualiza el dialogo y el siguiente `checkTime`. Los errores de
conexion, espera, recuperacion y cifrado inseguro usan ayuda localizada; el
reintento es una accion manual y nunca reenvia una firma automaticamente.

Las URLs de tiendas y portal son datos HTTPS con etiquetas accesibles, no HTML
con badges o imagenes embebidas. El dialogo crea anchors seguros. Los setters
legacy que reciben HTML se conservan como contenido personalizado y pasan por
DOMPurify; no se promete identidad visual con las imagenes de la referencia.
Las advertencias recomendadas y obligatorias de reloj incluyen ambas horas y
los nombres de campo traducidos; el modo obligatorio conserva el bloqueo.

## Verificacion y release

`pnpm check` exige formato, lint, tipos, cobertura del 90 % por Implementation,
build, imports ESM/CommonJS, Publint y ATTW. Los tests prueban encoding, builders,
resultados, lotes, carreras, callbacks, recursos, AES/DES, HTTP, reloj, UI y globals.
El inventario publico se contrasta con el AST del archivo original, sin ejecutarlo.

La biblioteca permanece private/UNLICENSED. No se afirma paridad certificada ni
"100 %" del sistema por pasar unitarias. Siguen pendientes las puertas del estudio:
Autofirma real en Windows/macOS/Linux, certificados/almacenes, Android/iOS, TLS/CSP,
permisos de red, suspension, servlets/trifasico/DocumentManager y procedencia legal.
Los tests simulados no garantizan CAdES/PAdES/XAdES/FacturaE nativos ni cancelacion.
