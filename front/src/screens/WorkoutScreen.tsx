import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native'
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { RootStackParamList } from '../App'

type WorkoutRouteProp = RouteProp<RootStackParamList, 'Workout'>
type WorkoutNavProp = NativeStackNavigationProp<RootStackParamList, 'Workout'>

declare const process: {
  env: Record<string, string | undefined>
}

interface Exercise {
  name: string
  sets: number
  reps: number
}

interface WorkoutDetails {
  date: string
  workout_name: string
  exercises: Exercise[]
  completed?: boolean
}

export const WorkoutScreen = () => {
  const route = useRoute<WorkoutRouteProp>()
  const navigation = useNavigation<WorkoutNavProp>()
  const { date } = route.params

  const [workout, setWorkout] = useState<WorkoutDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkout = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const planId = await AsyncStorage.getItem('workout_plan_id')
      if (!planId) {
        throw new Error('No workout plan found. Please generate a plan first.')
      }

      const token = await AsyncStorage.getItem('access_token')
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'

      const response = await fetch(
        `${apiUrl}/workouts/by-date?plan_id=${planId}&date=${date}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      )

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
  }, [date])

  useEffect(() => {
    fetchWorkout()
  }, [fetchWorkout])

  const handleMarkComplete = async () => {
    if (!workout) return

    try {
      const planId = await AsyncStorage.getItem('workout_plan_id')
      if (!planId) {
        throw new Error('No workout plan found')
      }

      const token = await AsyncStorage.getItem('access_token')
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'

      const response = await fetch(`${apiUrl}/workouts/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          workout_plan_id: parseInt(planId, 10),
          day_date: workout.date,
          completed: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to mark workout as complete')
      }

      Alert.alert('Success', 'Workout marked as complete!')
      navigation.goBack()
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to mark workout as complete')
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.margin}>Loading workout...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.error}>{error}</Text>
        <Button title="Retry" onPress={fetchWorkout} />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Workout for {workout?.date || date}</Text>
      <Text style={styles.subtitle}>{workout?.workout_name}</Text>

      <View style={styles.workoutCard}>
        {workout?.exercises?.map((item, index) => (
          <View key={index} style={styles.exercise}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <Text style={styles.exerciseDetails}>
              {item.sets} sets × {item.reps} reps
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.buttonWrapper}>
        <Button
          title={workout?.completed ? 'Completed ✓' : 'Mark as Complete'}
          onPress={handleMarkComplete}
          disabled={workout?.completed}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center'
  },
  workoutCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20
  },
  exercise: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500'
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#666'
  },
  buttonWrapper: {
    width: '100%'
  },
  margin: {
    marginTop: 12
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20
  }
})