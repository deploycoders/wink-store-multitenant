/**
 * Validaciones para el módulo de autenticación y registro.
 */

export const validateRegistration = (data) => {
  const errors = {};

  // Validación de Nombre
  if (!data.full_name?.trim()) {
    errors.full_name = "El nombre completo es obligatorio";
  } else if (data.full_name.trim().length < 3) {
    errors.full_name = "El nombre debe tener al menos 3 caracteres";
  }

  // Validación de Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email?.trim()) {
    errors.email = "El correo electrónico es obligatorio";
  } else if (!emailRegex.test(data.email)) {
    errors.email = "Ingresa un correo electrónico válido";
  }

  // Validación de Contraseña
  if (!data.password) {
    errors.password = "La contraseña es obligatoria";
  } else if (data.password.length < 8) {
    errors.password = "La contraseña debe tener al menos 8 caracteres";
  }

  // Validación de Confirmación
  if (!data.confirm_password) {
    errors.confirm_password = "Debes confirmar tu contraseña";
  } else if (data.confirm_password !== data.password) {
    errors.confirm_password = "Las contraseñas no coinciden";
  }

  return errors;
};

/**
 * Valida un campo individual (útil para validación onBlur o onChange).
 */
export const validateField = (name, value, allData = {}) => {
  const allErrors = validateRegistration({ ...allData, [name]: value });
  return allErrors[name] || null;
};
