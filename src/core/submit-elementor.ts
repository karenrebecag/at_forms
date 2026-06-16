import type { ElementorResponse } from "./types";

const DEFAULT_ENDPOINT = "/wp-admin/admin-ajax.php";
const TIMEOUT_MS = 15000;
const MAX_RETRIES = 2;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// POST al endpoint de Elementor con timeout y reintento por fallos de red.
// No reintenta cuando el servidor responde (incluso success:false): eso es decisión de negocio.
export async function submitToElementor(
  form: HTMLFormElement,
  payload: URLSearchParams,
): Promise<ElementorResponse> {
  const endpoint = form.getAttribute("action") || DEFAULT_ENDPOINT;
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const formData = new FormData();
      for (const [key, value] of payload.entries()) formData.append(key, value);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "X-Requested-With": "XMLHttpRequest" },
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timer);
      return (await res.json()) as ElementorResponse;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      if (attempt < MAX_RETRIES) await delay(400 * (attempt + 1));
    }
  }
  throw lastError;
}
