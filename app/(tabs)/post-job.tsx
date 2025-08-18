/**
 * Post Job Screen
 * Create a new job posting
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Modal,
  Pressable,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../src/context/ThemeProvider';
import { useAuth } from '../../src/context/AuthContext';
import { Card } from '../../src/components/ui/Card';
import { PrimaryButton } from '../../src/components/ui/PrimaryButton';
import { supabase } from '../../src/lib/supabase';
import i18n from '../../i18n';

import { CATEGORY_GROUPS } from '../../src/constants/categories';

const formSchema = z.object({ description: z.string().min(20, 'Please enter at least 20 characters') })

export default function PostJobScreen() {
  const { colors, typography, spacing, radius } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [budget, setBudget] = useState('');
  const [svc, setSvc] = useState<{ group: string; slug: string; label: string } | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<{ path: string; publicUrl: string }[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<{ path: string; signedUrl?: string; name: string; type?: string }[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiTags, setAiTags] = useState<string[]>([])
  const [aiRisks, setAiRisks] = useState<string[]>([])
  const [aiMissing, setAiMissing] = useState<string[]>([])
  const [aiOpen, setAiOpen] = useState(false)

  const [openSelector, setOpenSelector] = useState(false);
  const [activeGroup, setActiveGroup] = useState<(typeof CATEGORY_GROUPS)[number]['group']>(CATEGORY_GROUPS[0].group);

  const { control, handleSubmit, formState: { errors } } = useForm<{ description: string }>({
    resolver: zodResolver(formSchema),
    defaultValues: { description: '' }
  });


  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleCategorySelect = (next: { group: string; slug: string; label: string }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSvc(next);
    setOpenSelector(false);
  };

  const handlePostJob = async (formData?: { description: string }) => {
    Keyboard.dismiss();
    const desc = formData?.description ?? description;
    if (!title || !desc || !svc || !svc.slug || !svc.group) {
      Alert.alert('Error', 'Please fill in all required fields (title, description, service).');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const payload: any = {
        title,
        description: desc,
        city: location,
        address: address || null,
        postal_code: postalCode || null,
        budget: Number(budget) || null,
        service_group: svc.group,
        service_slug: svc.slug,
        poster_id: user?.id,
        user_id: user?.id, // satisfy legacy RLS policy that expects user_id = auth.uid()
        status: 'open',
        created_at: new Date().toISOString(),
      };

      const { data: inserted, error } = await supabase.from('jobs').insert({
        ...payload,
        photos: uploadedPhotos.map(p=>p.publicUrl),
        attachments: uploadedFiles.map(f=>({ path: f.path, name: f.name, type: f.type })),
      }).select().single();
      if (error) throw error;
      try { const { upsertJobEmbedding } = await import('../../src/lib/ai'); await upsertJobEmbedding(inserted?.id); } catch {}

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Job Posted!',
        'Your job has been posted successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/hire/jobs/posted'),
          },
        ]
      );
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to post job. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: spacing[4] }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text
            style={[
              styles.headerTitle,
              {
                color: colors.textPrimary,
                fontFamily: typography.fontFamily.bold,
                fontSize: typography.fontSize.xl,
              },
            ]}
          >
            {i18n.t('nav.postJob')}
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={[styles.content, { paddingHorizontal: spacing[4] }]}>
            {/* Job Title */}
            <Card variant="elevated" padding="none" style={styles.inputCard}>
              <View style={[styles.inputSection, { padding: spacing[4] }]}>
                <Text
                  style={[
                    styles.label,
                    {
                      color: colors.textPrimary,
                      fontFamily: typography.fontFamily.semibold,
                      fontSize: typography.fontSize.base,
                    },
                  ]}
                >
                  Job Title *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.textPrimary,
                      fontFamily: typography.fontFamily.medium,
                      fontSize: typography.fontSize.base,
                      backgroundColor: colors.surface,
                      borderRadius: radius.lg,
                    },
                  ]}
                  placeholder="e.g., Snow removal for driveway"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={title}
                  onChangeText={setTitle}
                  maxLength={100}
                />
              </View>
            </Card>

            {/* Service selector (Pressable opens Modal) */}
            <Card variant="elevated" padding="none" style={styles.inputCard}>
              <View style={[styles.inputSection, { padding: spacing[4] }]}>
                <Text style={[styles.label, { color: colors.textPrimary, fontFamily: typography.fontFamily.semibold, fontSize: typography.fontSize.base }]}>Service *</Text>
                <Pressable onPress={() => setOpenSelector(true)} style={{ minHeight: 48, borderWidth: 1, borderColor: colors.stroke, backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: 16, alignItems: 'center', flexDirection: 'row' }}>
                  <Ionicons name="briefcase-outline" size={18} color={colors.muted} />
                  <Text style={{ marginLeft: 8, color: colors.onSurface, fontFamily: typography.fontFamily.medium }}>
                    {svc?.label ?? 'Select service'}
                  </Text>
                </Pressable>
              </View>
            </Card>

            {/* Modal for selecting service */}
            <Modal visible={openSelector} animationType="slide" onRequestClose={() => setOpenSelector(false)}>
              <SafeAreaView edges={['top','bottom']} style={{ flex: 1, backgroundColor: '#0B0F1A', paddingTop: insets.top }}>
                {/* Top title bar */}
                <View style={{ paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>Select service</Text>
                  <TouchableOpacity onPress={() => setOpenSelector(false)}>
                    <Ionicons name="close" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* List with sticky, scrollable chip header */}
                <FlatList
                  data={(CATEGORY_GROUPS.find(g => g.group === activeGroup)?.items) || []}
                  keyExtractor={(item) => `${activeGroup}-${item.slug}`}
                  stickyHeaderIndices={[0]}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  ListHeaderComponent={
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10, gap: 8 }}
                    >
                      {CATEGORY_GROUPS.map((g) => {
                        const selected = activeGroup === g.group;
                        return (
                          <Pressable
                            key={g.group}
                            onPress={() => setActiveGroup(g.group)}
                            style={{
                              paddingHorizontal: 14,
                              height: 36,
                              borderRadius: 18,
                              justifyContent: 'center',
                              alignItems: 'center',
                              backgroundColor: selected ? '#00E6CF' : 'rgba(255,255,255,0.08)',
                            }}
                          >
                            <Text style={{ color: selected ? '#0B0F1A' : '#fff' }}>{g.label}</Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  }
                  contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
                  renderItem={({ item }) => (
                    <Pressable onPress={() => handleCategorySelect({ group: activeGroup, slug: item.slug, label: item.label })}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}>
                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#0F2E2B', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                          <Ionicons name={item.icon as any} size={18} color={'#00E6CF'} />
                        </View>
                        <Text style={{ color: 'white' }}>{item.label}</Text>
                      </View>
                      <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
                    </Pressable>
                  )}
                />
              </SafeAreaView>
            </Modal>

            {/* Description with helper tips */}
            <Card variant="elevated" padding="none" style={styles.inputCard}>
              <View style={[styles.inputSection, { padding: spacing[4] }]}>
                <Text style={[styles.label, { color: colors.textPrimary, fontFamily: typography.fontFamily.semibold, fontSize: typography.fontSize.base }]}>Description *</Text>
                <Controller
                  control={control}
                  name="description"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.textArea, { color: colors.textPrimary, fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.base, backgroundColor: colors.surface, borderRadius: radius.lg }]}
                      placeholder="Describe the job in detail..."
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      value={value}
                      onChangeText={(v) => { onChange(v); setDescription(v); }}
                      onBlur={onBlur}
                      multiline
                      numberOfLines={4}
                      maxLength={500}
                      textAlignVertical="top"
                    />
                  )}
                />
                {!!errors.description && (
                  <Text style={{ color: colors.error, marginTop: 6 }}>{errors.description.message as any}</Text>
                )}
                <View style={{ height: 8 }} />
                <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.stroke }}>
                  {/* Attachments header */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{i18n.t('common.attachments')}</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        onPress={async()=>{
                          try {
                            const { default: ImagePicker } = await import('expo-image-picker');
                            const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: (ImagePicker as any).MediaTypeOptions?.Images ?? 'images', quality: 0.85 });
                            if ((res as any).canceled) return;
                            const asset = (res as any).assets?.[0];
                            if (!asset?.uri) return;
                            if (!user?.id) { Alert.alert('Auth', 'Sign in required'); return }
                            const ext = String(asset.uri).split('.').pop() || 'jpg';
                            const path = `jobs/${user.id}/${Date.now()}.${ext}`;
                            const r = await fetch(asset.uri);
                            const blob = await r.blob();
                            const up = await supabase.storage.from('job-photos').upload(path, blob, { upsert: true, contentType: asset.mimeType || 'image/jpeg' });
                            if (up.error) throw up.error;
                            const { data } = supabase.storage.from('job-photos').getPublicUrl(path);
                            setUploadedPhotos(prev => [...prev, { path, publicUrl: data.publicUrl }]);
                          } catch (e:any) { Alert.alert('Upload', e?.message||'Failed to add photo'); }
                        }}
                        style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#0F2E2B' }}
                      >
                        <Text style={{ color: '#00E6CF' }}>{i18n.t('common.add_photo')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={async()=>{
                          try {
                            let DocPicker: any;
                            try { DocPicker = require('expo-document-picker'); } catch { Alert.alert('Missing module', 'Please install expo-document-picker to add files'); return; }
                            const res = await DocPicker.getDocumentAsync({ copyToCacheDirectory: true });
                            if (res.canceled) return;
                            const file = res.assets?.[0];
                            if (!file?.uri) return;
                            if (!user?.id) { Alert.alert('Auth', 'Sign in required'); return }
                            const ext = String(file.name || 'file').split('.').pop() || 'bin';
                            const path = `jobs/${user.id}/${Date.now()}.${ext}`;
                            const r = await fetch(file.uri);
                            const blob = await r.blob();
                            const up = await supabase.storage.from('job-files').upload(path, blob, { upsert: true, contentType: file.mimeType || 'application/octet-stream' });
                            if (up.error) throw up.error;
                            // Private bucket: create signed URL for preview/use
                            const { data: signed } = await supabase.storage.from('job-files').createSignedUrl(path, 60 * 60 * 24 * 7);
                            setUploadedFiles(prev => [...prev, { path, signedUrl: signed?.signedUrl, name: file.name || 'file', type: file.mimeType }]);
                          } catch (e:any) { Alert.alert('Upload', e?.message||'Failed to add file'); }
                        }}
                        style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#0F2E2B' }}
                      >
                        <Text style={{ color: '#00E6CF' }}>{i18n.t('common.add_file')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Photos preview */}
                  {uploadedPhotos.length ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                      {uploadedPhotos.map((p, idx) => (
                        <View key={p.path} style={{ marginRight: 8 }}>
                          <View style={{ width: 80, height: 80, borderRadius: 10, overflow: 'hidden', backgroundColor: '#111827', borderWidth:1, borderColor:'#2A3345' }}>
                            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                            {/* @ts-ignore */}
                            <Image source={{ uri: p.publicUrl }} style={{ width: '100%', height: '100%' }} />
                          </View>
                          <TouchableOpacity onPress={()=> setUploadedPhotos(prev => prev.filter((_,i)=>i!==idx))} style={{ position:'absolute', top: -6, right: -6, backgroundColor:'#1F2937', borderRadius: 999, padding:4 }}>
                            <Ionicons name="close" size={14} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  ) : null}

                  {/* Files list */}
                  {uploadedFiles.length ? (
                    <View style={{ marginTop: 10 }}>
                      {uploadedFiles.map((f, idx) => (
                        <View key={f.path} style={{ flexDirection:'row', alignItems:'center', paddingVertical:6 }}>
                          <Ionicons name="document-text-outline" size={16} color={colors.muted} />
                          <Text style={{ color: colors.onSurface, marginLeft: 8, flex:1 }} numberOfLines={1}>{f.name}</Text>
                          <TouchableOpacity onPress={()=> setUploadedFiles(prev => prev.filter((_,i)=>i!==idx))}>
                            <Ionicons name="trash-outline" size={16} color="#F87171" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  {/* Improve with AI */}
                  <TouchableOpacity
                    onPress={async()=>{
                      const { isAiCapped, setAiCapped, includesCapError } = await import('../../src/lib/aiCap')
                      if (await isAiCapped()) { Alert.alert('AI', 'Monthly AI limit reached.'); return }
                      if (!title?.trim() || !description?.trim()) { Alert.alert('AI', 'Заповніть Title та Description'); return }
                      setAiLoading(true);
                      try {
                        const { aiClassifyJob } = await import('../../src/lib/ai')
                        const { ensureSession } = await import('../../src/lib/supabase')
                        await ensureSession();
                        const res = await aiClassifyJob({ title, description, city: location, photos: uploadedPhotos.map(p=>p.publicUrl) })
                        if (res?.refined_description) setDescription(res.refined_description)
                        if (res?.service_slug) setSvc(prev => prev ? { ...prev, slug: String(res.service_slug) } : { group: activeGroup as string, slug: String(res.service_slug), label: String(res.service_slug) })
                        setAiTags(res?.tags||[]); setAiRisks(res?.risks||[]); setAiMissing(res?.missing_info||[]); setAiOpen(true)
                        Alert.alert('AI', i18n.t('common.ai_applied'))
                      } catch (e:any) {
                        if (includesCapError(e)) { await setAiCapped(); Alert.alert('AI', 'Monthly AI limit reached.'); }
                        else { Alert.alert(i18n.t('common.aiError'), e?.message||i18n.t('common.ai_failed')) }
                      } finally { setAiLoading(false) }
                    }}
                    disabled={aiLoading}
                    activeOpacity={0.8}
                    style={{ marginTop: 12, height: 44, borderRadius: 12, backgroundColor: aiLoading ? '#115e57' : colors.accent, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#0B0F1A', fontWeight: '700' }}>{aiLoading ? '...' : 'Improve with AI'}</Text>
                  </TouchableOpacity>

                  {/* AI tags */}
                  {!!aiTags.length && (
                    <View style={{ flexDirection:'row', flexWrap:'wrap', gap:6, marginTop: 10 }}>
                      {aiTags.map((t)=> (
                        <View key={t} style={{ paddingHorizontal:10, paddingVertical:6, borderRadius: 999, backgroundColor:'#0F2E2B' }}>
                          <Text style={{ color:'#00E6CF', fontSize:12 }}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* AI Insights accordion */}
                  {(aiRisks.length || aiMissing.length) ? (
                    <View style={{ marginTop: 12 }}>
                      <Pressable onPress={()=>setAiOpen(v=>!v)} style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
                        <Text style={{ color: colors.textPrimary, fontWeight:'600' }}>{i18n.t('common.ai_insights')}</Text>
                        <Ionicons name={aiOpen? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
                      </Pressable>
                      {aiOpen ? (
                        <View style={{ marginTop: 8 }}>
                          {!!aiRisks.length && (
                            <View style={{ marginBottom: 8 }}>
                              <Text style={{ color: colors.muted, marginBottom: 4 }}>{i18n.t('common.risks')}</Text>
                              {aiRisks.map((r,i)=> (<Text key={i} style={{ color: colors.onSurface, marginLeft: 8 }}>• {String(r)}</Text>))}
                            </View>
                          )}
                          {!!aiMissing.length && (
                            <View>
                              <Text style={{ color: colors.muted, marginBottom: 4 }}>{i18n.t('common.missing_info')}</Text>
                              {aiMissing.map((m,i)=> (<Text key={i} style={{ color: colors.onSurface, marginLeft: 8 }}>• {String(m)}</Text>))}
                            </View>
                          )}
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              </View>
            </Card>

            {/* Location */}
            <Card variant="elevated" padding="none" style={styles.inputCard}>
              <View style={[styles.inputSection, { padding: spacing[4] }]}>
                <Text
                  style={[
                    styles.label,
                    {
                      color: colors.textPrimary,
                      fontFamily: typography.fontFamily.semibold,
                      fontSize: typography.fontSize.base,
                    },
                  ]}
                >
                  City *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.textPrimary,
                      fontFamily: typography.fontFamily.medium,
                      fontSize: typography.fontSize.base,
                      backgroundColor: colors.surface,
                      borderRadius: radius.lg,
                    },
                  ]}
                  placeholder="e.g., Toronto, ON"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={location}
                  onChangeText={setLocation}
                />
                <View style={{ height: 12 }} />
                <Text style={[styles.label, { color: colors.textPrimary, fontFamily: typography.fontFamily.semibold, fontSize: typography.fontSize.base }]}>Address</Text>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary, fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.base, backgroundColor: colors.surface, borderRadius: radius.lg }]}
                  placeholder="123 Main St"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={address}
                  onChangeText={setAddress}
                />
                <View style={{ height: 12 }} />
                <Text style={[styles.label, { color: colors.textPrimary, fontFamily: typography.fontFamily.semibold, fontSize: typography.fontSize.base }]}>Postal Code</Text>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary, fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.base, backgroundColor: colors.surface, borderRadius: radius.lg }]}
                  placeholder="M5V 2T6"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={postalCode}
                  onChangeText={setPostalCode}
                  autoCapitalize="characters"
                />
              </View>
            </Card>

            {/* Budget */}
            <Card variant="elevated" padding="none" style={styles.inputCard}>
              <View style={[styles.inputSection, { padding: spacing[4] }]}>
                <Text
                  style={[
                    styles.label,
                    {


                      color: colors.textPrimary,
                      fontFamily: typography.fontFamily.semibold,
                      fontSize: typography.fontSize.base,
                    },
                  ]}
                >
                  Budget (Optional)
                </Text>
                <View style={styles.budgetContainer}>
                  <Text
                    style={[
                      styles.currencySymbol,
                      {
                        color: colors.muted,
                        fontFamily: typography.fontFamily.medium,
                        fontSize: typography.fontSize.base,
                      },
                    ]}
                  >
                    $
                  </Text>
                  <TextInput
                    style={[
                      styles.budgetInput,


                      {
                        color: colors.textPrimary,
                        fontFamily: typography.fontFamily.medium,
                        fontSize: typography.fontSize.base,
                        backgroundColor: colors.surface,
                        borderRadius: radius.lg,
                      },
                    ]}
                    placeholder="0"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={budget}
                    onChangeText={setBudget}
                    keyboardType="numeric"
                  />

                  </View>
                </View>
              </Card>




            {/* Bottom spacer for sticky footer */}
            <View style={{ height: 120 }} />
          </View>
        </ScrollView>
        {/* Sticky bottom action bar */}
        <View style={{ position:'absolute', left:0, right:0, bottom:0, padding:16, backgroundColor:'#0B0F1A', borderTopWidth:1, borderTopColor:'#1F2937' }}>
          <PrimaryButton title="Post Job" onPress={handleSubmit(handlePostJob)} style={{ height:56, width:'100%', borderRadius:12 }} />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
      {/* Sticky bottom action bar */}
      <View style={{ position:'absolute', left:0, right:0, bottom:0, padding:16, backgroundColor:'#0B0F1A', borderTopWidth:1, borderTopColor:'#1F2937' }}>
        <View style={{ height:56 }}>
          {/* Using Pressable PrimaryButton for full-width action */}
        </View>
      </View>

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  inputCard: {
    marginBottom: 16,
  },
  inputSection: {
    // padding applied inline
  },
  label: {
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  textArea: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 100,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  categoryText: {
    // styles applied inline
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    marginRight: 8,
  },
  budgetInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  postButton: {
    marginTop: 24,
  },
});
