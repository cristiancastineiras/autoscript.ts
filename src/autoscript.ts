// Punto de entrada de dist/autoscript.js: sustituto directo del script original. Al cargarse
// con <script> registra AutoScript, MiniApplet, SupportDialog y Base64 en la ventana.

import { installAutoScript } from "./compat/autoscript.js";

installAutoScript();
