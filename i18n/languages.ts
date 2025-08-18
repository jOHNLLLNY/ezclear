export type Lang = {
  code: string;
  label: string;
  rtl?: boolean;
};

export const LANGS: Lang[] = [
  { code:'en', label:'English' },
  { code:'uk', label:'Українська' },
  { code:'pl', label:'Polski' },
  { code:'de', label:'Deutsch' },
  { code:'fr', label:'Français' },
  { code:'es', label:'Español' },
  { code:'it', label:'Italiano' },
  { code:'pt', label:'Português' },
  { code:'tr', label:'Türkçe' },
  { code:'nl', label:'Nederlands' },
  { code:'ro', label:'Română' },
  { code:'cs', label:'Čeština' },
  { code:'sk', label:'Slovenčina' },
  { code:'hu', label:'Magyar' },
  { code:'sv', label:'Svenska' },
  { code:'da', label:'Dansk' },
  { code:'no', label:'Norsk' },
  { code:'fi', label:'Suomi' },
  { code:'el', label:'Ελληνικά' },
  { code:'bg', label:'Български' },
  { code:'sr', label:'Српски' },
  { code:'hr', label:'Hrvatski' },
  { code:'sl', label:'Slovenščina' },
  { code:'et', label:'Eesti' },
  { code:'lv', label:'Latviešu' },
  { code:'lt', label:'Lietuvių' },
  { code:'he', label:'עברית', rtl:true },
  { code:'ar', label:'العربية', rtl:true },
  { code:'fa', label:'فارسی', rtl:true },
  { code:'ur', label:'اردو', rtl:true },
  { code:'hi', label:'हिन्दी' },
  { code:'bn', label:'বাংলা' },
  { code:'ta', label:'தமிழ்' },
  { code:'te', label:'తెలుగు' },
  { code:'ml', label:'മലയാളം' },
  { code:'mr', label:'मराठी' },
  { code:'pa', label:'ਪੰਜਾਬੀ' },
  { code:'zh-CN', label:'简体中文' },
  { code:'zh-TW', label:'繁體中文' },
  { code:'ja', label:'日本語' },
  { code:'ko', label:'한국어' },
  { code:'vi', label:'Tiếng Việt' },
  { code:'th', label:'ไทย' },
  { code:'id', label:'Bahasa Indonesia' },
  { code:'ms', label:'Bahasa Melayu' },
  { code:'fil', label:'Filipino' },
  { code:'sw', label:'Kiswahili' },
];

export const SAFE_LANGS: Lang[] = LANGS.filter(l => !['ru','be'].includes(l.code));
export const isRTL = (code: string) => ['ar','he','fa','ur'].includes(code);

