import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/Card';
import { useAuth } from '@/context/AuthContext';
import { Colors, FontSize, Spacing } from '@/theme';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, logout } = useAuth();

  if (!user) return <LoginPrompt navigation={navigation} />;

  function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar + name */}
      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>
            {user.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatBox label="Credits" value={user.credits.toLocaleString()} />
        <StatBox label="Tracked" value={String(user.trackedBlueprints.length)} />
        <StatBox label="Listings" value={String(user.activeListings)} />
      </View>

      {/* Actions */}
      <Card style={styles.section}>
        <ActionRow icon="storefront-outline" label="My Listings" onPress={() => navigation.navigate('Marketplace')} />
        <ActionRow icon="bookmark-outline" label="Tracked Blueprints" onPress={() => navigation.navigate('Tracker')} />
      </Card>

      <Card style={styles.section}>
        <ActionRow icon="help-circle-outline" label="Help & Support" onPress={() => {}} />
        <ActionRow icon="information-circle-outline" label="About Raider Syndicate" onPress={() => {}} />
      </Card>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.actionRow} onPress={onPress}>
      <Ionicons name={icon} size={20} color={Colors.primary} />
      <Text style={styles.actionLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} style={{ marginLeft: 'auto' }} />
    </TouchableOpacity>
  );
}

function LoginPrompt({ navigation }: { navigation: Nav }) {
  return (
    <View style={styles.loginContainer}>
      <Ionicons name="person-circle-outline" size={64} color={Colors.textMuted} />
      <Text style={styles.loginTitle}>Your Profile</Text>
      <Text style={styles.loginBody}>Sign in to track blueprints, post listings, and more.</Text>
      <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginBtnText}>Log In</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerBtnText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xxl },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: { color: Colors.bg, fontSize: FontSize.xxl, fontWeight: '800' },
  username: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '700' },
  email: { color: Colors.textSecondary, fontSize: FontSize.sm },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.bgElevated,
    borderRadius: 12,
    padding: Spacing.md,
  },
  statBox: { alignItems: 'center', gap: 4 },
  statValue: { color: Colors.primary, fontSize: FontSize.xl, fontWeight: '800' },
  statLabel: { color: Colors.textSecondary, fontSize: FontSize.xs },
  section: { gap: 0 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionLabel: { color: Colors.textPrimary, fontSize: FontSize.md },
  logoutBtn: {
    backgroundColor: Colors.danger,
    borderRadius: 8,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: FontSize.md },
  loginContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
    backgroundColor: Colors.bg,
  },
  loginTitle: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '700' },
  loginBody: { color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'center' },
  loginBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  loginBtnText: { color: Colors.bg, fontWeight: '700', fontSize: FontSize.md },
  registerBtn: {
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  registerBtnText: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.md },
});
