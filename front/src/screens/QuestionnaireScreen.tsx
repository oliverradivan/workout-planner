import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../App'

type QuestionnaireNavProp = NativeStackNavigationProp<RootStackParamList, 'Questionnaire'>

export interface QuestionnaireData {
  goal: string
  age: string
  weight: string
  gender: string
  days_per_week: number
  location: string
  equipment?: string
}

interface DropdownOption {
  label: string
  value: string
}

// Reusable Custom Dropdown Component
interface CustomSelectProps {
  label: string
  options: DropdownOption[]
  selectedValue: string
  onValueChange: (value: string) => void
}

const CustomSelect: React.FC<CustomSelectProps> = ({ label, options, selectedValue, onValueChange }) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const selectedOption = options.find((opt: DropdownOption) => opt.value === selectedValue)

  return (
    <View style={styles.selectWrapper}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectText}>{selectedOption?.label || 'Select option'}</Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item: DropdownOption) => item.value}
              renderItem={({ item }: { item: DropdownOption }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    item.value === selectedValue && styles.selectedOptionItem
                  ]}
                  onPress={() => {
                    onValueChange(item.value)
                    setModalVisible(false)
                  }}
                >
                  <Text style={item.value === selectedValue ? styles.selectedOptionText : styles.optionText}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

// Main Component
export const QuestionnaireScreen = () => {
  const navigation = useNavigation<QuestionnaireNavProp>()
  const [formData, setFormData] = useState({
    goal: 'lose weight',
    age: '',
    weight: '',
    gender: 'male',
    days_per_week: '3',
    location: 'home_bodyweight',
    equipment: ''
  })

  const goalOptions: DropdownOption[] = [
    { label: 'Lose Weight', value: 'lose weight' },
    { label: 'Build Muscle', value: 'build muscle' },
    { label: 'General Fitness', value: 'general fitness' },
    { label: 'Strength', value: 'strength' },
    { label: 'Endurance', value: 'endurance' }
  ]

  const genderOptions: DropdownOption[] = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
    { label: 'Prefer not to say', value: 'prefer not to say' }
  ]

  const locationOptions: DropdownOption[] = [
    { label: 'Home (bodyweight only)', value: 'home_bodyweight' },
    { label: 'Home (with equipment)', value: 'home_equipment' },
    { label: 'Gym (full equipment)', value: 'gym' },
    { label: 'Park/outdoor', value: 'park' }
  ]

  const handleSubmit = () => {
    const payload: QuestionnaireData = {
      ...formData,
      days_per_week: parseInt(formData.days_per_week, 10) || 3
    }
    navigation.navigate('Preview', { questionnaireData: payload })
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Workout Planner Questionnaire</Text>

      <CustomSelect
        label="Goal"
        options={goalOptions}
        selectedValue={formData.goal}
        onValueChange={(val: string) => setFormData({ ...formData, goal: val })}
      />

      <Text style={styles.label}>Age</Text>
      <TextInput
        placeholder="Enter your age"
        value={formData.age}
        onChangeText={(text: string) => setFormData({ ...formData, age: text })}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        placeholder="Enter your weight"
        value={formData.weight}
        onChangeText={(text: string) => setFormData({ ...formData, weight: text })}
        keyboardType="numeric"
        style={styles.input}
      />

      <CustomSelect
        label="Gender"
        options={genderOptions}
        selectedValue={formData.gender}
        onValueChange={(val: string) => setFormData({ ...formData, gender: val })}
      />

      <Text style={styles.label}>Days per week you want to train</Text>
      <TextInput
        placeholder="Enter number of days (1-7)"
        value={formData.days_per_week}
        onChangeText={(text: string) => setFormData({ ...formData, days_per_week: text })}
        keyboardType="numeric"
        style={styles.input}
      />

      <CustomSelect
        label="Where will you be training?"
        options={locationOptions}
        selectedValue={formData.location}
        onValueChange={(val: string) => setFormData({ ...formData, location: val })}
      />

      {formData.location === 'home_equipment' && (
        <>
          <Text style={styles.label}>What equipment do you have?</Text>
          <TextInput
            placeholder="List your equipment (e.g. dumbbells, barbell)"
            value={formData.equipment}
            onChangeText={(text: string) => setFormData({ ...formData, equipment: text })}
            style={styles.input}
          />
        </>
      )}

      <View style={styles.buttonWrapper}>
        <Button title="Generate Workout Preview" onPress={handleSubmit} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20
  },
  scrollContent: {
    paddingBottom: 40
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  label: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '500'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 16
  },
  selectWrapper: {
    marginBottom: 4
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff'
  },
  selectText: {
    fontSize: 16
  },
  arrow: {
    fontSize: 12,
    color: '#666'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: '60%',
    padding: 16
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center'
  },
  optionItem: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  selectedOptionItem: {
    backgroundColor: '#f0f7ff'
  },
  optionText: {
    fontSize: 16,
    color: '#333'
  },
  selectedOptionText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold'
  },
  buttonWrapper: {
    marginTop: 16
  }
})