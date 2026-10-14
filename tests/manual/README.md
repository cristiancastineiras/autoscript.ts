# Demos manuales

Las dos páginas usan `dist/`, nunca `Estudio/autoscript.js`:

- `index.html`: firma, cofirma, contrafirma, selección de certificado, archivos,
  guardado y descarga remota.
- `batch.html`: construcción y ejecución de lotes JSON con referencias a datos,
  configuración por documento y modo local o trifásico.

Desde la raíz del paquete ejecuta `pnpm demo`. El comando reconstruye la librería
y sirve estos archivos en `http://127.0.0.1:4173/` (elige el siguiente puerto si
ese ya está ocupado). En una sesión manual puedes probar `/tests/manual/index.html`
y `/tests/manual/batch.html`.

En modo intermedio, proporciona StorageService y RetrieveService HTTPS reales.
Para lote trifásico el servidor debe tener un `DocumentManager` compatible. El
servidor de demos no implementa esos servicios ni emula el cliente nativo.

El cancelador de la página detiene la espera JavaScript; no cancela una firma que
ya se esté ejecutando en AutoFirma. Descargar primero y pulsar la firma en otra
acción mantiene un gesto de usuario separado para abrir el protocolo nativo.
