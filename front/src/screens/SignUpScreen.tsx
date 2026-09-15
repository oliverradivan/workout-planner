import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Switch,
  ScrollView,
  Alert
} from 'react-native'
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { RootStackParamList } from '../App'

type SignUpRouteProp = RouteProp<RootStackParamList, 'SignUp'>
type SignUpNavProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>

declare const process: {
  env: Record<string, string | undefined>
}

export const SignUpScreen = () => {
  const route = useRoute<SignUpRouteProp>()
  const navigation = useNavigation<SignUpNavProp>()
  
  // Safe navigation fallback if route params are undefined
  const questionnaireData = route.params?.questionnaireData

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    agreeToTerms: false,
    agreeToPrivacy: false
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignUp = async () => {
    if (!formData.agreeToTerms || !formData.agreeToPrivacy) {
      setError('You must agree to the Terms of Service and Privacy Policy.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'

      const response = await fetch(`${apiUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          questionnaireData
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Sign up failed')
      }

      const data = await response.json()

      // Store tokens using AsyncStorage instead of localStorage
      await AsyncStorage.setItem('access_token', data.access_token)
      if (data.refresh_token) {
        await AsyncStorage.setItem('refresh_token', data.refresh_token)
      }

      navigation.replace('Home' as any)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        placeholder="Username (optional)"
        value={formData.username}
        onChangeText={(text) => setFormData({ ...formData, username: text })}
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        secureTextEntry
        style={styles.input}
      />

      <View style={styles.switchRow}>
        <Switch
          value={formData.agreeToTerms}
          onValueChange={(value) => setFormData({ ...formData, agreeToTerms: value })}
        />
        <Text style={styles.switchLabel}>I agree to the Terms of Service</Text>
      </View>

      <View style={styles.switchRow}>
        <Switch
          value={formData.agreeToPrivacy}
          onValueChange={(value) => setFormData({ ...formData, agreeToPrivacy: value })}
        />
        <Text style={styles.switchLabel}>I agree to the Privacy Policy</Text>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button
          title="Create Account"
          onPress={handleSignUp}
          disabled={!formData.email || !formData.password}
        />
      )}

      <Text style={styles.footer}>
        Already have an account? Log in coming soon.
      </Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  switchLabel: {
    marginLeft: 10,
    fontSize: 15,
    color: '#333'
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 14,
    color: '#666'
  }
})