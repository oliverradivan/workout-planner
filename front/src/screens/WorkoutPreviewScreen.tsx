import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, Button, ActivityIndicator, ScrollView } from 'react-native'
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { RootStackParamList } from '../App'

// Declares 'process' to satisfy TypeScript without @types/node
declare const process: {
  env: Record<string, string | undefined>
}

type PreviewRouteProp = RouteProp<RootStackParamList, 'Preview'>
type PreviewNavProp = NativeStackNavigationProp<RootStackParamList, 'Preview'>

interface Exercise {
  name: string
  sets: number
  reps: number
}

interface WorkoutDay {
  day: number
  workout_name: string
  exercises: Exercise[]
}

export const WorkoutPreviewScreen = () => {
  const route = useRoute<PreviewRouteProp>()
  const navigation = useNavigation<PreviewNavProp>()
  
  const questionnaireData = route.params?.questionnaireData

  const [preview, setPreview] = useState<WorkoutDay[] | null>(null)
  const [planId, setPlanId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const generatePreview = useCallback(async () => {
    if (!questionnaireData) {
      setError('No questionnaire data provided.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const token = await AsyncStorage.getItem('access_token')
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'

      const response = await fetch(`${apiUrl}/workouts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(questionnaireData)
      })

      if (!response.ok) {
        throw new Error('Failed to generate workout preview')
      }

      const data = await response.json()
      setPlanId(data.plan_id)
      await AsyncStorage.setItem('workout_plan_id', data.plan_id.toString())
      
      const daysPerWeek = questionnaireData?.days_per_week || 3
      const previewData = data.plan.slice(0, daysPerWeek)
      setPreview(previewData)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [questionnaireData])

  useEffect(() => {
    generatePreview()
  }, [generatePreview])

  const handleSignUp = () => {
    navigation.navigate('SignUp' as any, { questionnaireData })
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.margin}>Generating your workout preview...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.error}>{error}</Text>
        <Button title="Retry" onPress={generatePreview} />
      </View>
    )
  }

  if (!preview) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.margin}>No preview data available</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Your Workout Preview</Text>
      <Text style={styles.subtitle}>First {preview.length} days</Text>
      
      {preview.map((day) => (
        <View key={day.day} style={styles.dayContainer}>
          <Text style={styles.dayTitle}>Day {day.day}: {day.workout_name}</Text>
          {day.exercises.map((exercise, index) => (
            <View key={index} style={styles.exercise}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseDetails}>
                {exercise.sets} sets × {exercise.reps} reps
              </Text>
            </View>
          ))}
        </View>
      ))}
      
      <View style={styles.buttonContainer}>
        <Button title="Save Your Plan (Sign Up)" onPress={handleSignUp} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  dayContainer: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginVertical: 8,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  exercise: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
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
  },
  buttonContainer: {
    marginTop: 20,
  }
})