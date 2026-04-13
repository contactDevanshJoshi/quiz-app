// mobile/index.js
import { AppRegistry } from 'react-native';
import React from 'react';
import { AuthProvider } from './src/hooks/useAuth';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

AppRegistry.registerComponent('QuizAppMobile', () => App);
