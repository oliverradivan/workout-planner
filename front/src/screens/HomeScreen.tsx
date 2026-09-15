import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Button, ActivityIndicator, FlatList } from 'react-native'
import { useNavigation } from '@react-navigation/native'

export const HomeScreen = () => {
  const navigation = useNavigation()
  const [todayWorkout, setTodayWorkout] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch today's workout from backend
    // For now, simulate
    setTimeout(() => {
      setTodayWorkout({
        day: 1,
        date: '2024-01-15',
        workoutName: 'Upper Body A',
        exercises: [
          { name: 'Bench Press', sets: 4, reps: '8-10' },
          { name: 'Bent-over Rows', sets: 4, reps: '8-10' },
          { name: 'Shoulder Press', sets: 3, reps: '10-12' },
          { name: 'Bicep Curls', sets: 3, reps: '12-15' },
          { name: 'Tricep Extensions', sets: 3, reps: '12-15' }
        ]
      })
      setLoading(false)
    }, 1000)
  }, [])

  const handleViewWeek = () => {
    navigation.navigate('Week')
  }

  const handleMarkComplete = () => {
    // Mark workout as complete via backend
    alert('Workout marked as complete!')
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
        <Button title="Retry" onPress={() => { /* refetch */ }} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Workout</Text>
      <Text style={styles.date}>{todayWorkout?.date}</Text>
      
      <View style={styles.workoutCard}>
        <Text style={styles.workoutName}>{todayWorkout?.workoutName}</Text>
        
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
      
      <Button title="Mark as Complete" onPress={handleMarkComplete} />
      <Button title="View This Week" onPress={handleViewWeek} />
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