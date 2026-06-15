import { gsap } from "gsap";

// Animaciones del form. GSAP se bundlea (no se asume presente como en Webflow).
// Respeta prefers-reduced-motion: si está activo, no anima (los elementos quedan visibles).
function reducedMotion(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function revealForm(form: HTMLFormElement): void {
  if (reducedMotion()) return;
  const groups = form.querySelectorAll(".atfx-field");
  gsap.from(groups, { opacity: 0, y: 12, duration: 0.4, stagger: 0.04, ease: "power2.out" });
}

export function revealThankYou(el: HTMLElement): void {
  if (reducedMotion()) return;
  gsap.from(el, { opacity: 0, y: 16, duration: 0.45, ease: "power3.out" });
  const icon = el.querySelector(".atfx-thankyou-icon");
  if (icon) gsap.from(icon, { scale: 0.5, duration: 0.5, ease: "back.out(2)", delay: 0.1 });
}
