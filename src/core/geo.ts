// Geo-IP solo front: detecta el país del visitante y preselecciona país + prefijo.
// Sin API key (bundle público) y sin bloquear el render: se aplica tras montar el form
// y degrada en silencio si la red falla, hay timeout o el país no está en la lista.

import { iso3ForIso2, dialForIso2 } from "../data/options";
import type { PresettableElement } from "../ui/atoms/select";

const TIMEOUT_MS = 2500;

// Endpoints gratuitos, HTTPS y con CORS abierto. Cada uno extrae el ISO2 de su payload.
const PROVIDERS: { url: string; pick: (data: unknown) => string | undefined }[] = [
  { url: "https://ipwho.is/", pick: (d) => readString(d, "country_code") },
  { url: "https://get.geojs.io/v1/ip/country.json", pick: (d) => readString(d, "country") },
];

function readString(data: unknown, key: string): string | undefined {
  if (data && typeof data === "object" && key in data) {
    const v = (data as Record<string, unknown>)[key];
    if (typeof v === "string" && v.length === 2) return v;
  }
  return undefined;
}

async function fetchJson(url: string, signal: AbortSignal): Promise<unknown> {
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`geo: ${res.status}`);
  return res.json();
}

// Devuelve el ISO2 del país por IP, o null ante cualquier fallo. Prueba proveedores en orden.
export async function fetchCountryIso2(): Promise<string | null> {
  for (const provider of PROVIDERS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const data = await fetchJson(provider.url, controller.signal);
      const iso2 = provider.pick(data);
      if (iso2) return iso2.toUpperCase();
    } catch {
      // proveedor caído / timeout / CORS: probar el siguiente
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

function presetField(form: HTMLFormElement, fieldName: string, value: string | undefined): void {
  if (!value) return;
  const group = `[data-field="${fieldName}"]`;
  const control = form.querySelector<PresettableElement>(`${group} .atfx-combobox, ${group} .atfx-select-wrapper`);
  control?.presetValue?.(value);
}

// Detecta país por IP y preselecciona país (ISO3) + prefijo. No pisa selección manual:
// presetValue no hace nada si el campo ya tiene valor cuando resuelve la red.
export async function applyGeoPreselect(form: HTMLFormElement): Promise<void> {
  const iso2 = await fetchCountryIso2();
  if (!iso2) return;
  presetField(form, "country_of_residence", iso3ForIso2(iso2));
  presetField(form, "dialling_code", dialForIso2(iso2));
}
