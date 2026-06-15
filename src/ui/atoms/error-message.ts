// Átomo: slot de error de un campo. Vacío hasta que el motor escriba en él (errors.ts).
export function errorMessage(forName: string): HTMLElement {
  const el = document.createElement("span");
  el.className = "atfx-error";
  el.dataset.errorFor = forName;
  el.setAttribute("role", "alert");
  return el;
}
