export const PAYMENT_METHOD_SCHEMAS = {
  "Pago Movil": [
    {
      field: "owner",
      label: "Banco y codigo",
      placeholder: "Ejemplo: Mercantil 1234",
      hint: "Banco, nombre y digitos",
      type: "text",
    },
    {
      field: "identifier",
      label: "Numero de celular (10 digitos)",
      placeholder: "Ejemplo: 4245555555",
      hint: "Solo numeros, por ejemplo 4245555555",
      type: "tel",
    },
    {
      field: "contact",
      label: "Documento de identidad",
      placeholder: "Ejemplo: V-12345678",
      hint: "V-12345678, E-12345678, etc.",
      type: "text",
    },
  ],
  Nequi: [
    {
      field: "owner",
      label: "Nombre del titular",
      placeholder: "Ejemplo: Juan Perez",
      hint: "Nombre completo registrado en Nequi",
      type: "text",
    },
    {
      field: "identifier",
      label: "Numero de celular",
      placeholder: "Ejemplo: +57 3155555555",
      hint: "Celular asociado a Nequi",
      type: "tel",
    },
    {
      field: "contact",
      label: "Documento de identidad",
      placeholder: "Ejemplo: DNI 12345678",
      hint: "Documento del titular Nequi",
      type: "text",
    },
  ],
  Zelle: [
    {
      field: "owner",
      label: "Nombre del titular",
      placeholder: "Ejemplo: Juan Perez",
      hint: "Titular de la cuenta Zelle",
      type: "text",
    },
    {
      field: "identifier",
      label: "Correo o telefono",
      placeholder: "Ejemplo: tuemail@zelle.com",
      hint: "Login de Zelle (email o movil)",
      type: "text",
    },
    {
      field: "contact",
      label: "Nombre del banco",
      placeholder: "Ejemplo: Bank of America",
      hint: "Banco vinculado a Zelle",
      type: "text",
    },
  ],
  PayPal: [
    {
      field: "owner",
      label: "Correo de la cuenta",
      placeholder: "Ejemplo: tuemail@paypal.com",
      hint: "Email PayPal para recibir pagos",
      type: "email",
    },
    {
      field: "identifier",
      label: "Enlace PayPal.Me (opcional)",
      placeholder: "Ejemplo: paypal.me/tucuenta",
      hint: "https://paypal.me/tucuenta",
      type: "url",
    },
    {
      field: "contact",
      label: "Comision extra (si aplica)",
      placeholder: "Ejemplo: 1.5",
      hint: "Porcentaje sin simbolo, ejemplo 1.5",
      type: "number",
    },
  ],
  Binance: [
    {
      field: "owner",
      label: "Binance Pay ID",
      placeholder: "Ejemplo: 12345678",
      hint: "ID que identifica tu cuenta Binance Pay",
      type: "text",
    },
    {
      field: "identifier",
      label: "Nickname",
      placeholder: "Ejemplo: @tuusuario",
      hint: "Alias dentro de Binance",
      type: "text",
    },
    {
      field: "contact",
      label: "Correo o telefono vinculado",
      placeholder: "Ejemplo: tuemail@binance.com",
      hint: "Contacto presente en Binance",
      type: "text",
    },
    {
      field: "extra",
      label: "Red de deposito",
      placeholder: "Ejemplo: Red interna o TRC20",
      hint: "Usa la red correcta para evitar errores",
      type: "text",
    },
  ],
  Transferencia: [
    {
      field: "owner",
      label: "Banco y titular",
      placeholder: "Ejemplo: Banco X - Juan Perez",
      hint: "Datos del titular para transferencia",
      type: "text",
    },
    {
      field: "identifier",
      label: "Numero de cuenta",
      placeholder: "Ejemplo: 0102-0000-00-0000000000",
      hint: "Cuenta bancaria de destino",
      type: "text",
    },
    {
      field: "contact",
      label: "Documento",
      placeholder: "Ejemplo: V-12345678",
      hint: "Documento del titular",
      type: "text",
    },
  ],
};

export const PAYMENT_OPTIONS = Object.keys(PAYMENT_METHOD_SCHEMAS);

const titleCase = (text = "") =>
  String(text)
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

export const getReadablePaymentFields = (method, methodConfig = {}) => {
  const schema = PAYMENT_METHOD_SCHEMAS[method] || [];
  const fromSchema = schema
    .map((entry) => ({
      key: entry.field,
      label: entry.label,
      value: methodConfig?.[entry.field],
    }))
    .filter((entry) => String(entry.value || "").trim());

  if (fromSchema.length > 0) return fromSchema;

  return Object.entries(methodConfig || {})
    .filter(([, value]) => String(value || "").trim())
    .map(([key, value]) => ({
      key,
      label: titleCase(key),
      value,
    }));
};

