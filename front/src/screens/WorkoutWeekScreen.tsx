import React from 'react'
import { View, Text, StyleSheet, FlatList } from 'react-native'

export const WorkoutWeekScreen = () => {
  // In a real app, we would fetch the week's workouts from backend
  const weekWorkouts = [
    { day: 1, date: '2024-01-15', workoutName: 'Upper Body A', completed: true },
    { day: 2, date: '2024-01-16', workoutName: 'Lower Body A', completed: false },
    { day: 3, date: '2024-01-17', workoutName: 'Rest or Active Recovery', completed: false },
    { day: 4, date: '2024-01-18', workoutName: 'Upper Body B', completed: false },
    { day: 5, date: '2024-01-19', workoutName: 'Lower Body B', completed: false },
    { day: 6, date: '2024-01-20', workoutName: 'Full Body', completed: false },
    { day: 7, date: '2024-01-21', workoutName: 'Rest', completed: false },
  ]

  return (
    <View style={styles.container}>
      <Text style={styles.title}>This Week's Workouts</Text>
      <FlatList
        data={weekWorkouts}
        keyExtractor={(item) => item.date.toString()}
        renderItem={({ item }) => (
          <View style={styles.workoutItem}>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.workoutName}>{item.workoutName}</Text>
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