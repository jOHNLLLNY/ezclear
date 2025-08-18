import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../src/context/ThemeProvider'

type FaqItem = { id: string; question: string; answer: string; tags?: string[] }

const FAQ: FaqItem[] = [
  {
    id: 'create-account',
    question: 'How do I create an account?',
    answer:
      'Go to Create Account, sign up with email or Google/Apple/Facebook. Verify your email to activate your profile.',
  },
  {
    id: 'post-job',
    question: 'How do I post a job?',
    answer:
      'If you are a hirer, tap the Post button on the bottom bar, fill in title, budget, location and publish.',
  },
  {
    id: 'apply-job',
    question: 'How do I apply for a job?',
    answer:
      'Open Find Jobs, select a job and tap Apply. Add a note and your quote if required.',
  },
  {
    id: 'payments',
    question: 'How do payments work?',
    answer:
      'Payments are handled securely. Add a payment method in Profile → Payment Methods and follow in-app steps.',
  },
  {
    id: 'contact',
    question: 'How do I contact support?',
    answer:
      'Email us at support@ez-clear.com or open Help Center for live chat during business hours.',
  },
]

export default function HelpSupportScreen() {
  const { colors, spacing, radius, typography } = useTheme()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Record<string, 'yes' | 'no'>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate fetch
    const t = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    const q = String(query || '').trim().toLowerCase()
    if (!q) return FAQ
    const res = FAQ.filter((f) => String(f.question || '').toLowerCase().includes(q) || String(f.answer || '').toLowerCase().includes(q))
    // analytics
    console.log('help_search', { q, results: res.length })
    return res
  }, [query])

  const toggle = (id: string) => {
    const next = expandedId === id ? null : id
    setExpandedId(next)
    if (next) console.log('faq_open', { id: next })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handleFeedback = (id: string, v: 'yes' | 'no') => {
    setFeedback((prev) => ({ ...prev, [id]: v }))
    console.log('faq_feedback', { id, value: v })
    Haptics.selectionAsync()
  }

  const openMail = () => Linking.openURL('mailto:support@ez-clear.com')

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <SafeAreaView style={{ paddingHorizontal: 16, paddingTop: 8 }} edges={['top']}>        
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back" style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.semibold, fontSize: 20 }}>Help & Support</Text>
          <View style={{ width: 40 }} />
        </View>
        {/* Search */}
        <View style={[styles.searchBox, { backgroundColor: '#1F2937', borderColor: colors.stroke }]}>          
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search for help..."
            placeholderTextColor={colors.textSecondary}
            style={{ flex: 1, color: colors.textPrimary, marginLeft: 8 }}
          />
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        {/* Loading / Error states */}
        {loading ? (
          <View style={{ gap: 12, marginTop: 12 }}>
            {[...Array(5)].map((_, i) => (
              <View key={i} style={{ height: 72, borderRadius: 16, backgroundColor: '#111827' }} />
            ))}
          </View>
        ) : error ? (
          <View style={{ backgroundColor: '#111827', borderColor: colors.stroke, borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 12 }}>
            <Text style={{ color: colors.textPrimary, marginBottom: 8 }}>Failed to load help content.</Text>
            <TouchableOpacity onPress={() => { setError(null); setLoading(true); setTimeout(() => setLoading(false), 400) }} style={{ alignSelf: 'flex-start', backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* FAQ section */}
            <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.bold, marginTop: 16, marginBottom: 10 }}>Frequently Asked Questions</Text>

            {filtered.length === 0 ? (
              <Text style={{ color: colors.textSecondary, marginTop: 8 }}>No results. Try different keywords.</Text>
            ) : (
              filtered.map((f) => {
                const expanded = expandedId === f.id
                return (
                  <View key={f.id} style={[styles.faqCard, { backgroundColor: '#1F2937', borderColor: '#2A3345' }]}>
                    <TouchableOpacity
                      style={styles.faqHeader}
                      onPress={() => toggle(f.id)}
                      accessibilityRole="button"
                      accessibilityState={{ expanded }}
                      activeOpacity={0.8}
                    >
                      <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', flex: 1 }}>{f.question}</Text>
                      <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                    {expanded && (
                      <View style={{ marginTop: 8 }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 20 }}>{f.answer}</Text>
                        <View style={styles.feedbackRow}>
                          <Text style={{ color: colors.textSecondary, marginRight: 8 }}>Was this helpful?</Text>
                          <TouchableOpacity onPress={() => handleFeedback(f.id, 'yes')} accessibilityLabel="Helpful" style={[styles.fbBtn, feedback[f.id] === 'yes' && { borderColor: colors.primary }]}>
                            <Text style={{ color: colors.textPrimary }}>👍</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleFeedback(f.id, 'no')} accessibilityLabel="Not helpful" style={[styles.fbBtn, feedback[f.id] === 'no' && { borderColor: colors.primary }]}>
                            <Text style={{ color: colors.textPrimary }}>👎</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                )
              })
            )}

            {/* Contact section */}
            <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.bold, marginTop: 20, marginBottom: 10 }}>Contact Us</Text>
            <TouchableOpacity activeOpacity={0.85} onPress={openMail} style={[styles.contactCard, { backgroundColor: '#111827', borderColor: colors.stroke }]}>              
              <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '22' }]}>                
                <Ionicons name="mail" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>Email Support</Text>
                <Text style={{ color: colors.textSecondary, marginTop: 2 }}>24/7 response</Text>
                <Text style={{ color: colors.primary, marginTop: 6 }}>support@ez-clear.com</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  searchBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 8 },
  faqCard: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12 },
  faqHeader: { flexDirection: 'row', alignItems: 'center' },
  feedbackRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  fbBtn: { borderWidth: 1, borderColor: 'transparent', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginRight: 6 },
  contactCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, padding: 14 },
  iconWrapper: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
})


