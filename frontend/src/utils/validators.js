// validators.js

// ─────────────────────────────────────────────
// Config & Constants
// ─────────────────────────────────────────────
const CONFIG = {
  email: {
    maxLength: 254,
    pattern: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  },
  password: {
    minLength: 12,
    maxLength: 128,
    patterns: {
      uppercase: /[A-Z]/,
      lowercase: /[a-z]/,
      number: /[0-9]/,
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    },
    blocklist: new Set([
      'password123', 'qwerty123', '123456789', 'letmein123',
      'welcome123', 'admin12345', 'password1!', '1234567890',
      'qwertyuiop', 'abcdef123456', 'password!1',
    ]),
  },
  phone: {
    // E.164: + followed by 7-15 digits (ITU-T standard)
    e164: {
      minLength: 7,
      maxLength: 15,
      pattern: /^\+[1-9]\d{6,14}$/,
    },
    // Kenya-specific: all valid mobile prefixes per CA 2025 numbering plan
    kenya: {
      countryCode: '254',
      // Mobile prefixes: 1, 7 (Safaricom, Airtel, Telkom)
      // New 01xx prefixes: 0100, 0101, 0102, 0110, 0111 per CA allocation [^9^]
      mobilePrefixes: ['1', '7'],
      // National formats: 0[1|7]XXXXXXXX or 01XX XXXXXX (new 10-digit format)
      nationalPattern: /^0(?:[17]\d{8}|[17]\d{9})$/, // 10 or 11 digits with leading 0
      intlPattern: /^\+?254[17]\d{8}$/, // +254 or 254 prefix
    },
  },
};

const ERROR_MESSAGES = {
  email: {
    required: 'Email is required',
    invalid: 'Please enter a valid email address',
    tooLong: `Email must be less than ${CONFIG.email.maxLength} characters`,
  },
  password: {
    required: 'Password is required',
    tooShort: `Password must be at least ${CONFIG.password.minLength} characters`,
    tooLong: `Password must not exceed ${CONFIG.password.maxLength} characters`,
    noUppercase: 'Password must contain at least one uppercase letter',
    noLowercase: 'Password must contain at least one lowercase letter',
    noNumber: 'Password must contain at least one number',
    noSpecialChar: 'Password must contain at least one special character (!@#$%^&*)',
    commonPassword: 'This password is too common. Please choose a stronger one',
  },
  phone: {
    required: 'Phone number is required',
    invalid: 'Please enter a valid phone number',
    tooShort: 'Phone number is too short',
    tooLong: 'Phone number is too long',
    invalidCountry: 'Unsupported country code',
  },
};

// ─────────────────────────────────────────────
// Core Validation Engine
// ─────────────────────────────────────────────

const createResult = (valid, data = null, errors = []) => ({
  valid,
  data,
  errors: errors.flat(),
});

const toString = (val) => (val == null ? '' : String(val).trim());

/**
 * Extracts digits only from input
 */
const extractDigits = (val) => toString(val).replace(/\D/g, '');

/**
 * Detects if number looks Kenyan based on prefix patterns
 */
const looksKenyan = (digits) => {
  // Starts with 254, 0254, +254, or 0[1|7]
  return /^(?:254|0254|0[17])/.test(digits);
};

/**
 * Smart phone parser - handles multiple formats intelligently
 */
const parsePhone = (input) => {
  const raw = toString(input);
  const digitsOnly = extractDigits(raw);
  
  // Empty check
  if (!digitsOnly) return { type: 'empty', digits: '', hasPlus: raw.includes('+') };

  const hasPlus = raw.startsWith('+') || raw.includes(' +');
  
  // Kenyan number detection & parsing
  if (looksKenyan(digitsOnly)) {
    // Format: 2547... (no +, no 0) → treat as +2547...
    if (/^254[17]\d{8}$/.test(digitsOnly)) {
      return { type: 'kenya-intl', digits: digitsOnly, hasPlus: false, normalized: `+${digitsOnly}` };
    }
    // Format: 02547... (with 0 prefix) → invalid, should be 07... or +254...
    if (/^0254[17]\d{8}$/.test(digitsOnly)) {
      return { type: 'kenya-invalid-zero', digits: digitsOnly, hasPlus: false, error: 'Use 07... or +254... format' };
    }
    // Format: 07... or 01... (national)
    if (/^0[17]\d{8}$/.test(digitsOnly)) {
      return { type: 'kenya-national', digits: digitsOnly, hasPlus: false, normalized: `+254${digitsOnly.slice(1)}` };
    }
    // Format: 011... (new 10-digit format)
    if (/^0[17]\d{9}$/.test(digitsOnly)) {
      return { type: 'kenya-national-new', digits: digitsOnly, hasPlus: false, normalized: `+254${digitsOnly.slice(1)}` };
    }
    // Partial match - might be Kenyan but wrong length
    if (/^0[17]/.test(digitsOnly)) {
      return { type: 'kenya-partial', digits: digitsOnly, hasPlus: false, error: `Kenyan mobile must be 10 digits (got ${digitsOnly.length})` };
    }
  }

  // Generic international: starts with + or has >10 digits
  if (hasPlus || digitsOnly.length > 10) {
    // E.164 format check
    if (/^[1-9]\d{6,14}$/.test(digitsOnly)) {
      return { type: 'international', digits: digitsOnly, hasPlus, normalized: `+${digitsOnly}` };
    }
    return { type: 'intl-partial', digits: digitsOnly, hasPlus, error: 'Invalid international format' };
  }

  // Unknown format
  return { type: 'unknown', digits: digitsOnly, hasPlus, error: 'Unrecognized phone format' };
};

