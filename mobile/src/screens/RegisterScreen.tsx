import React, { useState } from 'react';
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/context/AuthContext';
import { Colors, FontSize, Radius, Spacing } from '@/theme';
import { Images } from '@/theme/images';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleRegister() {
    if (!username.trim() || !email.trim() || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await register(username.trim(), email.trim(), password);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ImageBackground source={Images.bgDarkInterior} style={styles.bg} imageStyle={styles.bgImage}>
    <KeyboardAvoidingView
      style={styles.kav}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the Raider Syndicate community</Text>

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholderTextColor={Colors.textMuted}
          placeholder="raider123"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={Colors.textMuted}
          placeholder="you@example.com"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={Colors.textMuted}
          placeholder="Min. 8 characters"
        />

        <TouchableOpacity
          style={[styles.btn, submitting && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={submitting}
        >
          <Text style={styles.btnText}>{submitting ? 'Creating…' : 'Create Account'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.replace('Login')}>
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkAccent}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  bgImage: { resizeMode: 'cover', opacity: 0.45 },
  kav: { flex: 1, backgroundColor: 'rgba(10,10,10,0.78)' },
  container: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl, gap: Spacing.sm },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: '800',
    marginBottom: 0,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: { color: Colors.textSecondary, marginBottom: Spacing.md },
  label: { color: Colors.textSecondary, fontSize: FontSize.sm, marginBottom: -4 },
  input: {
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
  },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: Colors.bg, fontWeight: '700', fontSize: FontSize.md },
  linkBtn: { alignItems: 'center', marginTop: Spacing.sm },
  linkText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  linkAccent: { color: Colors.primary, fontWeight: '600' },
});
