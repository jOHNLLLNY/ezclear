// i18n setup for React Native with react-i18next
const i18n = require('i18next');
import { initReactI18next } from 'react-i18next';
import { EN, UK } from './resources';
import { NAV_SHORT_OVERRIDES } from './resources-min';
import { SAFE_LANGS } from './languages';

// Build resources for all safe languages so that language switching always re-renders the app.
// - For 'en' use EN; for 'uk' use UK; for others, start from EN and override nav with NAV_SHORT_OVERRIDES when available.
const resources: any = {};

// Seed base packs
resources.en = { translation: EN };
resources.uk = { translation: UK };

// Ensure every safe language has at least EN as a full fallback pack
for (const lang of SAFE_LANGS) {
  if (!resources[lang.code]) {
    resources[lang.code] = { translation: EN };
  }
}

// Apply short nav overrides for many locales
for (const [code, overrides] of Object.entries(NAV_SHORT_OVERRIDES)) {
  const base = (resources as any)[code]?.translation || EN;
  (resources as any)[code] = {
    translation: {
      ...base,
      nav: { ...(base.nav || EN.nav), ...(overrides as any) },
    },
  };
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    ns: ['translation','common','job','services','categories','buttons'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v3',
    react: { useSuspense: false },
  });

export default i18n;

export const tShort = (k: string) => {
  const shortKey = `${k}_short`;
  return i18n.exists(shortKey) ? i18n.t(shortKey) : i18n.t(k);
};

