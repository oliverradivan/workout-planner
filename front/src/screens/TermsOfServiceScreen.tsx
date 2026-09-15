import React from 'react'
import { View, Text, StyleSheet, Button } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '../App'

export const TermsOfServiceScreen = () => {
  const navigation = useNavigation<RootStackParamList>()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Terms of Service</Text>
      <Text style={styles.content}>
        Last updated: [Date]\n\n
        Please read these terms of service carefully before using our workout planner app.\n\n
        1. Acceptance of Terms\n
        By accessing or using the app, you agree to be bound by these terms. If you disagree with any part of the terms, you may not use the app.\n\n
        2. Description of Service\n
        The app provides personalized workout generation, tracking, and fitness planning services.\n\n
        3. User Accounts\n
        You must create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials.\n\n
        4. User Content\n
        You retain ownership of any data you submit to the app. You grant us a license to use, store, and process your data to provide the service.\n\n
        5. Prohibited Uses\n
        You may not use the app for any unlawful purpose or in any way that could damage, disable, overburden, or impair the service.\n\n
        6. Disclaimer of Warranties\n
        The app is provided on an \"as is\" and \"as available\" basis. We do not warrant that the app will be uninterrupted or error-free.\n\n
        7. Limitation of Liability\n
        To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages.\n\n
        8. Indemnification\n
        You agree to indemnify and hold harmless the app and its affiliates from any claims arising from your use of the app.\n\n
        9. Governing Law\n
        These terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law principles.\n\n
        10. Changes to Terms\n
        We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new terms on this page.\n\n
        Contact Us:\n
        If you have any questions about these terms, please contact us at [email address].
      </Text>
      <Button title="Back to Settings" onPress={() => navigation.goBack()} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  }
})