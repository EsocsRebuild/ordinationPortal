/**
 * Nigerian & International Phone Validation Utilities for ESOCS Ordination Portal
 */

export interface PhoneValidationResult {
  isValid: boolean;
  formatted: string;
  carrier?: string;
  isNigerian: boolean;
  error?: string;
}

// Known Nigerian Mobile Network Operator prefixes
const NIGERIAN_PREFIXES: Record<string, string> = {
  // MTN
  '0803': 'MTN Nigeria',
  '0806': 'MTN Nigeria',
  '0703': 'MTN Nigeria',
  '0706': 'MTN Nigeria',
  '0813': 'MTN Nigeria',
  '0816': 'MTN Nigeria',
  '0810': 'MTN Nigeria',
  '0814': 'MTN Nigeria',
  '0903': 'MTN Nigeria',
  '0906': 'MTN Nigeria',
  '0913': 'MTN Nigeria',
  '0916': 'MTN Nigeria',

  // Airtel
  '0802': 'Airtel Nigeria',
  '0808': 'Airtel Nigeria',
  '0708': 'Airtel Nigeria',
  '0812': 'Airtel Nigeria',
  '0701': 'Airtel Nigeria',
  '0902': 'Airtel Nigeria',
  '0901': 'Airtel Nigeria',
  '0904': 'Airtel Nigeria',
  '0907': 'Airtel Nigeria',
  '0912': 'Airtel Nigeria',

  // Globacom (Glo)
  '0805': 'Glo Mobile',
  '0807': 'Glo Mobile',
  '0705': 'Glo Mobile',
  '0815': 'Glo Mobile',
  '0811': 'Glo Mobile',
  '0905': 'Glo Mobile',
  '0915': 'Glo Mobile',

  // 9mobile (formerly Etisalat)
  '0809': '9mobile',
  '0818': '9mobile',
  '0817': '9mobile',
  '0909': '9mobile',
  '0908': '9mobile',
};

/**
 * Validates and formats Nigerian (and Diaspora international) telephone numbers.
 */
export function validatePhoneNumber(raw: string): PhoneValidationResult {
  if (!raw || !raw.trim()) {
    return {
      isValid: false,
      formatted: '',
      isNigerian: false,
      error: 'Mobile phone number is required.',
    };
  }

  // Strip non-digit characters except leading +
  const cleaned = raw.trim().replace(/[^\d+]/g, '');

  // 1. Check if Nigerian number
  let standardLocal = '';
  let isNigerian = false;

  if (cleaned.startsWith('+234')) {
    const digits = cleaned.slice(4);
    if (digits.length === 10) {
      standardLocal = '0' + digits;
      isNigerian = true;
    }
  } else if (cleaned.startsWith('234')) {
    const digits = cleaned.slice(3);
    if (digits.length === 10) {
      standardLocal = '0' + digits;
      isNigerian = true;
    }
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    standardLocal = cleaned;
    isNigerian = true;
  }

  if (isNigerian && standardLocal.length === 11) {
    const prefix = standardLocal.slice(0, 4);
    const carrier = NIGERIAN_PREFIXES[prefix] || 'Nigerian Telecomm Operator';
    
    // Format nicely: +234 803 123 4567 / 0803 123 4567
    const formatted = `+234 ${standardLocal.slice(1, 4)} ${standardLocal.slice(4, 7)} ${standardLocal.slice(7)}`;

    return {
      isValid: true,
      formatted,
      carrier,
      isNigerian: true,
    };
  }

  // 2. Check if Diaspora international number (e.g. +44 for UK, +1 for US/Canada)
  if (cleaned.startsWith('+') && cleaned.length >= 8 && cleaned.length <= 16) {
    return {
      isValid: true,
      formatted: cleaned,
      isNigerian: false,
      carrier: 'International / Diaspora Network',
    };
  }

  // 3. Invalid format
  if (cleaned.startsWith('0') && cleaned.length !== 11) {
    return {
      isValid: false,
      formatted: raw,
      isNigerian: true,
      error: `Nigerian phone numbers must be exactly 11 digits (current: ${cleaned.length} digits). E.g. 08031234567`,
    };
  }

  return {
    isValid: false,
    formatted: raw,
    isNigerian: false,
    error: 'Please enter a valid 11-digit Nigerian number (080...) or international format (+234...).',
  };
}

