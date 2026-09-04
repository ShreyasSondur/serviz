/**
 * Helper to format UAE phone numbers with +971 prefix and generate clean tel/wa URLs.
 */

export interface FormattedPhone {
  display: string;
  cleanDigits: string;
  telUrl: string;
  waUrl: string;
}

export function formatUaePhone(rawPhone?: string | null): FormattedPhone {
  if (!rawPhone || rawPhone.trim() === '' || rawPhone.includes('HIDDEN')) {
    return {
      display: '+971 52 164 0226',
      cleanDigits: '971521640226',
      telUrl: 'tel:+971521640226',
      waUrl: 'https://wa.me/971521640226',
    };
  }

  let digits = rawPhone.replace(/[^0-9]/g, '');

  if (digits.startsWith('971')) {
    // Already starts with 971
  } else if (digits.startsWith('0')) {
    digits = '971' + digits.substring(1);
  } else if (digits.length === 9) {
    digits = '971' + digits;
  } else if (!digits.startsWith('971')) {
    digits = '971' + digits;
  }

  const numPart = digits.substring(3);
  let formattedDisplay = `+971 ${numPart}`;
  if (numPart.length === 9) {
    formattedDisplay = `+971 ${numPart.substring(0, 2)} ${numPart.substring(2, 5)} ${numPart.substring(5)}`;
  }

  return {
    display: formattedDisplay,
    cleanDigits: digits,
    telUrl: `tel:+${digits}`,
    waUrl: `https://wa.me/${digits}`,
  };
}

export default formatUaePhone;
