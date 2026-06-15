// loader.js — entry point CDN. Auto-generado por CI en cada release (no editar a mano).
// Webflow/Elementor cargan SOLO este archivo con @latest; el loader inyecta el CSS y JS
// apuntando al tag inmutable correcto, evitando el cache agresivo de assets en @latest.
(function () {
  var v = "1.0.8";
  var base = "https://cdn.jsdelivr.net/gh/karenrebecag/at_forms";

  var css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = base + "@" + v + "/dist/forms.css";
  document.head.appendChild(css);

  var js = document.createElement("script");
  js.type = "module";
  js.setAttribute("data-cfasync", "false"); // excluye de Cloudflare Rocket Loader
  js.src = base + "@" + v + "/dist/forms.js";
  document.head.appendChild(js);
})();
