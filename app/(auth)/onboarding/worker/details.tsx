import React, { useEffect, useState, useCallback } from 'react'
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  Animated,
  Keyboard,
  Dimensions
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter, Stack } from 'expo-router'
import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../../../../src/lib/supabase'
import { Ionicons } from '@expo/vector-icons'
import * as Location from 'expo-location'
import * as Haptics from 'expo-haptics'
import { BackButton } from '../../../../src/components/ui/BackButton'

const CANADIAN_PROVINCES = [
  { label: 'Alberta', value: 'AB' },
  { label: 'British Columbia', value: 'BC' },
  { label: 'Manitoba', value: 'MB' },
  { label: 'New Brunswick', value: 'NB' },
  { label: 'Newfoundland and Labrador', value: 'NL' },
  { label: 'Nova Scotia', value: 'NS' },
  { label: 'Northwest Territories', value: 'NT' },
  { label: 'Nunavut', value: 'NU' },
  { label: 'Ontario', value: 'ON' },
  { label: 'Prince Edward Island', value: 'PE' },
  { label: 'Quebec', value: 'QC' },
  { label: 'Saskatchewan', value: 'SK' },
  { label: 'Yukon', value: 'YT' },
]

const Schema = z.object({
  address1: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(2, 'Province is required'),
  postal_code: z.string().regex(/^[A-Za-z]\d[A-Za-z][ ]?\d[A-Za-z]\d$/, 'Invalid postal code format'),
  bio: z.string().min(40, 'Bio must be at least 40 characters'),
})
type Form = z.infer<typeof Schema>

const FloatingLabelInput = ({ 
  label, 
  icon, 
  value, 
  onChangeText, 
  error, 
  multiline = false, 
  autoCapitalize = 'sentences',
  placeholder,
  onFocus,
  onBlur,
  ...props 
}: any) => {
  const [isFocused, setIsFocused] = useState(false)
  const labelAnimation = new Animated.Value(value ? 1 : 0)

  useEffect(() => {
    Animated.timing(labelAnimation, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }, [isFocused, value])

  const handleFocus = () => {
    setIsFocused(true)
    onFocus?.()
  }

  const handleBlur = () => {
    setIsFocused(false)
    onBlur?.()
  }

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: error ? '#F87171' : isFocused ? '#00E6CF' : 'rgba(255,255,255,0.12)',
        height: multiline ? 120 : 52,
        flexDirection: 'row',
        alignItems: multiline ? 'flex-start' : 'center',
        paddingHorizontal: 16,
        paddingVertical: multiline ? 16 : 0,
      }}>
        <Ionicons 
          name={icon} 
          size={20} 
          color={error ? '#F87171' : isFocused ? '#00E6CF' : 'rgba(255,255,255,0.6)'} 
          style={{ marginRight: 12, marginTop: multiline ? 2 : 0 }}
        />
        <View style={{ flex: 1 }}>
          <Animated.Text style={{
            position: 'absolute',
            left: 0,
            top: labelAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [multiline ? 2 : 14, -8],
            }),
            fontSize: labelAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [16, 12],
            }),
            color: error ? '#F87171' : isFocused ? '#00E6CF' : 'rgba(255,255,255,0.7)',
            backgroundColor: '#0B0F1A',
            paddingHorizontal: 4,
            zIndex: 1,
          }}>
            {label}
          </Animated.Text>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={isFocused ? placeholder : ''}
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={{
              color: 'rgba(255,255,255,0.92)',
              fontSize: 16,
              paddingTop: multiline ? 20 : 16,
              paddingBottom: multiline ? 0 : 0,
              minHeight: multiline ? 80 : undefined,
              textAlignVertical: multiline ? 'top' : 'center',
            }}
            multiline={multiline}
            autoCapitalize={autoCapitalize}
            {...props}
          />
        </View>
      </View>
      {error && (
        <Text style={{ 
          color: '#F87171', 
          fontSize: 12, 
          marginTop: -12, 
          marginBottom: 12, 
          marginLeft: 4 
        }}>
          {error}
        </Text>
      )}
    </View>
  )
}

