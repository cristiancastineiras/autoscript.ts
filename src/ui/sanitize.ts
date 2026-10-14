/** Etiquetas que se conservan en los textos de los dialogos. */
const ALLOWED_TAGS = new Set([
  "A",
  "B",
  "BR",
  "DIV",
  "EM",
  "I",
  "IMG",
  "LI",
  "OL",
  "P",
  "SMALL",
  "SPAN",
  "STRONG",
  "U",
  "UL",
]);

/** Etiquetas que se eliminan junto con su contenido. El resto se sustituye por su contenido. */
const DROPPED_TAGS = new Set([
  "BASE",
  "BUTTON",
  "EMBED",
  "FORM",
  "FRAME",
  "IFRAME",
  "INPUT",
  "LINK",
  "MATH",
  "META",
  "NOSCRIPT",
  "OBJECT",
  "SCRIPT",
  "SELECT",
  "STYLE",
  "SVG",
  "TEMPLATE",
  "TEXTAREA",
]);

const ALLOWED_ATTRIBUTES = new Set([
  "alt",
  "class",
  "height",
  "href",
  "id",
  "rel",
  "src",
  "style",
  "target",
  "title",
  "width",
]);

function safeUrl(value: string, attribute: "href" | "src", base: string): boolean {
  try {
    const url = new URL(value, base);
    if (attribute === "src")
      return /^https?:$/.test(url.protocol) || /^data:image\/(png|gif|jpeg|webp);/i.test(value);
    return /^(https?|mailto|tel):$/.test(url.protocol);
  } catch {
    return false;
  }
}

function clean(parent: ParentNode, base: string): void {
  for (const node of Array.from(parent.childNodes)) {
    if (node.nodeType === 3) continue;
    if (node.nodeType !== 1) {
      node.remove();
      continue;
    }
    const element = node as Element;
    if (DROPPED_TAGS.has(element.tagName)) {
      element.remove();
      continue;
    }
    clean(element, base);
    if (!ALLOWED_TAGS.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      continue;
    }
    for (const { name, value } of Array.from(element.attributes)) {
      const key = name.toLowerCase();
      const unsafe =
        !ALLOWED_ATTRIBUTES.has(key) ||
        ((key === "href" || key === "src") && !safeUrl(value, key, base)) ||
        (key === "style" && /url\s*\(|expression|javascript:/i.test(value));
      if (unsafe) element.removeAttribute(name);
    }
  }
}

/**
 * Convierte un texto HTML de un dialogo en nodos seguros: conserva enlaces, imagenes y formato
 * basico, y elimina scripts, manejadores de eventos y URLs `javascript:`. Se analiza en un
 * `<template>`, por lo que nada se ejecuta ni se descarga durante el saneado.
 */
export function sanitizeHtml(document: Document, html: string): DocumentFragment {
  const template = document.createElement("template");
  template.innerHTML = html;
  clean(template.content, document.baseURI);
  return template.content;
}
