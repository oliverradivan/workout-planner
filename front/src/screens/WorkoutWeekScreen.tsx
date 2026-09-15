import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native'

export const WorkoutWeekScreen = () => {
  const [weekWorkouts, setWeekWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeekWorkouts = async () => {
      try {
        // We'll create an endpoint to get the week's workouts for the user's plan
        // For now, we'll simulate by generating a week's worth of data from the today endpoint multiple times
        // In a real app, we would have an endpoint like /workouts/week
        const response = await fetch(`${import.meta.env.VITE_API_URL}/workouts/today`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch week\'s workouts')
        }

        const todayWorkout = await response.json()
        // We'll create a week's worth of workouts by shifting the date
        const weekWorkouts = []
        for (let i = 0; i < 7; i++) {
          const date = new Date()
          date.setDate(date.getDate() + i)
          const dateString = date.toISOString().split('T')[0]
          weekWorkouts.push({
            day: i + 1,
            date: dateString,
            workout_name: todayWorkout.workout_name, // In reality, this would vary by day
            completed: false // We would check the logs for completion
          })
        }

        setWeekWorkouts(weekWorkouts)
      } catch (err: any) {
        setError(err.message || 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchWeekWorkouts()
  }, [])

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.margin}>Loading week's workouts...</Text>
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
      <Text style={styles.title}>This Week's Workouts:</Text>
      <FlatList
        data={weekWorkouts}
        keyExtractor={(item) => item.date.toString()}
        renderItem={({ item }) => (
          <View style={styles.workoutItem}>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.workoutName}>{item.workout_name}</Text>
            {item.completed ? (
              <Text style={styles.completed}>Completed</Text>
            ) : (
              <Text style={styles.notCompleted}>Not Completed</Text>
            )}
          </View>
        )}
      />
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
    marginBottom: 20,
  },
  workoutItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 16,
    fontWeight: '500',
  },
  workoutName: {
    fontSize: 16,
    flex: 1,
    marginHorizontal: 10,
  },
  completed: {
    color: 'green',
    fontWeight: '600',
  },
  notCompleted: {
    color: 'orange',
    fontWeight: '600',
  }
})