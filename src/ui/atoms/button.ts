// Átomo: botón (patrón "038"): bg que escala + texto que rueda en vertical letra por letra.
// El submit conserva <button type="submit">; el mismo render sirve para el CTA del thank-you.
// La escala de hover/focus se calcula por JS desde los px reales del botón (igual que el doc):
//   scaleX = (ancho + widthHover) / ancho ; scaleY = (alto + heightHover) / alto
// con widthHover/heightHover negativos -> el bg se contrae unos px (firma del 038), proporcional.

// Incrementos de hover en px (data-button-038-width-hover / -height-hover del doc).
const WIDTH_HOVER = -10;
const HEIGHT_HOVER = -5;

// Fija --atfx-btn-scale-x/y midiendo el botón ya montado (offsetWidth/Height incluye padding).
function applyScale(el: HTMLElement): void {
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  if (!w || !h) return;
  el.style.setProperty("--atfx-btn-scale-x", String((w + WIDTH_HOVER) / w));
  el.style.setProperty("--atfx-btn-scale-y", String((h + HEIGHT_HOVER) / h));
}

// Se difiere a rAF (espera el append al DOM) y se repite tras cargar las fuentes (ancho exacto).
function scheduleScale(el: HTMLElement): void {
  requestAnimationFrame(() => applyScale(el));
  if (typeof document !== "undefined" && document.fonts?.ready) {
    document.fonts.ready.then(() => applyScale(el));
  }
}

// Parte el texto en spans por carácter; cada uno lleva --index para el escalonado del roll.
function splitText(text: HTMLElement, label: string): void {
  text.textContent = "";
  [...label].forEach((char, index) => {
    const span = document.createElement("span");
    span.textContent = char;
    span.style.setProperty("--index", String(index));
    if (char === " ") span.style.whiteSpace = "pre";
    text.appendChild(span);
  });
}

// Decora un elemento (button o anchor) con las capas del botón 038.
export function fillButton(el: HTMLElement, label: string): void {
  const bg = document.createElement("span");
  bg.className = "atfx-button__bg";

  const inner = document.createElement("span");
  inner.className = "atfx-button__inner";

  const text = document.createElement("span");
  text.className = "atfx-button__text";
  splitText(text, label);

  inner.append(text);
  el.append(bg, inner);
  scheduleScale(el);
}

export function button(opts: { label: string; id?: string }): HTMLButtonElement {
  const el = document.createElement("button");
  el.className = "atfx-button";
  el.type = "submit";
  if (opts.id) el.id = opts.id;
  fillButton(el, opts.label);
  return el;
}
