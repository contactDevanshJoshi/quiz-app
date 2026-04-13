// mobile/src/navigation/AdminNavigator.jsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { colors } from '../theme';
import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminStudents from '../screens/admin/AdminStudents';
import AdminSubjects from '../screens/admin/AdminSubjects';
import AdminTeachers from '../screens/admin/AdminTeachers';

const Tab = createBottomTabNavigator();
export default function AdminNavigator() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ color }) => {
        const icons = { Dashboard: '🏠', Students: '👥', Subjects: '📘', Teachers: '🧑‍🏫' };
        return <Text style={{ fontSize: 16 }}>{icons[route.name]}</Text>;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.gray500,
    })}>
      <Tab.Screen name="Dashboard" component={AdminDashboard} />
      <Tab.Screen name="Students" component={AdminStudents} />
      <Tab.Screen name="Subjects" component={AdminSubjects} />
      <Tab.Screen name="Teachers" component={AdminTeachers} />
    </Tab.Navigator>
  );
}

// mobile/src/navigation/TeacherNavigator.jsx
import TeacherDashboard from '../screens/teacher/TeacherDashboard';
import TeacherQuestions from '../screens/teacher/TeacherQuestions';
import TeacherScores from '../screens/teacher/TeacherScores';

const TeacherTab = createBottomTabNavigator();
export function TeacherNavigator() {
  return (
    <TeacherTab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ color }) => {
        const icons = { Dashboard: '🏠', Questions: '❓', Scores: '📊' };
        return <Text style={{ fontSize: 16 }}>{icons[route.name]}</Text>;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.gray500,
    })}>
      <TeacherTab.Screen name="Dashboard" component={TeacherDashboard} />
      <TeacherTab.Screen name="Questions" component={TeacherQuestions} />
      <TeacherTab.Screen name="Scores" component={TeacherScores} />
    </TeacherTab.Navigator>
  );
}

// mobile/src/navigation/SuperAdminNavigator.jsx
import SuperAdminDashboard from '../screens/superadmin/SuperAdminDashboard';
import SuperAdminHOD from '../screens/superadmin/SuperAdminHOD';

const SATab = createBottomTabNavigator();
export function SuperAdminNavigator() {
  return (
    <SATab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: () => {
        const icons = { Dashboard: '🏠', HOD: '🎓' };
        return <Text style={{ fontSize: 16 }}>{icons[route.name]}</Text>;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.gray500,
    })}>
      <SATab.Screen name="Dashboard" component={SuperAdminDashboard} />
      <SATab.Screen name="HOD" component={SuperAdminHOD} options={{ title: 'HOD Management' }} />
    </SATab.Navigator>
  );
}
