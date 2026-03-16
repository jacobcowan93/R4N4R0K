import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize } from '@/theme';
import { HomeScreen } from '@/screens/HomeScreen';
import { BlueprintsScreen } from '@/screens/BlueprintsScreen';
import { BlueprintDetailScreen } from '@/screens/BlueprintDetailScreen';
import { MarketplaceScreen } from '@/screens/MarketplaceScreen';
import { TrackerScreen } from '@/screens/TrackerScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { RegisterScreen } from '@/screens/RegisterScreen';
import type { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

type TabIconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<keyof TabParamList, [TabIconName, TabIconName]> = {
  Home: ['home', 'home-outline'],
  Blueprints: ['construct', 'construct-outline'],
  Marketplace: ['storefront', 'storefront-outline'],
  Tracker: ['bookmark', 'bookmark-outline'],
  Profile: ['person', 'person-outline'],
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: Colors.bgElevated },
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: { fontWeight: '700' as const, fontSize: FontSize.md },
        tabBarStyle: {
          backgroundColor: Colors.bgElevated,
          borderTopColor: Colors.border,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: FontSize.xs },
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = TAB_ICONS[route.name as keyof TabParamList];
          return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Blueprints" component={BlueprintsScreen} options={{ title: 'Blueprints' }} />
      <Tab.Screen name="Marketplace" component={MarketplaceScreen} options={{ title: 'Market' }} />
      <Tab.Screen name="Tracker" component={TrackerScreen} options={{ title: 'Tracker' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: Colors.bgElevated },
          headerTintColor: Colors.textPrimary,
          headerTitleStyle: { fontWeight: '700' as const },
          contentStyle: { backgroundColor: Colors.bg },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="BlueprintDetail"
          component={BlueprintDetailScreen}
          options={{ title: 'Blueprint' }}
        />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign In' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
