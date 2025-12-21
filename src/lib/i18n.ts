import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import de from '@/locales/de/common.json';
import en from '@/locales/en/common.json';
import fr from '@/locales/fr/common.json';
import it from '@/locales/it/common.json';
import gsw from '@/locales/gsw/common.json';

const resources = {
  de: { translation: de },
  en: { translation: en },
  fr: { translation: fr },
  it: { translation: it },
  gsw: { translation: gsw },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'de',
    supportedLngs: ['de', 'en', 'fr', 'it', 'gsw'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
