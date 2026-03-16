import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import { AppNavigator } from '@/navigation';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor="#0a0a0a" />
      <AppNavigator />
    </AuthProvider>
  );
}
