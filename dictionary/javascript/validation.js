/*
 * Validation helpers: format checks, range checks, and a small rule
 * engine for form and request validation.
 */

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function isUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isPhoneNumber(value) {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export function isStrongPassword(value) {
  if (value.length < 12) return false;
  let categories = 0;
  if (/[a-z]/.test(value)) categories += 1;
  if (/[A-Z]/.test(value)) categories += 1;
  if (/\d/.test(value)) categories += 1;
  if (/[^a-zA-Z0-9]/.test(value)) categories += 1;
  return categories >= 3;
}

export function luhnCheck(value) {
  const digits = value.replace(/\D/g, '').split('').map(Number);
  if (digits.length < 12) return false;
  let total = 0;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = digits[index];
    if ((digits.length - index) % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    total += digit;
  }
  return total % 10 === 0;
}

export function isHexColor(value) {
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

export function isIntegerString(value) {
  return /^[+-]?\d+$/.test(value.trim());
}

export function isDecimalString(value) {
  return /^[+-]?\d+(\.\d+)?$/.test(value.trim());
}

export function isDateString(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return false;
  const daysInMonth = new Date(year, month, 0).getDate();
  return day >= 1 && day <= daysInMonth;
}

export function isTimeString(value) {
  return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value);
}

export function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function isAlphanumeric(value) {
  return /^[a-zA-Z0-9]+$/.test(value);
}

export function isJson(value) {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

export function isIpv4(value) {
  const parts = value.split('.');
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) return false;
    const number = Number(part);
    return number >= 0 && number <= 255;
  });
}

export function isMacAddress(value) {
  return /^([0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}$/.test(value);
}

export function isBetween(value, low, high) {
  return value >= low && value <= high;
}

export function isOneOf(value, allowed) {
  return allowed.includes(value);
}

export function isSlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export function isVersionString(value) {
  return /^\d+\.\d+\.\d+$/.test(value);
}

export function validateFields(data, rules) {
  const errors = {};
  for (const field of Object.keys(rules)) {
    const rule = rules[field];
    const value = data[field];
    if (rule.required && (value === undefined || value === '')) {
      errors[field] = rule.message || 'is required';
    } else if (value !== undefined && rule.test && !rule.test(value)) {
      errors[field] = rule.message || 'is invalid';
    }
  }
  return errors;
}

export function isPostalCode(value, country = 'US') {
  if (country === 'US') return /^\d{5}(-\d{4})?$/.test(value);
  if (country === 'UK') return /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i.test(value);
  if (country === 'CA') return /^[A-Z]\d[A-Z] \d[A-Z]\d$/i.test(value);
  return /^[A-Z0-9 -]{3,10}$/i.test(value);
}

export function hasMinLength(value, minimum) {
  return typeof value === 'string' && value.length >= minimum;
}

export function isIban(value) {
  const cleaned = value.replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(cleaned)) return false;
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  const digits = rearranged
    .split('')
    .map((char) => (/\d/.test(char) ? char : char.charCodeAt(0) - 55))
    .join('');
  let remainder = 0;
  for (let index = 0; index < digits.length; index += 1) {
    remainder = (remainder * 10 + Number(digits[index])) % 97;
  }
  return remainder === 1;
}
