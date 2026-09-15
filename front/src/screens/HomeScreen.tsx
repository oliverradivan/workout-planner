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
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { RootStackParamList } from '../App'

declare const process: {
  env: Record<string, string | undefined>
}

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>

interface Exercise {
  name: string
  sets: number
  reps: number
}

interface TodayWorkout {
  date: string
  workout_name: string
  exercises: Exercise[]
  completed?: boolean
}

export const HomeScreen = () => {
  const navigation = useNavigation<HomeNavProp>()
  const [todayWorkout, setTodayWorkout] = useState<TodayWorkout | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTodayWorkout = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const planId = await AsyncStorage.getItem('workout_plan_id')
      if (!planId) {
        setTodayWorkout(null)
        setLoading(false)
        return
      }

      const token = await AsyncStorage.getItem('access_token')
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'
      const todayDate = new Date().toISOString().split('T')[0]

      const response = await fetch(
        `${apiUrl}/workouts/by-date?plan_id=${planId}&date=${todayDate}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch today's workout")
      }

      const data = await response.json()
      setTodayWorkout(data)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTodayWorkout()
  }, [fetchTodayWorkout])

  const handleViewWeek = () => {
    navigation.navigate('WorkoutWeek' as any)
  }

  const handleMarkComplete = async () => {
    if (!todayWorkout) return

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
          day_date: todayWorkout.date,
          completed: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to mark workout as complete')
      }

      setTodayWorkout((prev) => (prev ? { ...prev, completed: true } : null))
      Alert.alert('Success', 'Workout marked as complete!')
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to mark workout as complete')
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.margin}>Loading your workout...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.error}>{error}</Text>
        <Button title="Retry" onPress={fetchTodayWorkout} />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Today's Workout</Text>
      <Text style={styles.date}>{todayWorkout?.date || new Date().toISOString().split('T')[0]}</Text>

      {todayWorkout ? (
        <View style={styles.workoutCard}>
          <Text style={styles.workoutName}>{todayWorkout.workout_name}</Text>

          {todayWorkout.exercises?.map((item, index) => (
            <View key={index} style={styles.exercise}>
              <Text style={styles.exerciseName}>{item.name}</Text>
              <Text style={styles.exerciseDetails}>
                {item.sets} sets × {item.reps} reps
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.workoutCard}>
          <Text style={styles.workoutName}>No active workout plan found.</Text>
          <Button
            title="Create Plan"
            onPress={() => navigation.navigate('Questionnaire' as any)}
          />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button
          title={todayWorkout?.completed ? 'Completed ✓' : 'Mark as Complete'}
          onPress={handleMarkComplete}
          disabled={!todayWorkout || todayWorkout.completed}
        />
        <Button title="View This Week" onPress={handleViewWeek} />
      </View>

      <View style={styles.linkContainer}>
        <Button
          title="Privacy Policy"
          onPress={() => navigation.navigate('Privacy' as any)}
        />
        <Button
          title="Terms of Service"
          onPress={() => navigation.navigate('Terms' as any)}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20
  },
  scrollContent: {
    paddingBottom: 40
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20
  },
  workoutCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  workoutName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16
  },
  exercise: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#666'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20
  },
  linkContainer: {
    marginTop: 20,
    gap: 10
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