import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useTheme } from '../../src/context/ThemeProvider';
import { Screen } from '../../src/components/ui/Screen';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../../i18n';
import { SAFE_LANGS } from '../../i18n/languages';
import { saveLanguage, loadInitialLanguage } from '../../i18n/helpers';
import { useAuth } from '../../src/context/AuthContext';

export default function SettingsScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'account' | 'preferences' | 'notifications' | 'general'>('preferences');
  const [langModal, setLangModal] = useState(false);
  const [languageCode, setLanguageCode] = useState<string>('en');
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      const initial = await loadInitialLanguage();
      setLanguageCode(initial);
    })();
  }, []);

  const languageLabel = useMemo(() => SAFE_LANGS.find(l => l.code === languageCode)?.label || 'English', [languageCode]);

  const Tab = ({ id, label, icon }: { id: typeof activeTab; label: string; icon: keyof typeof Ionicons.glyphMap }) => {
    const active = activeTab === id;
    return (
      <TouchableOpacity onPress={() => setActiveTab(id)} activeOpacity={0.8} style={[styles.tabItem, { backgroundColor: active ? colors.surface : 'transparent', borderRadius: radius.lg }]}>
        <Ionicons name={active ? (icon as any) : (icon as any)} size={18} color={active ? colors.primary : colors.onSurface} />
        <Text style={{ color: active ? colors.primary : colors.onSurface, marginLeft: 8 }}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}>
        {/* Header */}
        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 22, marginBottom: 16 }}>{i18n.t('settings.title')}</Text>

        {/* Tabs (horizontally scrollable chips) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          style={{ marginHorizontal: -16, marginBottom: 16 }}
        >
          <Tab id="account" label={i18n.t('settings.account')} icon="person-outline" />
          <Tab id="preferences" label={i18n.t('settings.preferences')} icon="settings-outline" />
          <Tab id="notifications" label={i18n.t('settings.notifications')} icon="notifications-outline" />
          <Tab id="general" label={i18n.t('settings.general')} icon="globe-outline" />
        </ScrollView>

        {/* Preferences Card */}
        {activeTab === 'preferences' && (
          <View style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: '#1F2937', borderRadius: 12, padding: 16, gap: 16 }}>
            {/* Language */}
            <View>
              <Text style={{ color: '#9CA3AF', marginBottom: 6 }}>{i18n.t('settings.language')}</Text>
              <TouchableOpacity onPress={() => setLangModal(true)} activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#111827', borderRadius: 12, borderWidth: 1, borderColor: '#374151', paddingHorizontal: 14, paddingVertical: 14 }}>
                <Text style={{ color: '#FFFFFF' }}>{languageLabel}</Text>
                <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Push Notifications */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: '#9CA3AF', marginBottom: 4 }}>{i18n.t('settings.pushTitle')}</Text>
                <Text style={{ color: '#6B7280', fontSize: 12 }}>{i18n.t('settings.pushSubtitle')}</Text>
              </View>
              <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ false: '#374151', true: '#00E6CF' }} thumbColor={'#FFFFFF'} />
            </View>

            {/* Save button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => saveLanguage(languageCode, user?.id)}
              style={{ height: 56, borderRadius: 14, backgroundColor: '#00E6CF', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}
            >
              <Ionicons name="save-outline" size={18} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{i18n.t('settings.save')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Language modal */}
      <Modal visible={langModal} transparent animationType="fade" onRequestClose={() => setLangModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '88%', backgroundColor: '#0B0F1A', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            <ScrollView style={{ maxHeight: 320 }}>
              {SAFE_LANGS.map((lang) => (
                <TouchableOpacity key={lang.code} onPress={() => { setLanguageCode(lang.code); setLangModal(false); }} style={{ paddingVertical: 16, paddingHorizontal: 16, backgroundColor: languageCode === lang.code ? 'rgba(255,255,255,0.05)' : 'transparent', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 16 }}>{lang.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setLangModal(false)} style={{ alignSelf: 'flex-end', padding: 14 }}>
              <Text style={{ color: '#00E6CF' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
});
