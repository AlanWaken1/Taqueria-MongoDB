// src/utils/formHelpers.js
export const validateForm = (values, validations) => {
    const errors = {};
    
    Object.keys(validations).forEach(field => {
      const value = values[field];
      const validation = validations[field];
      
      if (validation.required && (!value || value === '')) {
        errors[field] = 'Este campo es obligatorio';
      } else if (validation.minLength && value && value.length < validation.minLength) {
        errors[field] = `Debe tener al menos ${validation.minLength} caracteres`;
      } else if (validation.pattern && value && !validation.pattern.test(value)) {
        errors[field] = validation.message || 'Formato inválido';
      }
    });
    
    return errors;
  };