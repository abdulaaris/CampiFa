/**
 * CampiFa Intelligent Multi-Language Font & Script Detector
 * Automatically detects Kannada, Malayalam, Telugu, Tamil, Devanagari/Hindi, etc.
 * and applies Google Anek font family with Semi-Bold (600) weight!
 */

export interface DetectedFontInfo {
  fontFamily: string;
  fontWeight: string;
  language: string;
}

export function detectScriptFont(
  text: string,
  preferredFamily?: string,
  preferredWeight?: string | number
): DetectedFontInfo {
  if (!text || !text.trim()) {
    return {
      fontFamily: preferredFamily || '"Poppins", sans-serif',
      fontWeight: (preferredWeight || '600').toString(),
      language: 'default',
    };
  }

  // 1. Kannada (U+0C80 to U+0CFF)
  if (/[\u0C80-\u0CFF]/.test(text)) {
    return {
      fontFamily: '"Anek Kannada", sans-serif',
      fontWeight: '600',
      language: 'Kannada',
    };
  }

  // 2. Malayalam (U+0D00 to U+0D7F)
  if (/[\u0D00-\u0D7F]/.test(text)) {
    return {
      fontFamily: '"Anek Malayalam", sans-serif',
      fontWeight: '600',
      language: 'Malayalam',
    };
  }

  // 3. Telugu (U+0C00 to U+0C7F)
  if (/[\u0C00-\u0C7F]/.test(text)) {
    return {
      fontFamily: '"Anek Telugu", sans-serif',
      fontWeight: '600',
      language: 'Telugu',
    };
  }

  // 4. Tamil (U+0B80 to U+0BFF)
  if (/[\u0B80-\u0BFF]/.test(text)) {
    return {
      fontFamily: '"Anek Tamil", sans-serif',
      fontWeight: '600',
      language: 'Tamil',
    };
  }

  // 5. Hindi / Marathi / Sanskrit / Devanagari (U+0900 to U+097F)
  if (/[\u0900-\u097F]/.test(text)) {
    return {
      fontFamily: '"Anek Devanagari", sans-serif',
      fontWeight: '600',
      language: 'Devanagari',
    };
  }

  // 6. Bengali / Assamese (U+0980 to U+09FF)
  if (/[\u0980-\u09FF]/.test(text)) {
    return {
      fontFamily: '"Anek Bangla", sans-serif',
      fontWeight: '600',
      language: 'Bangla',
    };
  }

  // 7. Gujarati (U+0A80 to U+0AFF)
  if (/[\u0A80-\u0AFF]/.test(text)) {
    return {
      fontFamily: '"Anek Gujarati", sans-serif',
      fontWeight: '600',
      language: 'Gujarati',
    };
  }

  // 8. Odia (U+0B00 to U+0B7F)
  if (/[\u0B00-\u0B7F]/.test(text)) {
    return {
      fontFamily: '"Anek Odia", sans-serif',
      fontWeight: '600',
      language: 'Odia',
    };
  }

  // 9. Gurmukhi / Punjabi (U+0A00 to U+0A7F)
  if (/[\u0A00-\u0A7F]/.test(text)) {
    return {
      fontFamily: '"Anek Gurmukhi", sans-serif',
      fontWeight: '600',
      language: 'Gurmukhi',
    };
  }

  // 10. Arabic / Urdu (U+0600 to U+06FF, U+0750 to U+077F)
  if (/[\u0600-\u06FF\u0750-\u077F]/.test(text)) {
    return {
      fontFamily: '"Noto Naskh Arabic", sans-serif',
      fontWeight: '600',
      language: 'Arabic',
    };
  }

  // Default / English / Latin:
  return {
    fontFamily: preferredFamily || '"Poppins", sans-serif',
    fontWeight: (preferredWeight || '600').toString(),
    language: 'English/Latin',
  };
}
