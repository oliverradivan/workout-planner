import React, { useState } from 'react'
import { View, Text, TextInput, Picker, Button, StyleSheet, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'

export const QuestionnaireScreen = () => {
  const navigation = useNavigation()
  const [formData, setFormData] = useState({
    goal: '',
    age: '',
    weight: '',
    gender: '',
    daysPerWeek: '',
    location: '',
    equipment: ''
  })

  const handleSubmit = () => {
    // Navigate to preview screen, passing form data
    navigation.navigate('Preview', { questionnaireData: formData })
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Workout Planner Questionnaire</Text>
      
      <Text style={styles.label}>Goal</Text>
      <Picker
        selectedValue={formData.goal}
        onValueChange={(itemValue) => setFormData({ ...formData, goal: itemValue })}
        style={styles.input}
      >
        <Picker.Item label="Lose Weight" value="lose weight" />
        <Picker.Item label="Build Muscle" value="build muscle" />
        <Picker.Item label="General Fitness" value="general fitness" />
        <Picker.Item label="Strength" value="strength" />
        <Picker.Item label="Endurance" value="endurance" />
      </Picker>

      <Text style={styles.label}>Age</Text>
      <TextInput
        placeholder="Enter your age"
        value={formData.age}
        onChangeText={(text) => setFormData({ ...formData, age: text })}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        placeholder="Enter your weight"
        value={formData.weight}
        onChangeText={(text) => setFormData({ ...formData, weight: text })}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Gender</Text>
      <Picker
        selectedValue={formData.gender}
        onValueChange={(itemValue) => setFormData({ ...formData, gender: itemValue })}
        style={styles.input}
      >
        <Picker.Item label="Male" value="male" />
        <Picker.Item label="Female" value="female" />
        <Picker.Item label="Other" value="other" />
        <Picker.Item label="Prefer not to say" value="prefer not to say" />
      </Picker>

      <Text style={styles.label}>Days per week you want to train</Text>
      <TextInput
        placeholder="Enter number of days (1-7)"
        value={formData.daysPerWeek}
        onChangeText={(text) => setFormData({ ...formData, daysPerWeek: text })}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Where will you be training?</Text>
      <Picker
        selectedValue={formData.location}
        onValueChange={(itemValue) => setFormData({ ...formData, location: itemValue })}
        style={styles.input}
      >
        <Picker.Item label="Home (bodyweight only)" value="home_bodyweight" />
        <Picker.Item label="Home (with equipment)" value="home_equipment" />
        <Picker.Item label="Gym (full equipment)" value="gym" />
        <Picker.Item label="Park/outdoor" value="park" />
      </Picker>

      {formData.location === 'home_equipment' && (
        <>
          <Text style={styles.label}>What equipment do you have? (e.g. dumbbells, barbell, pull-up bar)</Text>
          <TextInput
            placeholder="List your equipment"
            value={formData.equipment}
            onChangeText={(text) => setFormData({ ...formData, equipment: text })}
            style={styles.input}
          />
        </>
      )}

      <Button title="Generate Workout Preview" onPress={handleSubmit} />
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
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
})