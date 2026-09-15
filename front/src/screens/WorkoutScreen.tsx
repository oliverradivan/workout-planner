import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Button, ActivityIndicator, FlatList } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '../App'

export const WorkoutScreen = () => {
  const route = useRoute<RootStackParamList>()
  const navigation = useNavigation<RootStackParamList>()
  const { date } = route.params

  const [workout, setWorkout] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const planId = localStorage.getItem('workout_plan_id')
        if (!planId) {
          throw new Error('No workout plan found. Please generate a plan first.')
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/workouts/by-date?plan_id=${planId}&date=${date}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        })

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Workout not found for the selected date')
          } else {
            throw new Error('Failed to fetch workout')
          }
        }

        const data = await response.json()
        setWorkout(data)
      } catch (err: any) {
        setError(err.message || 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkout()
  }, [date])

  const handleMarkComplete = async () => {
    if (!workout) return

    try {
      const planId = localStorage.getItem('workout_plan_id')
      if (!planId) {
        throw new Error('No workout plan found')
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/workouts/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          workout_plan_id: parseInt(planId),
          day_date: workout.date,
          completed: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to mark workout as complete')
      }

      alert('Workout marked as complete!')
      navigation.goBack()
    } catch (err: any) {
      alert(err.message || 'Failed to mark workout as complete')
    }
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
      <Text style={styles.subtitle}>{workout?.workout_name}</Text>
      
      <View style={styles.workoutCard}>
        <FlatList
          data={workout?.exercises || []}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.exercise}>
              <Text style={styles.exerciseName}>{item.name}</Text>
              <Text style={styles.exerciseDetails}>
                {item.sets} sets × {item.reps} reps
              </Text>
            </View>
          )}
        />
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