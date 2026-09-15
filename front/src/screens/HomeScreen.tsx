import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Button, ActivityIndicator, FlatList } from 'react-native'
import { useNavigation } from '@react-navigation/native'

export const HomeScreen = () => {
  const navigation = useNavigation()
  const [todayWorkout, setTodayWorkout] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTodayWorkout = async () => {
      try {
        const planId = localStorage.getItem('workout_plan_id')
        if (!planId) {
          // If no plan id, we can't fetch the workout
          setTodayWorkout(null)
          setLoading(false)
          return
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/workouts/by-date?plan_id=${planId}&date=${new Date().toISOString().split('T')[0]}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch today\'s workout')
        }

        const data = await response.json()
        setTodayWorkout(data)
      } catch (err: any) {
        setError(err.message || 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchTodayWorkout()
  }, [])

  const handleViewWeek = () => {
    navigation.navigate('Week')
  }

  const handleMarkComplete = async () => {
    if (!todayWorkout) return

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
          day_date: todayWorkout.date,
          completed: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to mark workout as complete')
      }

      // Update local state to reflect completion
      setTodayWorkout(prev => ({
        ...prev,
        completed: true
      }))
      alert('Workout marked as complete!')
    } catch (err: any) {
      alert(err.message || 'Failed to mark workout as complete')
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.margin}>Loading your workout...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
        <Button title="Retry" onPress={fetchTodayWorkout} />
      )
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Workout</Text>
      <Text style={styles.date}>{todayWorkout?.date}</Text>
      
      <View style={styles.workoutCard}>
        <Text style={styles.workoutName}>{todayWorkout?.workout_name}</Text>
        
        <FlatList
          data={todayWorkout?.exercises || []}
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
      
      <View style={styles.buttonContainer}>
        <Button title="Mark as Complete" onPress={handleMarkComplete} />
        <Button title="View This Week" onPress={handleViewWeek} />
      </View>
      
      <View style={styles.linkContainer}>
        <Button title="Privacy Policy" onPress={() => navigation.navigate('Privacy')} />
        <Button title="Terms of Service" onPress={() => navigation.navigate('Terms')} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
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
    elevation: 3,
  },
  workoutName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  exercise: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  linkContainer: {
    marginTop: 20,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  }
})