import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, Stack, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { BackButton } from '../../src/components/ui/BackButton'
import { useFocusEffect } from '@react-navigation/native'
import { supabase } from '../../src/lib/supabase'
import { signInWithGoogle } from '../../src/lib/auth/google'
import { signInWithFacebook } from '../../src/lib/auth/facebook'

// Debug function to check table structure
const debugTableStructure = async () => {
  try {
    // First test basic connection
    console.log('🔍 Testing Supabase connection...')
    console.log('🔍 Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
    console.log('🔍 Supabase Key:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing')
    
    // Test basic auth connection
    const { data: authTest, error: authError } = await supabase.auth.getSession()
    console.log('🔍 Auth connection test:', { authTest: !!authTest, authError })
    
    // Try to get one row to see the structure
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    console.log('🔍 Profiles table structure test:', { data, error })
    
    // Also check if we can insert with minimal data
    const testId = 'test-' + Date.now()
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .insert([{ id: testId, email: 'test@example.com', user_type: 'worker' }])
      .select()
    
    console.log('🔍 Test insert result:', { testData, testError })
    
    // Clean up test data
    if (!testError) {
      await supabase.from('profiles').delete().eq('id', testId)
      console.log('🔍 Test data cleaned up')
    }
  } catch (err) {
    console.error('🔴 Debug table structure error:', err)
  }
}

// Test RLS (Row Level Security) policies
const testRLSPolicies = async () => {
  try {
    console.log('🔍 Testing RLS policies...')
    
    // Test if we can read profiles as anonymous user
    const { data: readTest, error: readError } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(1)
    
    console.log('🔍 RLS read test:', { readTest: !!readTest, readError })
    
    // Test if we can insert as anonymous user (should fail with RLS)
    const testId = 'rls-test-' + Date.now()
    const { data: insertTest, error: insertError } = await supabase
      .from('profiles')
      .insert([{ id: testId, email: 'rls-test@example.com', user_type: 'worker' }])
      .select()
    
    console.log('🔍 RLS insert test:', { insertTest: !!insertTest, insertError })
    
    // Clean up if somehow succeeded
    if (!insertError) {
      await supabase.from('profiles').delete().eq('id', testId)
    }
  } catch (err) {
    console.error('🔴 RLS test error:', err)
  }
}

export default function CreateAccountScreen() {
  const router = useRouter()
  const { role } = useLocalSearchParams<{ role: 'worker' | 'hirer' }>()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  // Clear form on focus
  useFocusEffect(
    useCallback(() => {
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
      })
      setShowPassword(false)
      setShowConfirmPassword(false)
      setAgreeToTerms(false)
      setErrors({})
    }, [])
  )

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase and number'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the Terms & Conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignUp = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      return
    }

    setIsLoading(true)
    try {
      // Debug table structure first
      await debugTableStructure()
      await testRLSPolicies()
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            phone: formData.phoneNumber.trim(),
            user_type: role || 'worker'
          }
        }
      })

      if (authError) {
        console.error('Auth signup error:', authError)
        console.error('Auth error details:', JSON.stringify(authError, null, 2))
        throw authError
      }

      console.log('Auth user created successfully:', authData.user?.id)

      if (authData.user) {
        // Create profile with minimal required fields
        // Try different field names to match actual database schema
        const profileData = {
          id: authData.user.id,
          email: formData.email.trim().toLowerCase(),
          user_type: role || 'worker'
        }

        // Try both 'name' and 'full_name' field names
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([
            {
              ...profileData,
              name: formData.fullName.trim(),
              full_name: formData.fullName.trim(),
              phone: formData.phoneNumber.trim(),
              phone_number: formData.phoneNumber.trim()
            }
          ], {
            onConflict: 'id'
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          console.error('Profile error details:', JSON.stringify(profileError, null, 2))
          
          // Try alternative approach - insert with just required fields
          const { error: fallbackError } = await supabase
            .from('profiles')
            .upsert([
              {
                id: authData.user.id,
                email: formData.email.trim().toLowerCase(),
                user_type: role || 'worker'
              }
            ], {
              onConflict: 'id'
            })
          
          if (fallbackError) {
            console.error('Fallback profile creation error:', fallbackError)
          }
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      
      // Check if email confirmation is required
      if (authData.user && !authData.user.email_confirmed_at) {
        Alert.alert(
          'Account Created!',
          'Please check your email to verify your account before signing in.',
          [
            {
              text: 'OK',
              onPress: () => router.push('/(auth)/sign-in')
            }
          ]
        )
      } else {
        // If no email confirmation needed, try to sign in automatically
        try {
          console.log('Attempting automatic sign in...')
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
          })
          
          if (signInError) {
            console.error('Auto sign-in failed:', signInError)
            Alert.alert(
              'Account Created Successfully!',
              'Please sign in with your new credentials.',
              [
                {
                  text: 'Sign In',
                  onPress: () => router.push('/(auth)/sign-in')
                }
              ]
            )
          } else {
            console.log('Auto sign-in successful!')
            Alert.alert(
              'Account Created Successfully!',
              'Welcome to EZ Clear!',
              [
                {
                  text: 'Get Started',
                  onPress: () => router.replace('/(tabs)/home')
                }
              ]
            )
          }
        } catch (autoSignInError) {
          console.error('Auto sign-in error:', autoSignInError)
          Alert.alert(
            'Account Created Successfully!',
            'Please sign in with your new credentials.',
            [
              {
                text: 'Sign In',
                onPress: () => router.push('/(auth)/sign-in')
              }
            ]
          )
        }
      }
    } catch (error: any) {
      console.error('Sign up error:', error)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert('Sign Up Failed', error.message || 'Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }



  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
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
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Fill your information below</Text>
            </View>

            {/* Social Sign Up Buttons */}
            <View style={styles.socialContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={async () => {
                  try {
                    await signInWithGoogle(role as 'worker' | 'hirer');
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    router.replace('/(tabs)/home');
                  } catch (error: any) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    Alert.alert('Google Sign Up Failed', error.message || 'Please try again.');
                  }
                }}
              >
                <Ionicons name="logo-google" size={20} color="#E6E8EC" />
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={async () => {
                  try {
                    await signInWithFacebook(role as 'worker' | 'hirer');
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    router.replace('/(tabs)/home');
                  } catch (error: any) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    Alert.alert('Facebook Sign Up Failed', error.message || 'Please try again.');
                  }
                }}
              >
                <Ionicons name="logo-facebook" size={20} color="#E6E8EC" />
                <Text style={styles.socialButtonText}>Continue with Facebook</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR SIGN UP WITH EMAIL</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Full Name */}
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, errors.fullName && styles.inputError]}>
                  <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#6B7280"
                    value={formData.fullName}
                    onChangeText={(text) => updateFormData('fullName', text)}
                    autoCapitalize="words"
                    autoComplete="off"
                    textContentType="none"
                  />
                </View>
                {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                  <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#6B7280"
                    value={formData.email}
                    onChangeText={(text) => updateFormData('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="off"
                    textContentType="none"
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* Phone Number */}
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, errors.phoneNumber && styles.inputError]}>
                  <Ionicons name="call-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    placeholderTextColor="#6B7280"
                    value={formData.phoneNumber}
                    onChangeText={(text) => updateFormData('phoneNumber', text)}
                    keyboardType="phone-pad"
                    autoComplete="off"
                    textContentType="none"
                  />
                </View>
                {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#6B7280"
                    value={formData.password}
                    onChangeText={(text) => updateFormData('password', text)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="off"
                    textContentType="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#6B7280"
                    value={formData.confirmPassword}
                    onChangeText={(text) => updateFormData('confirmPassword', text)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoComplete="off"
                    textContentType="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.passwordToggle}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>

              {/* Terms & Conditions */}
              <View style={styles.termsContainer}>
                <TouchableOpacity
                  onPress={() => setAgreeToTerms(!agreeToTerms)}
                  style={styles.checkboxContainer}
                >
                  <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                    {agreeToTerms && (
                      <Ionicons name="checkmark" size={14} color="#0B0E14" />
                    )}
                  </View>
                  <Text style={styles.termsText}>
                    Agree with{' '}
                    <Text style={styles.termsLink}>Terms & Conditions</Text>
                  </Text>
                </TouchableOpacity>
                {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
                onPress={handleSignUp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.signUpButtonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>



              {/* Sign In Link */}
              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>
                  Already have account?{' '}
                  <Text 
                    style={styles.signInLink}
                    onPress={() => router.push('/(auth)/sign-in')}
                  >
                    Sign In
                  </Text>
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0E14',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80, // Account for transparent header
    paddingBottom: 32,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  socialContainer: {
    gap: 12,
    marginBottom: 20,
  },
  socialButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#1E212A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  socialButtonText: {
    color: '#E6E8EC',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2A2F3A',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9AA0A6',
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '500',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    height: 56,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  passwordToggle: {
    padding: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  termsContainer: {
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#00E6D3',
    borderColor: '#00E6D3',
  },
  termsText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  termsLink: {
    color: '#00E6D3',
    textDecorationLine: 'underline',
  },
  signUpButton: {
    backgroundColor: '#00E6D3',
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#00E6D3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },


  signInContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  signInText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  signInLink: {
    color: '#00E6D3',
    fontWeight: '600',
  },
})
