export const locales = ['en', 'zh', 'de', 'ru', 'pt', 'es', 'fr', 'ko'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  de: 'Deutsch',
  ru: 'Русский',
  pt: 'Português',
  es: 'Español',
  fr: 'Français',
  ko: '한국어',
}
