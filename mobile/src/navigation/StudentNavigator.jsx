// mobile/src/navigation/StudentNavigator.jsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { colors } from '../theme';

import StudentDashboard from '../screens/student/StudentDashboard';
import StudentSubjects from '../screens/student/StudentSubjects';
import StudentQuiz from '../screens/student/StudentQuiz';
import StudentScores from '../screens/student/StudentScores';

const Tab = createBottomTabNavigator();
const SubjectStack = createNativeStackNavigator();

function SubjectsStack() {
  return (
    <SubjectStack.Navigator>
      <SubjectStack.Screen name="SubjectList" component={StudentSubjects} options={{ title: 'Subjects' }} />
      <SubjectStack.Screen name="Quiz" component={StudentQuiz} options={{ title: 'Quiz' }} />
    </SubjectStack.Navigator>
  );
}

export default function StudentNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          const icons = { Dashboard: '🏠', Subjects: '📘', Scores: '📊' };
          return <Text style={{ fontSize: 18 }}>{icons[route.name]}</Text>;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.gray900,
      })}
    >
      <Tab.Screen name="Dashboard" component={StudentDashboard} options={{ title: 'Home' }} />
      <Tab.Screen name="Subjects" component={SubjectsStack} options={{ headerShown: false }} />
      <Tab.Screen name="Scores" component={StudentScores} />
    </Tab.Navigator>
  );
}
