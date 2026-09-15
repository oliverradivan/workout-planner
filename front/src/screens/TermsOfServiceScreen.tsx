import React from 'react'
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../App'

type TermsScreenNavProp = NativeStackNavigationProp<RootStackParamList>

export const TermsOfServiceScreen = () => {
  const navigation = useNavigation<TermsScreenNavProp>()

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Terms of Service</Text>
      <Text style={styles.date}>Last updated: September 2026</Text>

      <Text style={styles.paragraph}>
        Please read these terms of service carefully before using our workout planner app.
      </Text>

      <Text style={styles.sectionHeader}>1. Acceptance of Terms</Text>
      <Text style={styles.paragraph}>
        By accessing or using the app, you agree to be bound by these terms. If you disagree with any part of the terms, you may not use the app.
      </Text>

      <Text style={styles.sectionHeader}>2. Description of Service</Text>
      <Text style={styles.paragraph}>
        The app provides personalized workout generation, tracking, and fitness planning services.
      </Text>

      <Text style={styles.sectionHeader}>3. User Accounts</Text>
      <Text style={styles.paragraph}>
        You must create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials.
      </Text>

      <Text style={styles.sectionHeader}>4. User Content</Text>
      <Text style={styles.paragraph}>
        You retain ownership of any data you submit to the app. You grant us a license to use, store, and process your data to provide the service.
      </Text>

      <Text style={styles.sectionHeader}>5. Prohibited Uses</Text>
      <Text style={styles.paragraph}>
        You may not use the app for any unlawful purpose or in any way that could damage, disable, overburden, or impair the service.
      </Text>

      <Text style={styles.sectionHeader}>6. Disclaimer of Warranties</Text>
      <Text style={styles.paragraph}>
        The app is provided on an "as is" and "as available" basis. We do not warrant that the app will be uninterrupted or error-free.
      </Text>

      <Text style={styles.sectionHeader}>7. Limitation of Liability</Text>
      <Text style={styles.paragraph}>
        To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
      </Text>

      <Text style={styles.sectionHeader}>8. Indemnification</Text>
      <Text style={styles.paragraph}>
        You agree to indemnify and hold harmless the app and its affiliates from any claims arising from your use of the app.
      </Text>

      <Text style={styles.sectionHeader}>9. Governing Law</Text>
      <Text style={styles.paragraph}>
        These terms shall be governed by and construed in accordance with local laws, without regard to conflict of law principles.
      </Text>

      <Text style={styles.sectionHeader}>10. Changes to Terms</Text>
      <Text style={styles.paragraph}>
        We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new terms on this page.
      </Text>

      <Text style={styles.sectionHeader}>Contact Us</Text>
      <Text style={styles.paragraph}>
        If you have any questions about these terms, please contact us at support@example.com.
      </Text>

      <View style={styles.buttonWrapper}>
        <Button title="Back" onPress={() => navigation.goBack()} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  date: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
    color: '#111',
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
    marginBottom: 12,
  },
  buttonWrapper: {
    marginTop: 20,
  },
})