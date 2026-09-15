import React, { useState } from 'react'
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, CheckBox, Switch } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'

export const SignUpScreen = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { questionnaireData } = route.params as { questionnaireData: any }

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
    setLoading(true)
    setError(null)
    try {
      // In a real app, we would call our backend API
      // For now, we'll simulate
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          questionnaireData
        })
      })

      if (!response.ok) {
        throw new Error('Sign up failed')
      }

      const data = await response.json()
      // Assume we get a token back
      // Store token securely (e.g., in SecureStore)
      // For now, we'll just navigate to home
      navigation.replace('Home')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      <TextInput
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        autoCapitalize="none"
        style={styles.input}
      />
      
      <TextInput
        placeholder="Username (optional)"
        value={formData.username}
        onChangeText={(text) => setFormData({ ...formData, username: text })}
        style={styles.input}
      />
      
      <TextInput
        placeholder="Password"
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        secureTextEntry
        style={styles.input}
      />
      
      <View style={styles.checkboxRow}>
        <CheckBox
          value={formData.agreeToTerms}
          onValueChange={(value) => setFormData({ ...formData, agreeToTerms: value })}
        />
        <Text style={styles.checkboxLabel}>
          I agree to the Terms of Service
        </Text>
      </View>
      
      <View style={styles.checkboxRow}>
        <CheckBox
          value={formData.agreeToPrivacy}
          onValueChange={(value) => setFormData({ ...formData, agreeToPrivacy: value })}
        />
        <Text style={styles.checkboxLabel}>
          I agree to the Privacy Policy
        </Text>
      </View>
      
      {error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}
      
      <Button
        title={loading ? 'Creating Account...' : 'Create Account'}
        onPress={handleSignUp}
        disabled={loading}
      />
      
      <Text style={styles.footer}>
        Already have an account?{' '}
        {/* We don't have a login screen yet, but we could navigate to one */}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  }
})