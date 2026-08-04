import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors, Gradients } from '../../constants/Colors';
import { BorderRadius, Shadow } from '../../constants/Theme';
import { UserRole } from '../../data/types';

const DEPARTMENTS = [
  'Computer Science', 'Electronics & Communication', 'Mechanical Engineering',
  'Civil Engineering', 'Information Technology', 'Electrical Engineering',
  'Chemical Engineering', 'Biotechnology', 'MBA', 'MCA',
];

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [department, setDepartment] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Full name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    const result = await register(name.trim(), email.trim(), password, role, department || undefined);
    setLoading(false);
    if (!result.success) {
      setErrors({ general: result.error || 'Registration failed.' });
    } else {
      setTimeout(() => {
        if (result.role === 'admin') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/student/dashboard');
        }
      }, 100);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, width: '100%' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.gradient}>
        {/* Colorful Abstract background blobs */}
        {isWeb && <View style={styles.blob1} />}
        {isWeb && <View style={styles.blob2} />}

        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} testID="signup_back_btn" accessibilityLabel="signup_back_btn">
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <LinearGradient colors={Gradients.aurora} style={styles.logoCircle}>
            <Ionicons name="person-add" size={30} color="#fff" />
          </LinearGradient>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSub}>Join SmartEvents today</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>

            {errors.general && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color={Colors.error} />
                <Text style={styles.errorBannerText}>{errors.general}</Text>
              </View>
            )}

            {/* Role Selector */}
            <Text style={styles.sectionLabel}>I am a...</Text>
            <View style={styles.roleRow}>
              {(['student', 'admin', 'faculty'] as UserRole[]).map(r => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleBtn, role === r && styles.roleBtnActive]}
                  onPress={() => setRole(r)}
                  testID={"signup_role_" + r}
                  accessibilityLabel={"signup_role_" + r}
                >
                  <Ionicons
                    name={r === 'student' ? 'person' : r === 'admin' ? 'shield-checkmark' : 'school'}
                    size={22}
                    color={role === r ? Colors.white : Colors.textSecondary}
                  />
                  <Text style={[styles.roleBtnText, role === r && styles.roleBtnTextActive]}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Fields */}
            {[
              { key: 'name', label: 'Full Name', placeholder: 'Your full name', icon: 'person-outline', value: name, setter: setName },
              { key: 'email', label: 'Email Address', placeholder: 'you@college.edu', icon: 'mail-outline', value: email, setter: setEmail, keyboard: 'email-address', autoCapitalize: 'none' },
            ].map(f => (
              <View style={styles.fieldGroup} key={f.key}>
                <Text style={styles.label}>{f.label}</Text>
                <View style={[styles.inputWrap, errors[f.key] ? styles.inputError : undefined]}>
                  <Ionicons name={f.icon as any} size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={f.value}
                    onChangeText={v => { f.setter(v); setErrors(e => ({ ...e, [f.key]: '' })); }}
                    placeholder={f.placeholder}
                    placeholderTextColor={Colors.textMuted}
                    keyboardType={(f as any).keyboard || 'default'}
                    autoCapitalize={(f as any).autoCapitalize || 'words'}
                    testID={"signup_" + f.key}
                    accessibilityLabel={"signup_" + f.key}
                  />
                </View>
                {errors[f.key] ? <Text style={styles.errorText}>{errors[f.key]}</Text> : null}
              </View>
            ))}

            {/* Department */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Department (optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                {DEPARTMENTS.map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.deptChip, department === d && styles.deptChipActive]}
                    onPress={() => setDepartment(department === d ? '' : d)}
                    testID={"signup_dept_" + d.replace(/\s+/g, '_').toLowerCase()}
                  >
                    <Text style={[styles.deptChipText, department === d && styles.deptChipTextActive]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrap, errors.password ? styles.inputError : undefined]}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={v => { setPassword(v); setErrors(e => ({ ...e, password: '' })); }}
                  placeholder="Min. 6 characters"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  testID="signup_password"
                  accessibilityLabel="signup_password"
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={{ padding: 8 }}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[styles.inputWrap, errors.confirm ? styles.inputError : undefined]}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={confirm}
                  onChangeText={v => { setConfirm(v); setErrors(e => ({ ...e, confirm: '' })); }}
                  placeholder="Repeat password"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  testID="signup_confirm_password"
                  accessibilityLabel="signup_confirm_password"
                />
              </View>
              {errors.confirm ? <Text style={styles.errorText}>{errors.confirm}</Text> : null}
            </View>

            <TouchableOpacity style={styles.shadowWrapper} onPress={handleRegister} disabled={loading} activeOpacity={0.85} testID="signup_submit" accessibilityLabel="signup_submit">
              <LinearGradient colors={Gradients.aurora} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.registerGradient}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <>
                      <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                      <Text style={styles.registerText}>Create Account</Text>
                    </>
                }
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginLabel}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.back()} testID="signup_login_link" accessibilityLabel="signup_login_link">
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
  gradient: { flex: 1, backgroundColor: Colors.background, position: 'relative', overflow: 'hidden' },
  blob1: {
    position: 'absolute', top: -100, right: -100, width: 400, height: 400,
    borderRadius: 200, backgroundColor: Colors.primary, opacity: 0.1,
    filter: 'blur(80px)',
  } as any,
  blob2: {
    position: 'absolute', bottom: -50, left: -100, width: 350, height: 350,
    borderRadius: 175, backgroundColor: Colors.accent, opacity: 0.15,
    filter: 'blur(100px)',
  } as any,
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 28, zIndex: 10 },
  backBtn: {
    position: 'absolute', top: 52, left: 20,
    backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 20, padding: 8, zIndex: 10,
    borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm,
  },
  logoCircle: {
    width: 68, height: 68, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    ...Shadow.sm,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, fontWeight: '500' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, zIndex: 10 },
  card: { 
    backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: BorderRadius.xxl, 
    padding: 32, maxWidth: 480, alignSelf: 'center', width: '100%', 
    borderWidth: 1, borderColor: Colors.white, ...Shadow.lg,
    ...(isWeb && { backdropFilter: 'blur(20px)' }),
  } as any,
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.errorLight, borderRadius: BorderRadius.md,
    padding: 12, marginBottom: 16,
  },
  errorBannerText: { color: Colors.error, fontSize: 13, flex: 1 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleBtn: {
    flex: 1, flexDirection: 'column', alignItems: 'center', gap: 6,
    paddingVertical: 16, borderRadius: BorderRadius.md,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  roleBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  roleBtnText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  roleBtnTextActive: { color: Colors.white },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: BorderRadius.md, paddingHorizontal: 14,
    backgroundColor: Colors.background,
  },
  inputIcon: { marginRight: 10 },
  input: { height: 48, fontSize: 15, color: Colors.textPrimary, flex: 1 },
  inputError: { borderColor: Colors.error },
  errorText: { fontSize: 12, color: Colors.error, marginTop: 4 },
  deptChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: BorderRadius.full, borderWidth: 1.5,
    borderColor: Colors.border, marginRight: 8,
    backgroundColor: Colors.white,
  },
  deptChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  deptChipText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  deptChipTextActive: { color: Colors.white },
  shadowWrapper: {
    borderRadius: BorderRadius.xl, overflow: 'hidden', ...Shadow.md, marginTop: 8, shadowColor: Colors.primary,
  },
  registerGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 54,
  },
  registerText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginLabel: { fontSize: 14, color: Colors.textSecondary },
  loginLink: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
});
