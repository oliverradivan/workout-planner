import React from 'react'
import { View, Text, StyleSheet, Button } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '../App'

export const PrivacyPolicyScreen = () => {
  const navigation = useNavigation<RootStackParamList>()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.content}>
        Last updated: [Date]\n\n
        This privacy policy describes how our workout planner app collects, uses, and protects your personal information.\n\n
        Information We Collect:\n
        - Account information (email, password hash)\n
        - Workout questionnaire data (goal, age, weight, gender, workout frequency, location, equipment)\n
        - Workout plans and completion logs\n\n
        How We Use Your Information:\n
        - To provide and personalize your workout plans\n
        - To authenticate and secure your account\n
        - To improve our services and develop new features\n\n
        Data Sharing:\n
        We do not sell or share your personal information with third parties, except as necessary to provide our service\n
        (e.g., cloud hosting, authentication service).\n\n
        Your Rights:\n
        You have the right to access, correct, or delete your personal information. You can request data export or account deletion\n
        through the app settings.\n\n
        Security:\n
        We use industry-standard security measures to protect your data, including encryption in transit and at rest.\n\n
        Changes to This Policy:\n
        We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.\n\n
        Contact Us:\n
        If you have any questions about this privacy policy, please contact us at [email address].
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