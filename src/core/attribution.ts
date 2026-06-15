import type { AttributionField } from "./types";

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

// Resuelve los campos de atribución a un mapa { sfField: value }, omitiendo vacíos.
export function collectAttribution(fields: AttributionField[]): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};

  for (const field of fields) {
    let value: string | null = null;
    switch (field.from.type) {
      case "url":
        value = params.get(field.from.param);
        break;
      case "href":
        value = window.location.href;
        break;
      case "cookie":
        value = readCookie(field.from.name);
        break;
      case "referrer":
        value = document.referrer || null;
        break;
      case "value":
        value = field.from.value;
        break;
    }
    if (value && value.trim() !== "") out[field.sfField] = value;
  }
  return out;
}

// Set estándar de atribución para landing pages de ATFX: UTMs, click IDs y landing URL.
// Salesforce deriva campañas a partir de Landing_Page_Id__c; sin él, el lead queda ciego.
export const DEFAULT_ATTRIBUTION: AttributionField[] = [
  { sfField: "Landing_Page_Id__c", from: { type: "href" } },
  { sfField: "utm_source__c", from: { type: "url", param: "utm_source" } },
  { sfField: "utm_medium__c", from: { type: "url", param: "utm_medium" } },
  { sfField: "utm_campaign__c", from: { type: "url", param: "utm_campaign" } },
  { sfField: "utm_content__c", from: { type: "url", param: "utm_content" } },
  { sfField: "utm_term__c", from: { type: "url", param: "utm_term" } },
  { sfField: "GCLID__c", from: { type: "url", param: "gclid" } },
  { sfField: "gaconnector_Google_Analytics_Client_ID__c", from: { type: "cookie", name: "_ga" } },
];
