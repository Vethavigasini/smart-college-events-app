import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors, Gradients } from '../../constants/Colors';
import { BorderRadius, Shadow, Spacing } from '../../constants/Theme';
import { DEMO_CREDENTIALS } from '../../data/mockData';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (!result.success) {
      setErrors({ general: result.error || 'Login failed. Please try again.' });
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

  const fillDemo = (role: 'student' | 'admin' | 'faculty') => {
    const cred = DEMO_CREDENTIALS[role];
    setEmail(cred.email);
    setPassword(cred.password);
    setErrors({});
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, width: '100%' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.gradient}>
        {/* Colorful Abstract background blobs */}
        {isWeb && <View style={styles.blob1} pointerEvents="none" />}
        {isWeb && <View style={styles.blob2} pointerEvents="none" />}

        {/* Header */}
        <View style={styles.headerSection}>
          <LinearGradient colors={Gradients.aurora} style={styles.logoCircle}>
            <Ionicons name="school" size={36} color={Colors.white} />
          </LinearGradient>
          <Text style={styles.appName}>Smart<Text style={{ color: Colors.primary }}>Events</Text></Text>
          <Text style={styles.tagline}>College Event Management System</Text>
        </View>

        {/* Card */}
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back 👋</Text>
            <Text style={styles.cardSubtitle}>Sign in to your account</Text>

            {/* Demo Buttons */}
            <View style={styles.demoRow}>
              <Text style={styles.demoLabel}>Quick Demo:</Text>
              <TouchableOpacity style={styles.demoBtn} onPress={() => fillDemo('student')} testID="demo_student" accessibilityLabel="demo_student">
                <Ionicons name="person" size={13} color={Colors.primary} />
                <Text style={styles.demoBtnText}>Student</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.demoBtn, styles.demoBtnAdmin]} onPress={() => fillDemo('admin')} testID="demo_admin" accessibilityLabel="demo_admin">
                <Ionicons name="shield-checkmark" size={13} color={Colors.accentPurple} />
                <Text style={[styles.demoBtnText, { color: Colors.accentPurple }]}>Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.demoBtn, styles.demoBtnFaculty]} onPress={() => fillDemo('faculty')} testID="demo_faculty" accessibilityLabel="demo_faculty">
                <Ionicons name="school" size={13} color={Colors.accentTeal} />
                <Text style={[styles.demoBtnText, { color: Colors.accentTeal }]}>Faculty</Text>
              </TouchableOpacity>
            </View>

            {errors.general && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color={Colors.error} />
                <Text style={styles.errorBannerText}>{errors.general}</Text>
              </View>
            )}

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputWrap, errors.email ? styles.inputError : undefined]}>
                <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={v => { setEmail(v); setErrors(e => ({ ...e, email: undefined })); }}
                  placeholder="your.email@gmail.com"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  testID="login_email"
                  accessibilityLabel="login_email"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrap, errors.password ? styles.inputError : undefined]}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={v => { setPassword(v); setErrors(e => ({ ...e, password: undefined })); }}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  testID="login_password"
                  accessibilityLabel="login_password"
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity style={styles.shadowWrapper} onPress={handleLogin} disabled={loading} activeOpacity={0.85} testID="login_submit" accessibilityLabel="login_submit">
              <LinearGradient colors={Gradients.aurora} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loginGradient}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <>
                      <Ionicons name="log-in-outline" size={20} color="#fff" />
                      <Text style={styles.loginText}>Sign In</Text>
                    </>
                }
              </LinearGradient>
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerLabel}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')} testID="login_signup_link" accessibilityLabel="login_signup_link">
                <Text style={styles.registerLink}>Create Account</Text>
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
    position: 'absolute', top: -100, left: -100, width: 300, height: 300,
    borderRadius: 150, backgroundColor: Colors.accent, opacity: 0.15,
    filter: 'blur(80px)',
  } as any,
  blob2: {
    position: 'absolute', bottom: 100, right: -100, width: 400, height: 400,
    borderRadius: 200, backgroundColor: Colors.primary, opacity: 0.15,
    filter: 'blur(100px)',
  } as any,
  headerSection: { alignItems: 'center', paddingTop: 60, paddingBottom: 32, zIndex: 10 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    ...Shadow.sm,
  },
  appName: { fontSize: 32, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, fontWeight: '500' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, zIndex: 10 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: BorderRadius.xxl,
    padding: 32,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
    borderWidth: 1, borderColor: Colors.white,
    ...Shadow.lg,
    ...(isWeb && { backdropFilter: 'blur(20px)' }),
  } as any,
  cardTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 20 },
  demoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  demoLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  demoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primaryUltraLight, borderRadius: BorderRadius.full,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  demoBtnAdmin: { backgroundColor: '#EEF2FF' }, // Match indigo tone of accentPurple
  demoBtnFaculty: { backgroundColor: '#ECFEFF' }, // Match cyan tone of accentTeal
  demoBtnText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.errorLight, borderRadius: BorderRadius.md,
    padding: 12, marginBottom: 16,
  },
  errorBannerText: { color: Colors.error, fontSize: 13, fontWeight: '500', flex: 1 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: BorderRadius.md, paddingHorizontal: 14, backgroundColor: Colors.background,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 48, fontSize: 15, color: Colors.textPrimary },
  inputError: { borderColor: Colors.error },
  eyeBtn: { padding: 8 },
  errorText: { fontSize: 12, color: Colors.error, marginTop: 4 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  shadowWrapper: {
    ...Shadow.md, shadowColor: Colors.primary, borderRadius: BorderRadius.xl, overflow: 'hidden',
  },
  loginGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, height: 54,
  },
  loginText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerLabel: { fontSize: 14, color: Colors.textSecondary },
  registerLink: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
});
