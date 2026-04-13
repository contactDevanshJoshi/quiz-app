// mobile/src/screens/auth/LoginScreen.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { loginStudent, loginAdmin, loginTeacher, loginSuperAdmin } from '../../../../shared/firebase/firestore';
import { colors, s } from '../../theme';

const ROLES = [
  { key: 'student',    label: 'Student',     icon: '🎓', hint: 'Enrollment number' },
  { key: 'admin',      label: 'Admin',       icon: '⚙️', hint: 'Username' },
  { key: 'teacher',    label: 'Teacher',     icon: '📚', hint: 'Username' },
  { key: 'superadmin', label: 'Super Admin', icon: '👑', hint: 'Username' },
];

export default function LoginScreen() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  async function handleLogin() {
    if (!username || !password) { Alert.alert('Error', 'Please fill all fields'); return; }
    setLoading(true);
    try {
      let user;
      if (selectedRole === 'student') user = await loginStudent(username, password);
      else if (selectedRole === 'admin') user = await loginAdmin(username, password);
      else if (selectedRole === 'teacher') user = await loginTeacher(username, password);
      else user = await loginSuperAdmin(username, password);
      await login(user, selectedRole);
    } catch (e) {
      Alert.alert('Login Failed', e.message);
    } finally { setLoading(false); }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>🎓 Quiz App</Text>
          <Text style={styles.appSubtitle}>College Quiz Platform</Text>
        </View>

        {!selectedRole ? (
          <View>
            <Text style={[s.h3, { textAlign: 'center', marginBottom: 20, color: colors.white }]}>Select your role</Text>
            <View style={styles.roleGrid}>
              {ROLES.map(r => (
                <TouchableOpacity key={r.key} style={styles.roleBtn} onPress={() => setSelectedRole(r.key)}>
                  <Text style={{ fontSize: 28, marginBottom: 6 }}>{r.icon}</Text>
                  <Text style={styles.roleLabel}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.loginCard}>
            <TouchableOpacity onPress={() => { setSelectedRole(null); setUsername(''); setPassword(''); }}>
              <Text style={{ color: colors.primary, marginBottom: 16, fontSize: 14 }}>← Back</Text>
            </TouchableOpacity>

            <Text style={[s.h2, { marginBottom: 4 }]}>
              {ROLES.find(r => r.key === selectedRole)?.icon} {ROLES.find(r => r.key === selectedRole)?.label} Login
            </Text>
            <Text style={[s.muted, { marginBottom: 20 }]}>Enter your credentials to continue</Text>

            <View style={{ marginBottom: 14 }}>
              <Text style={s.label}>{selectedRole === 'student' ? 'Enrollment Number' : 'Username'}</Text>
              <TextInput
                style={s.input}
                value={username}
                onChangeText={setUsername}
                placeholder={selectedRole === 'student' ? 'e.g. 22CS001' : 'Enter username'}
                autoCapitalize="none"
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={s.label}>Password</Text>
              <TextInput
                style={s.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={s.btnPrimary} onPress={handleLogin} disabled={loading}>
              <Text style={s.btnText}>{loading ? 'Logging in...' : 'Login'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primary },
  content: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  appTitle: { fontSize: 32, fontWeight: '800', color: colors.white, marginBottom: 4 },
  appSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.75)' },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  roleBtn: {
    width: 140, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12,
    padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  roleLabel: { color: colors.white, fontWeight: '600', fontSize: 14 },
  loginCard: { backgroundColor: colors.white, borderRadius: 16, padding: 24 },
});
