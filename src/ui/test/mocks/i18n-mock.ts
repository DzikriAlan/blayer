// Mock i18next and next-i18next for testing

/**
 * Mock translation function that returns the key as-is
 * @param key - Translation key
 * @returns The key itself (for testing purposes)
 */
export const mockTranslate = (key: string): string => key;

/**
 * Creates a mock useTranslation hook
 * @returns Mock translation object
 */
export const createMockUseTranslation = () => ({
  t: mockTranslate,
  i18n: {
    changeLanguage: jest.fn().mockResolvedValue(undefined),
    language: 'en',
    languages: ['en', 'id'],
    defaultLanguage: 'en',
    resolvedLanguage: 'en',
  },
  ready: true,
});

/**
 * Mock i18n configuration
 */
export const mockI18nConfig = {
  defaultLocale: 'en',
  locales: ['en', 'id'],
  localePath: './public/locales',
  ns: ['common'],
  defaultNS: 'common',
  fallbackLng: 'en',
  fallbackNS: 'common',
  load: 'currentOnly' as const,
  interpolation: {
    escapeValue: false,
  },
};
