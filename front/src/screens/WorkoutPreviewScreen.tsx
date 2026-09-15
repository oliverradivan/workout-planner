import React from 'react'
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'

export const WorkoutPreviewScreen = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { questionnaireData } = route.params as { questionnaireData: any }

  // In a real app, we would call the backend to generate a preview
  // For now, we'll show a placeholder
  const [preview, setPreview] = React.useState(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPreview({
        day: 1,
        workoutName: 'Full Body Beginner',
        exercises: [
          { name: 'Push-ups', sets: 3, reps: '10-15' },
          { name: 'Squats', sets: 3, reps: '12-20' },
          { name: 'Plank', sets: 3, reps: '30-60s' }
        ]
      })
      setLoading(false)
    }, 1000)
  }, [])

  const handleSignUp = () => {
    navigation.navigate('SignUp', { questionnaireData })
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.margin}>Generating your workout preview...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Workout Preview</Text>
      <Text style={styles.subtitle}>Day 1: {preview?.workoutName}</Text>
      
      {preview?.exercises.map((ex: any, index: number) => (
        <View key={index} style={styles.exercise}>
          <Text style={styles.exerciseName}>{ex.name}</Text>
          <Text style={styles.exerciseDetails}>
            {ex.sets} sets × {ex.reps} reps
          </Text>
        </View>
      ))}
      
      <Button title="Save Your Plan (Sign Up)" onPress={handleSignUp} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
  },
  exercise: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginVertical: 8,
    width: '100%',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#666',
  },
  margin: {
    marginTop: 12,
  },
})