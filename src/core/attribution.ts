// Atribución de marketing para ATFX.
//
// Hallazgo (15 jun 2026, verificado contra producción): el pipeline asíncrono
// (middle database / Zapier -> Salesforce) deriva `Landing_Page_Id__c` del campo
// top-level `referrer`. De esa URL, una automatización server-side parsea los
// `utm_*__c` (solo en leads NO de prueba: 90% de cobertura vs 5% en test accounts).
//
// Mandar `utm_source__c`, `Landing_Page_Id__c`, `GCLID__c`, etc. como campos del form
// NO funciona: el pipeline los ignora. La única acción que sí enriquece es poner el
// `referrer` con la URL real de aterrizaje (incluye query string con UTMs).
export function applyLandingUrl(params: URLSearchParams): void {
  params.set("referrer", window.location.href);
}
