// Diccionarios de traducción. Códigos SF (emailLang/landingLang) verificados contra producción:
// Email_language_lead__c: ESP/ENG/PTG · Landing_Page_Language__c: esp/en/pt.

export type Lang = "es" | "en" | "pt";

export interface Dict {
  labels: {
    firstName: string;
    lastName: string;
    email: string;
    diallingCode: string;
    phone: string;
    country: string;
    tradingExperience: string;
  };
  acceptance: string;
  selectPlaceholder: string;
  phoneTitle: string;
  // value canónico (mismo en todo idioma para mantener SF consistente); label traducido.
  tradingOptions: { value: string; label: string }[];
  validation: {
    firstName: string;
    lastName: string;
    email: string;
    diallingCode: string;
    phone: string;
    country: string;
    tradingExperience: string;
    acceptance: string;
  };
  errors: { connection: string; generic: string };
  submit: string;
  thankYou: { title: string; message: string; zoomCta: string };
  sf: { emailLang: string; landingLang: string };
}

export const DICTS: Record<Lang, Dict> = {
  es: {
    labels: {
      firstName: "Nombre",
      lastName: "Apellidos",
      email: "Email",
      diallingCode: "Prefijo",
      phone: "Teléfono",
      country: "País de residencia",
      tradingExperience: "Experiencia en trading",
    },
    acceptance:
      "Al enviar este formulario, acepto que ATFX use mi información de contacto para comunicarse conmigo sobre sus productos y servicios. Puedo darme de baja en cualquier momento. Consulta nuestra Política de Privacidad.",
    selectPlaceholder: "Selecciona",
    phoneTitle: "Solo números y caracteres de teléfono (#, -, *, etc).",
    tradingOptions: [
      { value: "Principiante", label: "0-6 meses (Principiante)" },
      { value: "Intermedio", label: "6-12 meses (Intermedio)" },
      { value: "Avanzado", label: "1+ año (Avanzado)" },
    ],
    validation: {
      firstName: "Ingresa tu nombre",
      lastName: "Ingresa tus apellidos",
      email: "Correo electrónico no válido",
      diallingCode: "Selecciona un prefijo",
      phone: "Teléfono no válido",
      country: "Selecciona tu país",
      tradingExperience: "Selecciona tu experiencia",
      acceptance: "Debes aceptar los términos para continuar",
    },
    errors: {
      connection: "Error de conexión. Por favor intenta de nuevo.",
      generic: "No pudimos completar tu registro. Revisa los datos.",
    },
    submit: "Regístrate ahora",
    thankYou: {
      title: "¡Registro confirmado!",
      message: "Te enviamos un correo con los detalles de acceso. Revisa tu bandeja de entrada.",
      zoomCta: "Abrir Zoom ahora",
    },
    sf: { emailLang: "ESP", landingLang: "esp" },
  },

  en: {
    labels: {
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      diallingCode: "Code",
      phone: "Phone",
      country: "Country of residence",
      tradingExperience: "Trading experience",
    },
    acceptance:
      "By submitting this form, I agree that ATFX may use my contact information to contact me about its products and services. I can unsubscribe at any time. See our Privacy Policy.",
    selectPlaceholder: "Select",
    phoneTitle: "Only numbers and phone characters (#, -, *, etc).",
    tradingOptions: [
      { value: "Principiante", label: "0-6 months (Beginner)" },
      { value: "Intermedio", label: "6-12 months (Intermediate)" },
      { value: "Avanzado", label: "1+ year (Advanced)" },
    ],
    validation: {
      firstName: "Enter your first name",
      lastName: "Enter your last name",
      email: "Invalid email address",
      diallingCode: "Select a dialing code",
      phone: "Invalid phone number",
      country: "Select your country",
      tradingExperience: "Select your experience",
      acceptance: "You must accept the terms to continue",
    },
    errors: {
      connection: "Connection error. Please try again.",
      generic: "We couldn't complete your registration. Please check your details.",
    },
    submit: "Register now",
    thankYou: {
      title: "Registration confirmed!",
      message: "We've sent you an email with the access details. Check your inbox.",
      zoomCta: "Open Zoom now",
    },
    sf: { emailLang: "ENG", landingLang: "en" },
  },

  pt: {
    labels: {
      firstName: "Nome",
      lastName: "Sobrenome",
      email: "E-mail",
      diallingCode: "Código",
      phone: "Telefone",
      country: "País de residência",
      tradingExperience: "Experiência em trading",
    },
    acceptance:
      "Ao enviar este formulário, concordo que a ATFX use minhas informações de contato para entrar em contato comigo sobre seus produtos e serviços. Posso cancelar a qualquer momento. Consulte nossa Política de Privacidade.",
    selectPlaceholder: "Selecione",
    phoneTitle: "Apenas números e caracteres de telefone (#, -, *, etc).",
    tradingOptions: [
      { value: "Principiante", label: "0-6 meses (Iniciante)" },
      { value: "Intermedio", label: "6-12 meses (Intermediário)" },
      { value: "Avanzado", label: "1+ ano (Avançado)" },
    ],
    validation: {
      firstName: "Insira seu nome",
      lastName: "Insira seu sobrenome",
      email: "E-mail inválido",
      diallingCode: "Selecione um código",
      phone: "Telefone inválido",
      country: "Selecione seu país",
      tradingExperience: "Selecione sua experiência",
      acceptance: "Você deve aceitar os termos para continuar",
    },
    errors: {
      connection: "Erro de conexão. Tente novamente.",
      generic: "Não foi possível concluir seu registro. Verifique seus dados.",
    },
    submit: "Inscreva-se agora",
    thankYou: {
      title: "Inscrição confirmada!",
      message: "Enviamos um e-mail com os detalhes de acesso. Verifique sua caixa de entrada.",
      zoomCta: "Abrir Zoom agora",
    },
    sf: { emailLang: "PTG", landingLang: "pt" },
  },
};

// Resuelve el atributo data-lang a un idioma soportado (default es).
export function resolveLang(raw: string | undefined): Lang {
  const v = (raw ?? "").toLowerCase();
  if (v === "en" || v === "pt") return v;
  return "es";
}
