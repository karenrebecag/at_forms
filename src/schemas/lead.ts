import { z } from "zod";
import type { Dict } from "../i18n";

// Schema genérico de lead, con mensajes traducidos según el idioma activo.
// El value de tradingExperience es canónico (Principiante/Intermedio/Avanzado) en todo idioma.
export function createLeadSchema(t: Dict) {
  const tradingExperience = z.preprocess(
    (v) => String(v ?? "").replace(/_HolaMemo$/, ""),
    z.enum(["Principiante", "Intermedio", "Avanzado"], { message: t.validation.tradingExperience }),
  );

  return z.object({
    firstName: z.string().trim().min(2, t.validation.firstName),
    lastName: z.string().trim().min(2, t.validation.lastName),
    email: z.string().trim().email(t.validation.email),
    diallingCode: z.string().min(1, t.validation.diallingCode),
    phone: z.string().trim().regex(/^[0-9()#&+*\-=.]{6,}$/, t.validation.phone),
    country: z.string().min(2, t.validation.country),
    tradingExperience,
    acceptance: z.literal(true, { message: t.validation.acceptance }),
  });
}
