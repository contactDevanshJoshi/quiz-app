// mobile/src/navigation/AppNavigator.jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

// Auth
import LoginScreen from '../screens/auth/LoginScreen';

// Student
import StudentNavigator from './StudentNavigator';

// Admin
import AdminNavigator from './AdminNavigator';

// Teacher
import TeacherNavigator from './TeacherNavigator';

// Super Admin
import SuperAdminNavigator from './SuperAdminNavigator';

const Root = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color="#4F46E5" /></View>;
  }

  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Root.Screen name="Login" component={LoginScreen} />
        ) : role === 'student' ? (
          <Root.Screen name="Student" component={StudentNavigator} />
        ) : role === 'admin' ? (
          <Root.Screen name="Admin" component={AdminNavigator} />
        ) : role === 'teacher' ? (
          <Root.Screen name="Teacher" component={TeacherNavigator} />
        ) : (
          <Root.Screen name="SuperAdmin" component={SuperAdminNavigator} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}
