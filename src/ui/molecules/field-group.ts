import type { ColSpan } from "../../core/types";
import { errorMessage } from "../atoms/error-message";

// Molécula: agrupa label (opcional) + control + slot de error, con su ancho de columna.
// El slot de error queda direccionable por el motor vía [data-error-for].
export function fieldGroup(opts: {
  name: string;
  control: HTMLElement;
  labelEl?: HTMLElement;
  colSpan?: ColSpan;
}): HTMLElement {
  const group = document.createElement("div");
  group.className = `atfx-field atfx-col-${opts.colSpan ?? 100}`;
  group.dataset.field = opts.name;

  if (opts.labelEl) group.appendChild(opts.labelEl);
  group.appendChild(opts.control);
  group.appendChild(errorMessage(opts.name));
  return group;
}