const ProvinceDropdown = ({ value, onSelect, error }: any) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  
  const filteredProvinces = CANADIAN_PROVINCES.filter(p =>
    String(p.label||'').toLowerCase().includes(String(searchText||'').toLowerCase()) ||
    String(p.value||'').toLowerCase().includes(String(searchText||'').toLowerCase())
  )

  const selectedProvince = CANADIAN_PROVINCES.find(p => p.value === value)

  return (
    <View style={{ marginBottom: 16 }}>
      <TouchableOpacity 
        onPress={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: error ? '#F87171' : isOpen ? '#00E6CF' : 'rgba(255,255,255,0.12)',
          height: 52,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
        }}
      >
        <Ionicons name="business-outline" size={20} color={error ? '#F87171' : isOpen ? '#00E6CF' : 'rgba(255,255,255,0.6)'} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={{
            position: 'absolute',
            top: -8,
            left: 0,
            fontSize: 12,
            color: error ? '#F87171' : isOpen ? '#00E6CF' : 'rgba(255,255,255,0.7)',
            backgroundColor: '#0B0F1A',
            paddingHorizontal: 4,
            zIndex: 1,
          }}>
            Province
          </Text>
          <Text style={{
            color: selectedProvince ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.4)',
            fontSize: 16,
            paddingTop: 8,
          }}>
            {selectedProvince?.label || 'Select Province'}
          </Text>
        </View>
        <Ionicons 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="rgba(255,255,255,0.6)" 
        />
      </TouchableOpacity>
      
      {isOpen && (
        <View style={{
          position: 'absolute',
          top: 56,
          left: 0,
          right: 0,
          backgroundColor: '#1F2937',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.12)',
          maxHeight: 200,
          zIndex: 1000,
        }}>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search provinces..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={{
              color: 'rgba(255,255,255,0.92)',
              fontSize: 16,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255,255,255,0.12)',
            }}
          />
          <ScrollView style={{ maxHeight: 150 }}>
            {filteredProvinces.map(province => (
              <TouchableOpacity
                key={province.value}
                onPress={() => {
                  onSelect(province.value)
                  setIsOpen(false)
                  setSearchText('')
                }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(255,255,255,0.06)',
                }}
              >
                <Text style={{ color: 'rgba(255,255,255,0.92)', fontSize: 16 }}>
                  {province.label} ({province.value})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {error && (
        <Text style={{ 
          color: '#F87171', 
          fontSize: 12, 
          marginTop: 4, 
          marginLeft: 4 
        }}>
          {error}
        </Text>
      )}
    </View>
  )
}

