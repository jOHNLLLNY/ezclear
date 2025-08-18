import { I18nManager, Platform, ToastAndroid, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './index';
import { supabase } from '../src/lib/supabase';
import { isRTL } from './languages';

let Updates: any;
let Localization: any;
try { Updates = require('expo-updates'); } catch {}
try { Localization = require('expo-localization'); } catch {}

export async function applyLanguage(lang: string) {
  const rtl = isRTL(lang);
  if (I18nManager.isRTL !== rtl) {
    I18nManager.allowRTL(rtl);
    I18nManager.forceRTL(rtl);
    // Only reload when direction changes
    try { await Updates?.reloadAsync?.(); } catch {}
  }
}

export async function saveLanguage(lang: string, userId?: string) {
  await i18n.changeLanguage(lang);
  await applyLanguage(lang);
  try {
    if (userId) {
      await supabase.from('profiles').update({ preferred_language: lang }).eq('id', userId);
    }
  } catch {}
  try { await AsyncStorage.setItem('lang', lang); } catch {}
  // Toast/confirmation
  const msg = 'Language saved';
  if (Platform.OS === 'android') { ToastAndroid.show(msg, ToastAndroid.SHORT); }
  else { try { Alert.alert(msg); } catch {} }
}

export async function loadInitialLanguage(): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem('lang');
    if (stored && !['ru','be'].includes(stored)) return stored;
  } catch {}
  // Try device locale
  try {
    const device = Localization?.getLocales?.()?.[0]?.languageCode as string | undefined;
    if (device && !['ru','be'].includes(device)) return device;
  } catch {}
  return 'en';
}