// ─────────────────────────────────────────────
// Field Validators
// ─────────────────────────────────────────────

export const validateEmail = (email) => {
  const str = toString(email);
  const errors = [];

  if (!str) errors.push(ERROR_MESSAGES.email.required);
  else {
    if (str.length > CONFIG.email.maxLength) errors.push(ERROR_MESSAGES.email.tooLong);
    if (!CONFIG.email.pattern.test(str)) errors.push(ERROR_MESSAGES.email.invalid);
  }

  const valid = errors.length === 0;
  return createResult(valid, valid ? str.toLowerCase() : null, errors);
};

export const validatePassword = (password) => {
  const str = toString(password);
  const errors = [];
  const { minLength, maxLength, patterns, blocklist } = CONFIG.password;

  if (!str) {
    errors.push(ERROR_MESSAGES.password.required);
    return createResult(false, null, errors);
  }

  if (str.length < minLength) errors.push(ERROR_MESSAGES.password.tooShort);
  if (str.length > maxLength) errors.push(ERROR_MESSAGES.password.tooLong);
  if (!patterns.uppercase.test(str)) errors.push(ERROR_MESSAGES.password.noUppercase);
  if (!patterns.lowercase.test(str)) errors.push(ERROR_MESSAGES.password.noLowercase);
  if (!patterns.number.test(str)) errors.push(ERROR_MESSAGES.password.noNumber);
  if (!patterns.special.test(str)) errors.push(ERROR_MESSAGES.password.noSpecialChar);
  if (blocklist.has(str.toLowerCase())) errors.push(ERROR_MESSAGES.password.commonPassword);

  const valid = errors.length === 0;
  return createResult(valid, valid ? str : null, errors);
};

/**
 * Validates any phone number - Kenyan or international
 * Supports: +254..., 254..., 07..., 01..., and foreign numbers
 */
export const validatePhone = (phone) => {
  const parsed = parsePhone(phone);
  const errors = [];

  if (parsed.type === 'empty') {
    errors.push(ERROR_MESSAGES.phone.required);
    return createResult(false, null, errors);
  }

  if (parsed.error) {
    errors.push(parsed.error);
    return createResult(false, null, errors);
  }

  // E.164 length validation (7-15 digits after country code)
  const significantDigits = parsed.digits.replace(/^254|^0/, '');
  if (significantDigits.length < 6) errors.push(ERROR_MESSAGES.phone.tooShort);
  if (significantDigits.length > 14) errors.push(ERROR_MESSAGES.phone.tooLong);

  // Format-specific validation
  if (parsed.type.startsWith('kenya')) {
    // Validate Kenyan prefix is 1 or 7
    const prefix = parsed.digits.replace(/^0|^254/, '').charAt(0);
    if (!CONFIG.phone.kenya.mobilePrefixes.includes(prefix)) {
      errors.push('Invalid Kenyan mobile prefix. Must start with 1 or 7');
    }
  }

  const valid = errors.length === 0;
  return createResult(valid, valid ? parsed.normalized : null, errors);
};

// ─────────────────────────────────────────────
// Composable Form Validators
// ─────────────────────────────────────────────

export const validateLogin = (input) => {
  const emailResult = validateEmail(input?.email);
  const passwordResult = validatePassword(input?.password);

  const passwordErrors = !toString(input?.password)
    ? [ERROR_MESSAGES.password.required]
    : [];

  const errors = { email: emailResult.errors, password: passwordErrors };
  const hasErrors = emailResult.errors.length > 0 || passwordErrors.length > 0;

  return {
    valid: !hasErrors,
    data: hasErrors ? null : { email: emailResult.data, password: toString(input?.password) },
    errors,
  };
};

export const validateRegistration = (input) => {
  const emailResult = validateEmail(input?.email);
  const passwordResult = validatePassword(input?.password);
  const phoneResult = validatePhone(input?.phone);

  const errors = {
    email: emailResult.errors,
    password: passwordResult.errors,
    confirmPassword: [],
    phone: phoneResult.errors,
  };

  if (toString(input?.password) !== toString(input?.confirmPassword)) {
    errors.confirmPassword.push('Passwords do not match');
  }

  const hasErrors = Object.values(errors).some((arr) => arr.length > 0);

  return {
    valid: !hasErrors,
    data: hasErrors ? null : {
      email: emailResult.data,
      password: passwordResult.data,
      phone: phoneResult.data,
    },
    errors,
  };
};

export const validatePasswordReset = (input) => {
  const emailResult = validateEmail(input?.email);
  return {
    valid: emailResult.valid,
    data: emailResult.valid ? { email: emailResult.data } : null,
    errors: { email: emailResult.errors },
  };
};

// ─────────────────────────────────────────────
// Legacy Boolean Wrappers
// ─────────────────────────────────────────────

export const isEmailValid = (email) => validateEmail(email).valid;
export const isPasswordValid = (password) => validatePassword(password).valid;
export const isPhoneValid = (phone) => validatePhone(phone).valid;

// ─────────────────────────────────────────────
// Default Export
// ─────────────────────────────────────────────
export default {
  validateEmail,
  validatePassword,
  validatePhone,
  validateLogin,
  validateRegistration,
  validatePasswordReset,
  isEmailValid,
  isPasswordValid,
  isPhoneValid,
  ERROR_MESSAGES,
  CONFIG,
};