export default function WorkerDetails() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bioLength, setBioLength] = useState(0)
  
  const { control, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<Form>({ 
    resolver: zodResolver(Schema), 
    mode: 'onChange',
    defaultValues: {
      address1: '',
      city: '',
      province: '',
      postal_code: '',
      bio: '',
    }
  })

  const watchedValues = watch()

  // Auto-save draft with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      AsyncStorage.setItem('onboarding_worker_details', JSON.stringify(watchedValues))
    }, 400)
    return () => clearTimeout(timer)
  }, [watchedValues])

  // Load draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await AsyncStorage.getItem('onboarding_worker_details')
        if (draft) {
          const data = JSON.parse(draft)
          Object.keys(data).forEach(key => {
            if (data[key]) {
              setValue(key as keyof Form, data[key], { shouldValidate: true })
            }
          })
        }
      } catch (error) {
        console.log('Error loading draft:', error)
      }
    }
    loadDraft()
  }, [setValue])

  // Format postal code
  const formatPostalCode = (text: string) => {
    const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    if (cleaned.length <= 3) return cleaned
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)}`
  }

  // Use current location
  const useCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location permission is required to use this feature.')
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })

      if (address) {
        setValue('address1', `${address.streetNumber || ''} ${address.street || ''}`.trim(), { shouldValidate: true })
        setValue('city', address.city || '', { shouldValidate: true })
        setValue('postal_code', address.postalCode || '', { shouldValidate: true })
        
        // Find province by region
        const province = CANADIAN_PROVINCES.find(p => 
          p.label.toLowerCase().includes(address.region?.toLowerCase() || '')
        )
        if (province) {
          setValue('province', province.value, { shouldValidate: true })
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        Alert.alert('Success', 'Address filled from your location!')
      }
    } catch (error) {
      Alert.alert('Error', 'Could not get your location. Please try again.')
    }
  }

  const onNext = async (data: Form) => {
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Geocode the address for lat/lng
      let lat = null, lng = null
      try {
        const fullAddress = `${data.address1}, ${data.city}, ${data.province}, Canada, ${data.postal_code}`
        const geocoded = await Location.geocodeAsync(fullAddress)
        if (geocoded.length > 0) {
          lat = geocoded[0].latitude
          lng = geocoded[0].longitude
        }
      } catch (geocodeError) {
        console.log('Geocoding failed:', geocodeError)
      }

      await supabase.from('profiles').update({ 
        address1: data.address1,
        city: data.city, 
        province: data.province, 
        postal_code: data.postal_code, 
        bio: data.bio,
        ...(lat && lng && { geo: { lat, lng } })
      }).eq('id', user.id)

      Haptics.selectionAsync()
      router.push('/onboarding/worker/professional')
    } catch (error) {
      Alert.alert('Error', 'Failed to save details. Please try again.')
    } finally {
      setIsSubmitting(false)
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
      <View style={{ flex: 1, backgroundColor: '#0B0F1A' }}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: '#0B0F1A' }}>
          <View style={{ paddingHorizontal: 20, paddingVertical: 16, paddingTop: 60 }}>
          <Text style={{ 
            color: '#FFFFFF', 
            fontSize: 28, 
            fontWeight: '700', 
            marginBottom: 4 
          }}>
            Details
          </Text>
          <Text style={{ 
            color: '#9CA3AF', 
            fontSize: 16, 
            marginBottom: 16 
          }}>
            Step 2 of 5
          </Text>
          
          {/* Progress Bar */}
          <View style={{
            height: 4,
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <View style={{
              width: '40%',
              height: '100%',
              backgroundColor: '#00E6CF',
              borderRadius: 2,
            }} />
          </View>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={{ 
            padding: 20, 
            gap: 16,
            paddingBottom: 120 
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Address Section */}
          <View>
            <Text style={{ 
              color: '#FFFFFF', 
              fontSize: 18, 
              fontWeight: '600', 
              marginBottom: 16 
            }}>
              Address
            </Text>
            
            <Controller
              control={control}
              name="address1"
              render={({ field: { onChange, onBlur, value } }) => (
                <FloatingLabelInput
                  label="Street Address"
                  icon="location-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.address1?.message}
                  placeholder="123 Main Street"
                  autoCapitalize="words"
                />
              )}
            />

            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, onBlur, value } }) => (
                <FloatingLabelInput
                  label="City"
                  icon="business-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.city?.message}
                  placeholder="Toronto"
                  autoCapitalize="words"
                />
              )}
            />

            <Controller
              control={control}
              name="province"
              render={({ field: { onChange, value } }) => (
                <ProvinceDropdown
                  value={value}
                  onSelect={onChange}
                  error={errors.province?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="postal_code"
              render={({ field: { onChange, onBlur, value } }) => (
                <FloatingLabelInput
                  label="Postal Code"
                  icon="mail-outline"
                  value={value}
                  onChangeText={(text: string) => onChange(formatPostalCode(text))}
                  onBlur={onBlur}
                  error={errors.postal_code?.message}
                  placeholder="A1A 1A1"
                  autoCapitalize="characters"
                  maxLength={7}
                />
              )}
            />

            <TouchableOpacity
              onPress={useCurrentLocation}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 230, 207, 0.1)',
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: 'rgba(0, 230, 207, 0.3)',
                marginBottom: 24,
              }}
            >
              <Ionicons name="location" size={20} color="#00E6CF" style={{ marginRight: 8 }} />
              <Text style={{ color: '#00E6CF', fontSize: 16, fontWeight: '600' }}>
                Use my location
              </Text>
            </TouchableOpacity>
          </View>

          {/* About Section */}
          <View>
            <Text style={{ 
              color: '#FFFFFF', 
              fontSize: 18, 
              fontWeight: '600', 
              marginBottom: 16 
            }}>
              About
            </Text>
            
            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <FloatingLabelInput
                    label="Bio"
                    icon="create-outline"
                    value={value}
                    onChangeText={(text: string) => {
                      onChange(text)
                      setBioLength(text.length)
                    }}
                    onBlur={onBlur}
                    error={errors.bio?.message}
                    placeholder="Tell clients about your experience, tools, and availability"
                    multiline={true}
                    autoCapitalize="sentences"
                  />
                  <Text style={{
                    color: bioLength >= 40 ? '#00E6CF' : '#9CA3AF',
                    fontSize: 12,
                    textAlign: 'right',
                    marginTop: -12,
                    marginBottom: 12,
                  }}>
                    {bioLength}/40 minimum
                  </Text>
                </View>
              )}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky CTA */}
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#0B0F1A' }}>
        <View style={{
          paddingHorizontal: 20,
          paddingTop: 16,
          backgroundColor: '#0B0F1A',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        }}>
          <TouchableOpacity
            disabled={!isValid || isSubmitting}
            onPress={handleSubmit(onNext)}
            style={{
              height: 52,
              borderRadius: 14,
              background: isValid && !isSubmitting ? 'linear-gradient(135deg, #1F2937 0%, #00E6CF 100%)' : undefined,
              backgroundColor: isValid && !isSubmitting ? '#00E6CF' : '#334155',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: isValid ? '#00E6CF' : 'transparent',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text style={{ 
              color: isValid && !isSubmitting ? '#0B0F1A' : '#9CA3AF', 
              fontWeight: '700', 
              fontSize: 16 
            }}>
              {isSubmitting ? 'Saving...' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
    </>
  )
}


