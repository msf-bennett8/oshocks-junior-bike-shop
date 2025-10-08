export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validatePhone = (phone) => {
  const re = /^(\+254|0)[17]\d{8}$/;
  return re.test(phone);
};

export default {
  validateEmail,
  validatePassword,
  validatePhone,
};
