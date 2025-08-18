import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, TextInput, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../../../src/context/ThemeProvider'
import { useRouter, Stack } from 'expo-router'
import { z } from 'zod'
import * as Localization from 'expo-localization'
import CountryPicker, { Country } from 'react-native-country-picker-modal'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../../../../src/lib/supabase'
import { toE164 } from '../../../../src/lib/phone'
import { BackButton } from '../../../../src/components/ui/BackButton'
import { useFocusEffect } from '@react-navigation/native'

const Schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Za-z]/).regex(/\d/),
  agree: z.boolean().refine(v => v, 'Required'),
})
type Form = z.infer<typeof Schema>

import { useSegments } from 'expo-router'

export default function WorkerAccount() {
  const { colors, typography } = useTheme()
  const router = useRouter()
  const segments = useSegments()
  const roleFromRoute: 'worker' | 'hirer' = (Array.isArray(segments) && (segments as any).includes('hirer')) ? 'hirer' : 'worker'
  
  // Default values for clean form state
  const defaultValues: Form = {
    name: '',
    phone: '',
    email: '',
    password: '',
    agree: false
  }

  const { control, setValue, handleSubmit, watch, setError, clearErrors, reset, formState: { errors, isValid, isSubmitting } } = useForm<Form>({ 
    resolver: zodResolver(Schema), 
    mode: 'onChange', 
    reValidateMode: 'onChange', 
    defaultValues 
  })

  const [showPassword, setShowPassword] = useState(false)
  const deviceRegion = (Localization.getLocales && Localization.getLocales()[0]?.regionCode) || 'US'
  const [countryCode, setCountryCode] = useState(deviceRegion as any)
  const [rawPhone, setRawPhone] = useState('')
  const [countryModal, setCountryModal] = useState(false)
  const [dialCode, setDialCode] = useState('+1')
  const current = { cca2: countryCode, callingCode: dialCode, name: '' }
  const flag = (code: string) => code.replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)))

  // Clear form on every focus/visit
  useFocusEffect(
    useCallback(() => {
      reset(defaultValues)
      setRawPhone('')
      setCountryCode(deviceRegion as any)
      setDialCode('+1')
      setServerError('')
      setShowPassword(false)
      setCountryModal(false)
    }, [reset, deviceRegion])
  )

  const [serverError, setServerError] = useState('')

  const onSubmit = async (data: Form) => {
    setServerError('')
    
    try {
      const { name, email, password } = data
      const e164Phone = toE164(rawPhone, current)
      
      if (!e164Phone) { 
        setError('phone', { type: 'validate', message: 'Invalid phone number format' })
        return
      }
      
      console.log('Attempting to sign up with:', { email, phone: e164Phone, role: roleFromRoute })
      
      const { data: sign, error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { 
            full_name: name, 
            phone_e164: e164Phone, 
            user_type: roleFromRoute // Changed from 'role' to 'user_type' to match schema
          } 
        }
      })
      
      if (error) {
        console.error('Supabase signup error:', error)
        setServerError(error.message)
        return
      }
      
      const userId = sign.user?.id
      if (userId) {
        console.log('Creating profile for user:', userId)
        const { error: profileError } = await supabase.from('profiles').upsert({ 
          id: userId, 
          user_type: roleFromRoute,
          full_name: name, 
          phone: e164Phone,
          email: email
        })
        
        if (profileError) {
          console.error('Profile creation error:', profileError)
          setServerError('Account created but profile setup failed. Please contact support.')
          return
        }
      }
      
      console.log('Signup successful, navigating to details')
      router.push(`/onboarding/${roleFromRoute}/details` as any)
      
    } catch (error) {
      console.error('Unexpected error during signup:', error)
      setServerError('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "",
          headerLeft: () => <BackButton tintColor="#FFFFFF" />,
        }}
      />
      <View style={{ flex:1, backgroundColor: '#0B0F1A' }}>
        <SafeAreaView edges={['top']}><View style={{ padding:16, paddingTop:60 }}><Text style={{ color:'#FFFFFF', fontSize:22, fontWeight:'700' }}>Create Account</Text><Text style={{ color:'#9CA3AF', marginTop:4 }}>Fill your information below</Text></View></SafeAreaView>
      {/** unified spacing */}
      <ScrollView contentContainerStyle={{ padding:20, gap:16, flexGrow: 1 }} keyboardShouldPersistTaps="handled" pointerEvents="box-none">
        <Text style={{ color:'#FFFFFF' }}>Name</Text>
        <Controller name="name" control={control} render={({ field: { onChange, onBlur, value } }) => (
          <TextInput 
            value={value as any} 
            onChangeText={onChange} 
            onBlur={onBlur} 
            placeholder="Enter your full name"
            placeholderTextColor="#9CA3AF" 
            autoComplete="off"
            textContentType="none"
            style={{ backgroundColor:'#1F2937', borderColor:'#334155', borderWidth:1, borderRadius:12, color:'#FFFFFF', paddingHorizontal:12, paddingVertical:12 }} 
          />
        )} />
        {!!errors.name && <Text style={{ color:'#F87171' }}>{errors.name.message as any}</Text>}
        <Text style={{ color:'#FFFFFF' }}>Phone Number</Text>
        <View style={{ backgroundColor:'#1F2937', borderColor:'#334155', borderWidth:1, borderRadius:12, paddingHorizontal:8, paddingVertical:6, position:'relative', zIndex:1000 }}>
          <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
            <TouchableOpacity onPress={() => setCountryModal(true)} style={{ flexDirection:'row', alignItems:'center', gap:6 }}>
              <Text style={{ color:'#FFFFFF' }}>{flag(countryCode)}</Text>
              <Text style={{ color:'#FFFFFF' }}>{dialCode}</Text>
            </TouchableOpacity>
            <Controller name="phone" control={control} render={({ field: { onChange, value } }) => (
              <TextInput 
                value={(value as any) || rawPhone} 
                onChangeText={(v)=>{ setRawPhone(v); onChange(v); const e164=toE164(v,current); if(!e164){ setError('phone',{ type:'validate', message:'Invalid phone' }); } else { clearErrors('phone'); } }} 
                keyboardType="phone-pad" 
                placeholder="555 123 4567" 
                placeholderTextColor="#9CA3AF" 
                autoComplete="off"
                textContentType="none"
                style={{ flex:1, color:'#FFFFFF', paddingHorizontal:8, paddingVertical:6, height:52 }} 
              />
            )} />
          </View>
        </View>
        {!!errors.phone && <Text style={{ color:'#F87171' }}>{errors.phone.message as any}</Text>}
        <Modal transparent animationType="fade" visible={Boolean(countryModal)} onRequestClose={() => setCountryModal(false)}>
          <Pressable onPress={() => setCountryModal(false)} style={{ flex:1, backgroundColor:'rgba(0,0,0,0.6)', justifyContent:'center', alignItems:'center' }}>
            <Pressable onPress={() => {}} style={{ width:'90%', maxHeight:'70%', backgroundColor:'#0B0F1A', borderRadius:16, borderWidth:1, borderColor:'#334155', padding:12, elevation:1001 }}>
              <CountryPicker
                withFilter
                withFlag
                withCallingCode
                withCountryNameButton
                onSelect={(c: Country) => { setCountryCode(c.cca2 as any); setDialCode('+' + (c.callingCode?.[0] || '1')); setCountryModal(false) }}
                countryCode={countryCode as any}
              />
            </Pressable>
          </Pressable>
        </Modal>

        <View style={{ zIndex:1 }}>
        <Text style={{ color:'#FFFFFF' }}>Email</Text>
        <Controller name="email" control={control} render={({ field: { onChange, onBlur, value } }) => (
          <TextInput 
            value={value as any} 
            onChangeText={onChange} 
            onBlur={onBlur} 
            keyboardType="email-address" 
            autoCapitalize="none" 
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF" 
            autoComplete="off"
            textContentType="none"
            style={{ backgroundColor:'#1F2937', borderColor:'#334155', borderWidth:1, borderRadius:12, color:'#FFFFFF', paddingHorizontal:16, height:52 }} 
          />
        )} />
        {!!errors.email && <Text style={{ color:'#F87171' }}>{errors.email.message as any}</Text>}
        <Text style={{ color:'#FFFFFF' }}>Password</Text>
        <Controller name="password" control={control} render={({ field: { onChange, onBlur, value } }) => (
          <TextInput 
            value={value as any} 
            onChangeText={onChange} 
            onBlur={onBlur} 
            secureTextEntry={!showPassword} 
            placeholder="Create a strong password"
            placeholderTextColor="#9CA3AF" 
            autoComplete="off"
            textContentType="none"
            style={{ backgroundColor:'#1F2937', borderColor:'#334155', borderWidth:1, borderRadius:12, color:'#FFFFFF', paddingHorizontal:16, height:52 }} 
          />
        )} />
        {!!errors.password && <Text style={{ color:'#F87171' }}>{errors.password.message as any}</Text>}
        <TouchableOpacity onPress={() => setShowPassword(s => !s)}><Text style={{ color:'#9CA3AF' }}>{showPassword ? 'Hide' : 'Show'} password</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setValue('agree', !watch('agree'), { shouldValidate: true })} style={{ flexDirection:'row', alignItems:'center', gap:8, marginTop:8 }}>
          <View style={{ width:20, height:20, borderRadius:4, borderWidth:1, borderColor:'#334155', backgroundColor: watch('agree') ? '#00E6CF' : 'transparent' }} />
          <Text style={{ color:'#FFFFFF' }}>Agree with <Text style={{ color:'#8B5CF6', textDecorationLine:'underline' }}>Terms & Conditions</Text></Text>
        </TouchableOpacity>
        </View>
        <View style={{ flex:1 }} />
      </ScrollView>
      <SafeAreaView edges={['bottom']} style={{ padding:16 }}>
        {serverError ? (
          <View style={{ backgroundColor:'#FEE2E2', borderRadius:8, padding:12, marginBottom:12 }}>
            <Text style={{ color:'#DC2626', fontSize:14 }}>{serverError}</Text>
          </View>
        ) : null}
        <TouchableOpacity 
          disabled={!isValid || !watch('agree') || isSubmitting} 
          onPress={handleSubmit(onSubmit)} 
          style={{ 
            height:56, 
            borderRadius:16, 
            alignItems:'center', 
            justifyContent:'center', 
            backgroundColor: (!isValid || !watch('agree') || isSubmitting) ? '#334155' : '#00E6CF',
            flexDirection: 'row'
          }}
          testID="sign-up-button"
        >
          {isSubmitting && (
            <View style={{ marginRight: 8 }}>
              <Text style={{ color: '#9CA3AF' }}>⏳</Text>
            </View>
          )}
          <Text style={{ color: (!isValid || !watch('agree') || isSubmitting) ? '#9CA3AF' : '#0B0F1A', fontWeight:'700' }}>
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>
        <View style={{ alignItems:'center', marginTop:12 }}>
          <Text style={{ color:'#9CA3AF' }}>Already have an account? <Text style={{ color:'#8B5CF6' }}>Sign In</Text></Text>
        </View>
      </SafeAreaView>
    </View>
    </>
  )
}


