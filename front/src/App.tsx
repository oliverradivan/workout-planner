import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { QuestionnaireScreen } from './screens/QuestionnaireScreen'
import { WorkoutPreviewScreen } from './screens/WorkoutPreviewScreen'
import { SignUpScreen } from './screens/SignUpScreen'
import { HomeScreen } from './screens/HomeScreen'
import { WorkoutScreen } from './screens/WorkoutScreen'
import { WorkoutWeekScreen } from './screens/WorkoutWeekScreen'

type RootStackParamList = {
  Questionnaire: undefined
  Preview: undefined
  SignUp: undefined
  Home: undefined
  Workout: { date: string }
  Week: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Questionnaire">
        <Stack.Screen name="Questionnaire" component={QuestionnaireScreen} />
        <Stack.Screen name="Preview" component={WorkoutPreviewScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Workout" component={WorkoutScreen} />
        <Stack.Screen name="Week" component={WorkoutWeekScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}