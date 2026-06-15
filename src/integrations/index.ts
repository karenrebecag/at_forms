import type { IntegrationHook } from "../core/types";

// Cada integración corre solo tras confirmar éxito en Salesforce, en paralelo y aislada
// (Promise.allSettled): si una falla, no tumba el registro ni las demás.

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

// GA4 vía gtag si está presente.
export const ga4Lead: IntegrationHook = ({ response }) => {
  window.gtag?.("event", "generate_lead", {
    currency: "USD",
    aa_number: response.data?.data?.aanumber,
  });
};

// Google Tag Manager: push al dataLayer.
export const gtmLead: IntegrationHook = ({ response }) => {
  window.dataLayer?.push({
    event: "atfx_lead",
    aa_number: response.data?.data?.aanumber,
  });
};

// Meta Pixel.
export const metaLead: IntegrationHook = () => {
  window.fbq?.("track", "Lead");
};
