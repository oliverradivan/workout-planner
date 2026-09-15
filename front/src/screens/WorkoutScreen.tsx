import React, { useState } from 'react'
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'

export const WorkoutScreen = () => {
  const route = useRoute<{ date: string }>()
  const navigation = useNavigation()
  const { date } = route.params

  const [workout, setWorkout] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // In a real app, we would fetch the workout for the given date from backend
  React.useEffect(() => {
    // Simulate
    setTimeout(() => {
      setWorkout({
        day: 3,
        date: date,
        workoutName: 'Lower Body B',
        exercises: [
          { name: 'Squats', sets: 4, reps: '8-10' },
          { name: 'Deadlifts', sets: 3, reps: '6-8' },
          { name: 'Leg Press', sets: 3, reps: '10-12' },
          { name: 'Leg Curls', sets: 3, reps: '12-15' },
          { name: 'Calf Raises', sets: 4, reps: '15-20' }
        ]
      })
      setLoading(false)
    }, 1000)
  }, [date])

  const handleMarkComplete = () => {
    // Call backend to mark as complete
    alert('Workout marked as complete!')
    navigation.goBack()
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.margin}>Loading workout...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
        <Button title="Retry" onPress={() => { /* refetch */ }} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout for {workout?.date}</Text>
      <Text style={styles.subtitle}>{workout?.workoutName}</Text>
      
      <View style={styles.workoutCard}>
        {workout?.exercises.map((ex: any, index: number) => (
          <View key={index} style={styles.exercise}>
            <Text style={styles.exerciseName}>{ex.name}</Text>
            <Text style={styles.exerciseDetails}>
              {ex.sets} sets × {ex.reps} reps
            </Text>
          </View>
        ))}
      </View>
      
      <Button title="Mark as Complete" onPress={handleMarkComplete} />
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
  },
  workoutCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exercise: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#666',
  },
  margin: {
    marginTop: 12,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  }
})