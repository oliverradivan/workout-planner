import React from 'react'
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../App'

// Properly type navigation prop using NativeStackNavigationProp
type PrivacyScreenNavProp = NativeStackNavigationProp<RootStackParamList>

export const PrivacyPolicyScreen = () => {
  const navigation = useNavigation<PrivacyScreenNavProp>()

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Privacy Policy</Text>
      
      <Text style={styles.date}>Last updated: September 2026</Text>

      <Text style={styles.sectionHeader}>1. Overview</Text>
      <Text style={styles.paragraph}>
        This privacy policy describes how our workout planner app collects, uses, and protects your personal information.
      </Text>

      <Text style={styles.sectionHeader}>2. Information We Collect</Text>
      <Text style={styles.paragraph}>
        • Account information (email, password hash){'\n'}
        • Workout questionnaire data (goal, age, weight, gender, workout frequency, location, equipment){'\n'}
        • Workout plans and completion logs
      </Text>

      <Text style={styles.sectionHeader}>3. How We Use Your Information</Text>
      <Text style={styles.paragraph}>
        • To provide and personalize your workout plans{'\n'}
        • To authenticate and secure your account{'\n'}
        • To improve our services and develop new features
      </Text>

      <Text style={styles.sectionHeader}>4. Data Sharing</Text>
      <Text style={styles.paragraph}>
        We do not sell or share your personal information with third parties, except as necessary to provide our service (e.g., cloud hosting, authentication service).
      </Text>

      <Text style={styles.sectionHeader}>5. Your Rights</Text>
      <Text style={styles.paragraph}>
        You have the right to access, correct, or delete your personal information. You can request data export or account deletion through the app settings.
      </Text>

      <Text style={styles.sectionHeader}>6. Security</Text>
      <Text style={styles.paragraph}>
        We use industry-standard security measures to protect your data, including encryption in transit and at rest.
      </Text>

      <Text style={styles.sectionHeader}>7. Changes to This Policy</Text>
      <Text style={styles.paragraph}>
        We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
      </Text>

      <Text style={styles.sectionHeader}>8. Contact Us</Text>
      <Text style={styles.paragraph}>
        If you have any questions about this privacy policy, please contact us at support@example.com.
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