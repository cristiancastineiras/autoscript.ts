# Changesets

Cada cambio que afecte a quien usa la libreria debe incluir un _changeset_:

```sh
pnpm changeset
```

El asistente pregunta el tipo de version (`patch`, `minor` o `major`) y una descripcion que
acabara en `CHANGELOG.md`. Al integrar en `main`, el flujo de GitHub abre una PR
«Version Packages» que actualiza la version y el changelog; al fusionarla se publica la
release con `autoscript.js`, `autoscript.min.js` y el tarball del paquete.

- `patch`: correcciones compatibles (por ejemplo, un error de protocolo).
- `minor`: funciones nuevas compatibles.
- `major`: cambios que rompen la interfaz publica o el comportamiento de `autoscript.js`.

La version de `AutoScript.VERSION` sale de `package.json`, asi que siempre coincide con la
release publicada.
