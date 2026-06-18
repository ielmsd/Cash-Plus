import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import fr from './locales/fr.json'
import ar from './locales/ar.json'

const savedLang = localStorage.getItem('lang') || 'fr'

i18n
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, fr: { translation: fr }, ar: { translation: ar } },
    lng: savedLang,
    fallbackLng: 'fr',
    interpolation: { escapeValue: false },
  })

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('lang', lng)
  document.documentElement.lang = lng
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr'
})

document.documentElement.lang = savedLang
document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr'

export default i18n
