export const DIALOG_CSS: string = `
.autoscript-dialog { color: #202722; background: #fff; border: 1px solid #728479; border-radius: 6px; padding: 24px; width: min(400px, calc(100vw - 64px)); max-height: calc(100vh - 64px); box-sizing: border-box; overflow: auto; font: 16px/1.5 "Source Sans 3", sans-serif; letter-spacing: 0; }
.autoscript-dialog::backdrop { background: rgb(0 0 0 / 40%); }
.autoscript-dialog h2 { font-size: 22px; margin: 0 0 16px; }
.autoscript-dialog p { margin: 0 0 16px; overflow-wrap: anywhere; }
.autoscript-dialog progress { display: block; width: 100%; height: 8px; margin-bottom: 24px; accent-color: #28764b; }
.autoscript-dialog button { min-height: 44px; padding: 8px 16px; border: 1px solid #576d60; border-radius: 4px; color: #fff; background: #225e3e; font: inherit; cursor: pointer; }
.autoscript-dialog button:focus-visible { outline: 3px solid #deab26; outline-offset: 3px; }
.autoscript-dialog a { color: #165b90; overflow-wrap: anywhere; }
`;

export function installDialogStyles(doc: Document, nonce?: string): () => void {
  const style = doc.createElement("style");
  if (nonce) style.nonce = nonce;
  style.textContent = DIALOG_CSS;
  doc.head.append(style);
  return () => style.remove();
}
