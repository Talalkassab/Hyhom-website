import { create } from 'zustand';
import { translations } from './translations';

type LanguageStore = {
  language: 'en' | 'ar';
  direction: 'ltr' | 'rtl';
  setLanguage: (lang: 'en' | 'ar') => void;
  t: (key: string) => string;
};

export const useLanguage = create<LanguageStore>((set, get) => ({
  language: 'en',
  direction: 'ltr',
  setLanguage: (lang) => {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    set({ language: lang, direction: lang === 'ar' ? 'rtl' : 'ltr' });
  },
  t: (key) => {
    const lang = get().language;
    return translations[lang][key] || key;
  },
}));
