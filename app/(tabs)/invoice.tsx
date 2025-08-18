import React, { useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, FlatList, Alert, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../src/context/ThemeProvider'
import { useAuth } from '../../src/context/AuthContext'
import { useRouter } from 'expo-router'

type Line = { id: string; item: string; description: string; qty: number; rate: number; tax: number }

const currencies = ['USD', 'CAD', 'EUR'] as const

export default function InvoiceGeneratorScreen() {
  const { colors, typography } = useTheme()
  const { profile, session } = useAuth()
  const router = useRouter()
  const isHire = (profile?.user_type || session?.user?.user_metadata?.user_type) === 'hirer'
  const [status, setStatus] = useState<'Draft' | 'Sent' | 'Paid' | 'Overdue'>('Draft')
  const [currency, setCurrency] = useState<typeof currencies[number]>('USD')
  const [invoiceNo, setInvoiceNo] = useState(`INV-${Math.floor(Math.random() * 9000 + 1000)}`)
  const [date, setDate] = useState<string>(new Date().toDateString())
  const [dueDate, setDueDate] = useState<string>(new Date(Date.now() + 7 * 864e5).toDateString())

  const [from, setFrom] = useState({ name: '', address: '', email: '', phone: '' })
  const [to, setTo] = useState({ name: '', address: '', email: '', phone: '' })
  const [lines, setLines] = useState<Line[]>([{ id: '1', item: '', description: '', qty: 1, rate: 0, tax: 0 }])
  const [notes, setNotes] = useState('Thank you for your business!')
  const [methods, setMethods] = useState<{ cash: boolean; card: boolean; bank: boolean }>({ cash: true, card: false, bank: false })
  const [iban, setIban] = useState('')

  // Redirect hires out of invoice screen
  useEffect(() => { if (isHire) router.replace('/(tabs)/profile') }, [isHire])

  // Autosave mock
  useEffect(() => {
    const t = setInterval(() => console.log('autosave_draft', { invoiceNo }), 10000)
    return () => clearInterval(t)
  }, [invoiceNo])

  const totals = useMemo(() => {
    const subtotal = lines.reduce((s, l) => s + l.qty * l.rate, 0)
    const tax = lines.reduce((s, l) => s + (l.qty * l.rate * (l.tax || 0)) / 100, 0)
    const total = subtotal + tax
    return { subtotal, tax, total }
  }, [lines])

  const updateLine = (id: string, patch: Partial<Line>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }
  const addLine = () => setLines((prev) => [...prev, { id: String(Date.now()), item: '', description: '', qty: 1, rate: 0, tax: 0 }])
  const dupLine = (id: string) => setLines((prev) => {
    const l = prev.find((x) => x.id === id)
    return l ? [...prev, { ...l, id: String(Date.now()) }] : prev
  })
  const delLine = (id: string) => setLines((prev) => prev.filter((l) => l.id !== id))

  const format = (v: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(isFinite(v) ? v : 0)

  return (
    <View style={[styles.container, { backgroundColor: '#0B0F1A' }]}>      
      <SafeAreaView style={{ paddingHorizontal: 16, paddingTop: 8 }} edges={['top']}>        
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => history.back()} style={styles.iconBtn} accessibilityLabel="Back">
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 20 }}>Invoice Generator</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={() => Alert.alert('Preview')} style={styles.iconBtn} accessibilityLabel="Preview">
              <Ionicons name="eye" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Alert.alert('Saved')} style={styles.iconBtn} accessibilityLabel="Save">
              <Ionicons name="save-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        {/* Status chip */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
          <View style={[styles.chip, { backgroundColor: status === 'Draft' ? '#334155' : status === 'Sent' ? '#0284C7' : status === 'Paid' ? '#10B981' : '#F43F5E' }]}>
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12 }}>{status.toUpperCase()}</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}>
        {/* Primary card */}
        <View style={styles.card}>
          {/* Header grid */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 18 }}>INVOICE</Text>
            <View style={{ minWidth: 160, gap: 8 }}>
              <Text style={styles.label}>Date</Text>
              <TextInput value={date} onChangeText={setDate} style={styles.input} placeholderTextColor="#FFFFFF" />
              <Text style={[styles.label, { marginTop: 8 }]}>Due Date</Text>
              <TextInput value={dueDate} onChangeText={setDueDate} style={styles.input} placeholderTextColor="#FFFFFF" />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Invoice #</Text>
              <TextInput value={invoiceNo} onChangeText={setInvoiceNo} style={styles.input} placeholderTextColor="#FFFFFF" />
            </View>
            <View style={{ width: 120 }}>
              <Text style={styles.label}>Currency</Text>
              <TextInput value={currency} onChangeText={(t) => setCurrency((t.toUpperCase() as any) || 'USD')} style={styles.input} placeholderTextColor="#FFFFFF" />
            </View>
          </View>

          {/* Parties */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={[styles.subCard, { flex: 1 }]}>
              <Text style={styles.sectionTitle}>From</Text>
              <Text style={styles.label}>Business Name</Text>
              <TextInput value={from.name} onChangeText={(v) => setFrom({ ...from, name: v })} style={styles.input} placeholder="Your Business Name" placeholderTextColor="#FFFFFF" />
              <Text style={styles.label}>Address</Text>
              <TextInput value={from.address} onChangeText={(v) => setFrom({ ...from, address: v })} style={[styles.input, { height: 80, textAlignVertical: 'top' }]} multiline placeholder="Your Business Address" placeholderTextColor="#FFFFFF" />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput value={from.email} onChangeText={(v) => setFrom({ ...from, email: v })} style={styles.input} placeholder="email@domain.com" placeholderTextColor="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Phone</Text>
                  <TextInput value={from.phone} onChangeText={(v) => setFrom({ ...from, phone: v })} style={styles.input} placeholder="(123) 456-7890" placeholderTextColor="#FFFFFF" />
                </View>
              </View>
            </View>
            <View style={[styles.subCard, { flex: 1 }]}>
              <Text style={styles.sectionTitle}>Bill To</Text>
              <Text style={styles.label}>Client Name</Text>
              <TextInput value={to.name} onChangeText={(v) => setTo({ ...to, name: v })} style={styles.input} placeholder="Client Name" placeholderTextColor="#FFFFFF" />
              <Text style={styles.label}>Address</Text>
              <TextInput value={to.address} onChangeText={(v) => setTo({ ...to, address: v })} style={[styles.input, { height: 80, textAlignVertical: 'top' }]} multiline placeholder="Client Address" placeholderTextColor="#FFFFFF" />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput value={to.email} onChangeText={(v) => setTo({ ...to, email: v })} style={styles.input} placeholder="client@email.com" placeholderTextColor="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Phone</Text>
                  <TextInput value={to.phone} onChangeText={(v) => setTo({ ...to, phone: v })} style={styles.input} placeholder="(123) 456-7890" placeholderTextColor="#FFFFFF" />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Line items */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Line Items</Text>
            <TouchableOpacity onPress={addLine} accessibilityLabel="Add Item">
              <Text style={{ color: '#00E6CF' }}>+ Add Item</Text>
            </TouchableOpacity>
          </View>
          {lines.map((l) => (
            <View key={l.id} style={[styles.itemRow]}>              
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Item</Text>
                <TextInput value={l.item} onChangeText={(v) => updateLine(l.id, { item: v })} style={styles.input} placeholder="Item name" placeholderTextColor="#FFFFFF" />
                <TextInput value={l.description} onChangeText={(v) => updateLine(l.id, { description: v })} style={[styles.input, { height: 64, textAlignVertical: 'top', marginTop: 6 }]} multiline placeholder="Description" placeholderTextColor="#FFFFFF" />
              </View>
              <View style={{ width: 72 }}>
                <Text style={styles.label}>Qty</Text>
                <TextInput value={String(l.qty)} onChangeText={(v) => updateLine(l.id, { qty: Number(v) || 0 })} style={styles.input} keyboardType="numeric" placeholder="0" placeholderTextColor="#FFFFFF" />
              </View>
              <View style={{ width: 92 }}>
                <Text style={styles.label}>Rate</Text>
                <TextInput value={String(l.rate)} onChangeText={(v) => updateLine(l.id, { rate: Number(v) || 0 })} style={styles.input} keyboardType="numeric" placeholder="0" placeholderTextColor="#FFFFFF" />
              </View>
              <View style={{ width: 72 }}>
                <Text style={styles.label}>Tax %</Text>
                <TextInput value={String(l.tax)} onChangeText={(v) => updateLine(l.id, { tax: Number(v) || 0 })} style={styles.input} keyboardType="numeric" placeholder="0" placeholderTextColor="#FFFFFF" />
              </View>
              <View style={{ width: 110 }}>
                <Text style={styles.label}>Amount</Text>
                <View style={[styles.input, { justifyContent: 'center' }]}>
                  <Text style={{ color: '#FFFFFF' }}>{format(l.qty * l.rate * (1 + (l.tax || 0) / 100))}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
                  <TouchableOpacity onPress={() => dupLine(l.id)} accessibilityLabel="Duplicate"><Ionicons name="copy-outline" size={18} color="#9CA3AF" /></TouchableOpacity>
                  <TouchableOpacity onPress={() => delLine(l.id)} accessibilityLabel="Delete"><Ionicons name="trash-outline" size={18} color="#9CA3AF" /></TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          {/* Totals */}
          <View style={{ alignItems: 'flex-end', marginTop: 12 }}>
            <View style={{ width: 220, gap: 8 }}>
              <Row label="Subtotal" value={format(totals.subtotal)} />
              <Row label="Tax" value={format(totals.tax)} />
              <View style={{ height: 1, backgroundColor: '#2A3345', marginVertical: 6 }} />
              <Row label="Total" value={format(totals.total)} bold />
            </View>
          </View>
        </View>

        {/* Notes & Payment */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notes / Terms</Text>
          <TextInput value={notes} onChangeText={setNotes} style={[styles.input, { height: 90, textAlignVertical: 'top' }]} multiline placeholder="Any comments or payment terms" placeholderTextColor="#FFFFFF" />

          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Payment Methods</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            {['Cash', 'Card', 'Bank'].map((n) => {
              const key = n.toLowerCase() as 'cash' | 'card' | 'bank'
              const active = (methods as any)[key]
              return (
                <TouchableOpacity key={n} onPress={() => setMethods((m) => ({ ...m, [key]: !m[key as keyof typeof m] }))} style={[styles.chip, { backgroundColor: active ? '#00E6CF' : '#334155' }]}>                  
                  <Text style={{ color: active ? '#0B0F1A' : '#FFFFFF' }}>{n}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
          {methods.bank && (
            <TextInput value={iban} onChangeText={setIban} style={styles.input} placeholder="IBAN / Account number" placeholderTextColor="#FFFFFF" />
          )}
        </View>
      </ScrollView>

      {/* Sticky footer */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>        
        <TouchableOpacity style={[styles.footerBtn, { borderColor: '#00E6CF', backgroundColor: 'transparent' }]} onPress={() => Alert.alert('Preview PDF')} accessibilityLabel="Preview PDF">
          <Ionicons name="eye" size={16} color="#00E6CF" />
          <Text style={[styles.footerBtnText, { color: '#00E6CF' }]}>Preview PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.footerBtn, { backgroundColor: '#00E6CF' }]} onPress={() => Alert.alert('Download PDF')} accessibilityLabel="Download PDF">
          <Ionicons name="download-outline" size={16} color="#0B0F1A" />
          <Text style={[styles.footerBtnText, { color: '#FFFFFF' }]}>Download PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.footerBtn, { borderColor: '#00E6CF', backgroundColor: 'transparent' }]} onPress={() => Alert.alert('Share')} accessibilityLabel="Share or Send">
          <Ionicons name="send-outline" size={16} color="#00E6CF" />
          <Text style={[styles.footerBtnText, { color: '#00E6CF' }]}>Share / Send</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  )
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: '#9CA3AF' }}>{label}</Text>
      <Text style={{ color: '#FFFFFF', fontWeight: bold ? '800' : '600' }}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  card: { backgroundColor: '#111827', borderColor: '#2A3345', borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 16 },
  subCard: { backgroundColor: '#0F172A', borderColor: '#2A3345', borderWidth: 1, borderRadius: 16, padding: 12 },
  label: { color: '#9CA3AF', marginBottom: 6 },
  sectionTitle: { color: '#FFFFFF', fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#1F2937', borderColor: '#334155', borderWidth: 1, borderRadius: 14, color: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#0B0F1A', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, flexDirection: 'row', gap: 10 },
  footerBtn: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  footerBtnText: { fontWeight: '700' },
})


