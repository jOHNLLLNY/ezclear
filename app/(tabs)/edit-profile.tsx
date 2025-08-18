import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, Image, Modal } from 'react-native';
import { Screen } from '../../src/components/ui/Screen';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../src/context/ThemeProvider';
import { useAuth } from '../../src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileScreen() {
  const { colors, typography, spacing, radius } = useTheme();
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [email, setEmail] = useState(profile?.email ?? user?.email ?? '');
  const [businessName, setBusinessName] = useState(profile?.business_name ?? '');
  const [city, setCity] = useState(profile?.location ?? '');
  const [province, setProvince] = useState(profile?.province ?? '');
  const [about, setAbout] = useState(profile?.about ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(profile?.avatar_url ?? null);
  const [saving, setSaving] = useState(false);
  const [provinceOpen, setProvinceOpen] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    if (!fullName.trim()) {
      Alert.alert('Validation', 'Please enter your full name');
      return;
    }
    setSaving(true);
    try {
      const { supabase } = await import('../../src/lib/supabase');
      let avatar_url = profile?.avatar_url ?? null;
      if (avatarUri && !avatarUri.startsWith('http')) {
        try {
          const res = await fetch(avatarUri);
          const blob = await res.blob();
          const path = `avatars/${user.id}-${Date.now()}.jpg`;
          const up = await supabase.storage.from('avatars').upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
          if (!up.error) {
            const { data } = supabase.storage.from('avatars').getPublicUrl(path);
            avatar_url = data.publicUrl;
          }
        } catch {}
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          email: email.trim(),
          business_name: businessName.trim() || null,
          location: city.trim(),
          province: province || null,
          about: about.trim() || null,
          avatar_url: avatar_url,
        })
        .eq('id', user.id);
      if (error) throw error;
      try { await fetch((process.env.EXPO_PUBLIC_SUPABASE_URL||'').replace(/\/$/,'') + '/functions/v1/upsert-profile-embedding', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ profile_id: user.id }) }) } catch {}
      Alert.alert('Saved', 'Your profile was updated');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your photos to set an avatar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 }]}>        
        {/* Avatar block */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', position: 'relative', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%', borderRadius: 60 }} />
            ) : (
              <Ionicons name="person-outline" size={48} color="#FFFFFF" />
            )}
            <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={{ position: 'absolute', right: -2, bottom: -2, width: 36, height: 36, borderRadius: 18, backgroundColor: '#00E6CF', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#0B0F1A' }}>
              <Ionicons name="camera" size={18} color="#0B0F1A" />
            </TouchableOpacity>
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8, fontSize: 14 }}>{user?.email}</Text>
        </View>

        {/* Form */}
        <View style={{ gap: 12 }}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput style={styles.input} placeholder="Your name" placeholderTextColor="#FFFFFF" value={fullName} onChangeText={setFullName} />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="your@email.com" placeholderTextColor="#FFFFFF" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

          <Text style={styles.label}>Business Name (Optional)</Text>
          <TextInput style={styles.input} placeholder="Your Business LLC" placeholderTextColor="#FFFFFF" value={businessName} onChangeText={setBusinessName} />

          <Text style={styles.label}>City</Text>
          <TextInput style={styles.input} placeholder="Your City" placeholderTextColor="#FFFFFF" value={city} onChangeText={setCity} />

          <Text style={styles.label}>Province</Text>
          <TouchableOpacity onPress={() => setProvinceOpen(true)} activeOpacity={0.8} style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
            <Text style={{ color: '#FFFFFF' }}>{province || 'Select province'}</Text>
            <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <Text style={styles.label}>About You</Text>
          <TextInput style={[styles.input, { height: 120, textAlignVertical: 'top' }]} placeholder="Tell us about yourself" placeholderTextColor="#FFFFFF" value={about} onChangeText={setAbout} multiline />

          <TouchableOpacity onPress={handleSave} activeOpacity={0.85} disabled={saving} style={{ height: 56, borderRadius: 14, backgroundColor: '#00E6CF', alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>{saving ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Province modal */}
      <Modal visible={provinceOpen} transparent animationType="fade" onRequestClose={() => setProvinceOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '88%', backgroundColor: '#0B0F1A', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 16 }}>
            {provinces.map((p) => (
              <TouchableOpacity key={p} onPress={() => { setProvince(p); setProvinceOpen(false); }} style={{ paddingVertical: 12 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 16 }}>{p}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setProvinceOpen(false)} style={{ alignSelf: 'flex-end', marginTop: 8 }}>
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
  content: { paddingBottom: 24 },
  label: { marginBottom: 6, color: '#9CA3AF', fontWeight: '600' },
  input: { paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1, borderColor: '#374151', backgroundColor: '#1F2937', borderRadius: 12, color: '#FFFFFF' },
});


const provinces = [
  'Alberta',
  'British Columbia',
  'Manitoba',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Nova Scotia',
  'Ontario',
  'Prince Edward Island',
  'Quebec',
  'Saskatchewan',
];
