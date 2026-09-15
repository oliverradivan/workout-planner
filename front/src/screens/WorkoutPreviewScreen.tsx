import React from 'react'
import { View, Text, StyleSheet, Button, ActivityIndicator, FlatList } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'

export const WorkoutPreviewScreen = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { questionnaireData } = route.params as { questionnaireData: any }

  const [preview, setPreview] = React.useState(null)
  const [planId, setPlanId] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = useState<string | null>(null)

  React.useEffect(() => {
    const generatePreview = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/workouts/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify(questionnaireData)
        })

        if (!response.ok) {
          throw new Error('Failed to generate workout preview')
        }

        const data = await response.json()
        // Store the plan id
        setPlanId(data.plan_id)
        localStorage.setItem('workout_plan_id', data.plan_id.toString())
        
        // We'll take the first week (first 7 days) or however many days per week
        const daysPerWeek = questionnaireData.days_per_week || 3
        const previewData = data.plan.slice(0, daysPerWeek)
        setPreview(previewData)
      } catch (err: any) {
        setError(err.message || 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    generatePreview()
  }, [questionnaireData])

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

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
        <Button title="Retry" onPress={() => { /* trigger refresh */ }} />
      </View>
    )
  }

  if (!preview) {
    return (
      <View style={styles.container}>
        <Text style={styles.margin}>No preview data available</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Workout Preview</Text>
      <Text style={styles.subtitle}>First {preview.length} days</Text>
      
      {preview.map((day: any, dayIndex: number) => (
        <View key={day.day} style={styles.dayContainer}>
          <Text style={styles.dayTitle}>Day {day.day}: {day.workout_name}</Text>
          <FlatList
            data={day.exercises}
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
      ))}
      
      <Button title="Save Your Plan (Sign Up)" onPress={handleSignUp} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  }
})