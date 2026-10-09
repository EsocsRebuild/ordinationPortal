import {
  isValidPhoneNumber,
  parsePhoneNumber,
  AsYouType,
  CountryCode,
  getCountryCallingCode,
} from 'libphonenumber-js';

export interface CountryInfo {
  code: CountryCode;
  name: string;
  dialCode: string;
  flag: string;
  isPriority?: boolean;
}

// Curated list of countries with priority for ESOCS diaspora dioceses & worldwide
export const COUNTRIES: CountryInfo[] = [
  // Primary ESOCS Hubs & Dioceses
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬', isPriority: true },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', isPriority: true },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', isPriority: true },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', isPriority: true },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭', isPriority: true },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', isPriority: true },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', isPriority: true },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', isPriority: true },
  { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪', isPriority: true },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', isPriority: true },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪', isPriority: true },
  { code: 'BJ', name: 'Benin', dialCode: '+229', flag: '🇧🇯', isPriority: true },

  // Other Global Countries
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹' },
  { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'CM', name: 'Cameroon', dialCode: '+237', flag: '🇨🇲' },
  { code: 'CI', name: 'Côte d\'Ivoire', dialCode: '+225', flag: '🇨🇮' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
  { code: 'ET', name: 'Ethiopia', dialCode: '+251', flag: '🇪🇹' },
  { code: 'FI', name: 'Finland', dialCode: '+358', flag: '🇫🇮' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'GM', name: 'Gambia', dialCode: '+220', flag: '🇬🇲' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'IL', name: 'Israel', dialCode: '+972', flag: '🇮🇱' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'LR', name: 'Liberia', dialCode: '+231', flag: '🇱🇷' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿' },
  { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250', flag: '🇷🇼' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'SL', name: 'Sierra Leone', dialCode: '+232', flag: '🇸🇱' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255', flag: '🇹🇿' },
  { code: 'TG', name: 'Togo', dialCode: '+228', flag: '🇹🇬' },
  { code: 'UG', name: 'Uganda', dialCode: '+256', flag: '🇺🇬' },
  { code: 'ZM', name: 'Zambia', dialCode: '+260', flag: '🇿🇲' },
  { code: 'ZW', name: 'Zimbabwe', dialCode: '+263', flag: '🇿🇼' },
];

// Nigerian Network Operator prefixes
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

  // 9mobile
  '0809': '9mobile',
  '0818': '9mobile',
  '0817': '9mobile',
  '0909': '9mobile',
  '0908': '9mobile',
};

export interface PhoneValidationResult {
  isValid: boolean;
  formatted: string;
  formattedInternational: string;
  formattedNational: string;
  countryCode: CountryCode;
  countryName: string;
  dialCode: string;
  carrier?: string;
  error?: string;
}

/**
 * Returns country info object by ISO country code
 */
export function getCountryByCode(code: string): CountryInfo {
  const found = COUNTRIES.find((c) => c.code === code.toUpperCase());
  if (found) return found;
  try {
    const dialCode = `+${getCountryCallingCode(code.toUpperCase() as CountryCode)}`;
    return {
      code: code.toUpperCase() as CountryCode,
      name: code.toUpperCase(),
      dialCode,
      flag: '🌐',
    };
  } catch {
    return COUNTRIES[0]; // fallback to Nigeria
  }
}

/**
 * Formats a phone string as the user types using libphonenumber-js
 */
export function formatAsYouTypeNumber(raw: string, defaultCountry: CountryCode = 'NG'): string {
  if (!raw) return '';
  const formatter = new AsYouType(defaultCountry);
  return formatter.input(raw);
}

/**
 * Validates international & Nigerian phone numbers with full libphonenumber-js parsing
 */
export function validatePhoneNumber(
  raw: string,
  defaultCountry: CountryCode = 'NG'
): PhoneValidationResult {
  const countryObj = getCountryByCode(defaultCountry);

  if (!raw || !raw.trim()) {
    return {
      isValid: false,
      formatted: '',
      formattedInternational: '',
      formattedNational: '',
      countryCode: countryObj.code,
      countryName: countryObj.name,
      dialCode: countryObj.dialCode,
      error: 'Mobile phone number is required.',
    };
  }

  const trimmed = raw.trim();

  // Check if string contains standard phone characters
  if (!/^[\d\s()+-]+$/.test(trimmed)) {
    return {
      isValid: false,
      formatted: raw,
      formattedInternational: '',
      formattedNational: '',
      countryCode: countryObj.code,
      countryName: countryObj.name,
      dialCode: countryObj.dialCode,
      error: 'Phone number contains invalid characters.',
    };
  }

  try {
    // If input does not start with '+', parse with defaultCountry
    const parsed = parsePhoneNumber(trimmed, defaultCountry);

    if (parsed && parsed.isValid()) {
      const detectedCountry = parsed.country || defaultCountry;
      const detectedCountryObj = getCountryByCode(detectedCountry);
      const international = parsed.formatInternational();
      const national = parsed.formatNational();

      let carrier: string | undefined = undefined;

      // Detect Nigerian network operator if country is Nigeria
      if (detectedCountry === 'NG') {
        const cleanNational = national.replace(/\D/g, '');
        const fullLocal = cleanNational.startsWith('0') ? cleanNational : `0${cleanNational}`;
        const prefix = fullLocal.slice(0, 4);
        carrier = NIGERIAN_PREFIXES[prefix] || 'Nigerian Cellular Network';
      } else {
        carrier = `${detectedCountryObj.name} Telecom Network`;
      }

      return {
        isValid: true,
        formatted: international,
        formattedInternational: international,
        formattedNational: national,
        countryCode: detectedCountry,
        countryName: detectedCountryObj.name,
        dialCode: `+${parsed.countryCallingCode}`,
        carrier,
      };
    }
  } catch {
    // libphonenumber failed parsing
  }

  // Fallback for Nigerian local 11-digit numbers if parsing had ambiguity
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (defaultCountry === 'NG' && digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    const prefix = digitsOnly.slice(0, 4);
    const carrier = NIGERIAN_PREFIXES[prefix] || 'Nigerian Cellular Network';
    const formattedIntl = `+234 ${digitsOnly.slice(1, 4)} ${digitsOnly.slice(4, 7)} ${digitsOnly.slice(7)}`;
    const formattedNat = `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4, 7)} ${digitsOnly.slice(7)}`;

    return {
      isValid: true,
      formatted: formattedIntl,
      formattedInternational: formattedIntl,
      formattedNational: formattedNat,
      countryCode: 'NG',
      countryName: 'Nigeria',
      dialCode: '+234',
      carrier,
    };
  }

  return {
    isValid: false,
    formatted: raw,
    formattedInternational: '',
    formattedNational: '',
    countryCode: countryObj.code,
    countryName: countryObj.name,
    dialCode: countryObj.dialCode,
    error: `Please enter a valid phone number for ${countryObj.name} (${countryObj.dialCode}).`,
  };
}
