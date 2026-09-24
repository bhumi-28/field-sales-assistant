import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../api/axiosClient';
import { COLORS, RADIUS, RADIUS_LG, SHADOW, FONT } from '../theme';

// The mobile app is for sales reps only. Admins use the web portal.
const ROLE = 'SALES_REP';

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focused, setFocused] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await axiosClient.post('/auth/login', { email, password, role: ROLE });

      if (response.data.role !== ROLE) {
        setError('This app is for sales reps. Admins should use the web portal.');
        setLoading(false);
        return;
      }

      await AsyncStorage.multiSet([
        ['token', response.data.token],
        ['userId', String(response.data.userId)],
        ['userName', response.data.name],
        ['userRole', response.data.role],
      ]);

      navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (name) => [styles.input, focused === name && styles.inputFocused];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>FS</Text>
          </View>
          <Text style={styles.title}>Field Sales Assistant</Text>
          <Text style={styles.tagline}>Sign in with the account your admin created for you</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={inputStyle('email')}
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused('')}
            placeholder="you@company.com"
            placeholderTextColor={COLORS.muted}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={inputStyle('password')}
            value={password}
            onChangeText={setPassword}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused('')}
            placeholder="Enter your password"
            placeholderTextColor={COLORS.muted}
            secureTextEntry
          />

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.onAccent} />
            ) : (
              <Text style={styles.buttonText}>Sign in</Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingVertical: 48 },

  brand: { alignItems: 'center', marginBottom: 32 },
  logo: {
    width: 60,
    height: 60,
    borderRadius: RADIUS_LG,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    ...SHADOW,
  },
  logoText: { color: COLORS.onAccent, fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },
  title: { color: COLORS.text, fontSize: 26, ...FONT.display },
  tagline: { color: COLORS.muted, fontSize: 14, marginTop: 6, textAlign: 'center' },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS_LG,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 22,
    ...SHADOW,
  },

  label: { color: COLORS.muted, fontSize: 13, ...FONT.label, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.surface2,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 16,
  },
  inputFocused: { borderColor: COLORS.accent },

  errorBox: {
    backgroundColor: COLORS.dangerSoft,
    borderRadius: RADIUS,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: COLORS.danger, fontSize: 13.5, fontWeight: '600' },

  button: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: COLORS.onAccent, fontSize: 16, fontWeight: '700' },

  linkWrap: { marginTop: 24, alignItems: 'center' },
  linkMuted: { color: COLORS.muted, fontSize: 14 },
  link: { color: COLORS.accent, fontWeight: '700' },
});

export default LoginScreen;