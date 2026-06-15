import { z } from "zod";

// Limpia valores legacy del select (ej. "Principiante_HolaMemo" -> "Principiante")
// para que el form siga validando aunque Elementor aún no actualice los option values.
const tradingExperience = z.preprocess(
  (v) => String(v ?? "").replace(/_HolaMemo$/, ""),
  z.enum(["Principiante", "Intermedio", "Avanzado"], {
    message: "Selecciona tu experiencia en trading",
  }),
);

export const webinar25junSchema = z.object({
  firstName: z.string().trim().min(2, "Ingresa tu nombre"),
  lastName: z.string().trim().min(2, "Ingresa tus apellidos"),
  email: z.string().trim().email("Correo electrónico no válido"),
  diallingCode: z.string().min(1, "Selecciona el prefijo telefónico"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9()#&+*\-=.]{6,}$/, "Número de teléfono no válido"),
  country: z.string().min(2, "Selecciona tu país de residencia"),
  tradingExperience,
  acceptance: z.literal(true, { message: "Debes aceptar los términos para continuar" }),
});

export type Webinar25junValues = z.infer<typeof webinar25junSchema>;
