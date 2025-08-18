/**
 * Phone number utilities for E.164 formatting
 */

export interface CountryInfo {
  callingCode: string;
  cca2: string;
  name?: string;
}

/**
 * Convert a phone number to E.164 format
 * @param rawPhone - The raw phone number input
 * @param country - Country information with calling code
 * @returns E.164 formatted phone number or undefined if invalid
 */
export function toE164(rawPhone: string, country: CountryInfo): string | undefined {
  if (!rawPhone || !country?.callingCode) return undefined;
  
  // Remove all non-digits
  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return undefined;
  
  // Clean calling code (remove + and non-digits)
  const callingCode = country.callingCode.replace(/\D/g, '');
  if (!callingCode) return undefined;
  
  // Format as E.164
  const e164 = `+${callingCode}${digits}`;
  
  // Validate E.164 format: + followed by 1-3 digit country code, then 4-14 digits
  if (!/^\+[1-9]\d{7,14}$/.test(e164)) return undefined;
  
  return e164;
}

/**
 * Validate if a phone number is in valid E.164 format
 * @param phone - Phone number to validate
 * @returns true if valid E.164 format
 */
export function isValidE164(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

/**
 * Format phone number for display (not E.164)
 * @param phone - Raw phone number
 * @param country - Country code (e.g., 'US', 'CA')
 * @returns Formatted phone number for display
 */
export function formatPhoneForDisplay(phone: string, country: string = 'US'): string {
  const digits = phone.replace(/\D/g, '');
  
  if (country === 'US' || country === 'CA') {
    // North American format: (xxx) xxx-xxxx
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    if (digits.length === 11 && digits[0] === '1') {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
  }
  
  // Default: just return digits with spaces every 3-4 characters
  return digits.replace(/(\d{3,4})/g, '$1 ').trim();
}
