import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Gradients } from '../constants/Colors';
import { BorderRadius, Shadow, Spacing } from '../constants/Theme';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const handleCtaPress = () => {
    if (isAuthenticated) {
      if (user?.role === 'admin') router.push('/admin/dashboard');
      else router.push('/student/dashboard');
    } else {
      router.push('/(auth)/login');
    }
  };

  const features = [
    { icon: 'calendar-outline', title: 'Seamless Event Creation', desc: 'Create and manage multiple college events effortlessly with our intuitive admin dashboard.' },
    { icon: 'qr-code-outline', title: 'Smart QR Attendance', desc: 'Generate unique QR codes for instant, contactless attendance tracking at the venue.' },
    { icon: 'ribbon-outline', title: 'Digital Certificates', desc: 'Auto-generate and distribute verifiable digital certificates to participants upon completion.' },
    { icon: 'bar-chart-outline', title: 'Advanced Analytics', desc: 'Gain deep insights into registration trends, attendance rates, and event popularity.' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Navbar with Glassmorphism */}
      <View style={styles.navbar}>
        <View style={styles.navLogo}>
          <LinearGradient colors={Gradients.aurora} style={styles.logoIcon} start={{x:0, y:0}} end={{x:1, y:1}}>
            <Ionicons name="school" size={20} color={Colors.white} />
          </LinearGradient>
          <Text style={styles.logoText}>Smart<Text style={{ color: Colors.primary }}>Events</Text></Text>
        </View>
        
        <View style={styles.navActions}>
          {!isAuthenticated ? (
            <>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')} testID="landing_login_link" accessibilityLabel="landing_login_link">
                <Text style={styles.navLink}>Log In</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <LinearGradient colors={Gradients.aurora} style={styles.navBtn} start={{x:0,y:0}} end={{x:1,y:1}}>
                  <Text style={styles.navBtnText}>Get Started</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={handleCtaPress}>
              <LinearGradient colors={Gradients.aurora} style={styles.navBtn} start={{x:0,y:0}} end={{x:1,y:1}}>
                <Text style={styles.navBtnText}>Dashboard</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Crystal Hero Section */}
        <View style={styles.hero}>
          {/* Abstract Aurora Background Blobs */}
          <View style={styles.blob1} pointerEvents="none" />
          <View style={styles.blob2} pointerEvents="none" />
          
          <View style={styles.heroContent}>
            <View style={styles.badgeGlass}>
              <LinearGradient colors={Gradients.aurora} style={styles.badgeDot} />
              <Text style={styles.badgeText}>The Future of Campus Events is Here</Text>
            </View>
            <Text style={styles.heroTitle}>
              Crystal Clear Event Management
            </Text>
            <Text style={styles.heroSub}>
              Streamline event planning, registrations, attendance tracking, and student engagement through one brilliant platform.
            </Text>
            <View style={styles.heroButtons}>
              <TouchableOpacity style={styles.shadowWrapper} onPress={handleCtaPress} testID="landing_explore_btn" accessibilityLabel="landing_explore_btn">
                <LinearGradient colors={Gradients.aurora} style={styles.primaryBtn} start={{x:0,y:0}} end={{x:1,y:1}}>
                  <Text style={styles.primaryBtnText}>{isAuthenticated ? 'Go to Dashboard' : 'Explore Platform'}</Text>
                  <Ionicons name="arrow-forward" size={18} color={Colors.white} />
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>View Demo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Floating Stats Section */}
        <View style={styles.statsWrapper}>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>10k+</Text>
              <Text style={styles.statLabel}>Active Students</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>500+</Text>
              <Text style={styles.statLabel}>Events Hosted</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>98%</Text>
              <Text style={styles.statLabel}>Attendance Rate</Text>
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTag}>BRILLIANT FEATURES</Text>
          <Text style={styles.sectionTitle}>Everything you need to run successful events</Text>
          
          <View style={styles.featuresGrid}>
            {features.map((feat, idx) => (
              <View key={idx} style={styles.featureCard}>
                <View style={styles.featureIconWrap}>
                  <LinearGradient colors={Gradients.hero} style={[StyleSheet.absoluteFillObject, { borderRadius: 16 }]} />
                  <Ionicons name={feat.icon as any} size={28} color={Colors.primary} />
                </View>
                <Text style={styles.featureTitle}>{feat.title}</Text>
                <Text style={styles.featureDesc}>{feat.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerBrand}>
              <View style={[styles.navLogo, { marginBottom: 16 }]}>
                <Ionicons name="school" size={24} color={Colors.primary} />
                <Text style={[styles.logoText, { fontSize: 20 }]}>Smart<Text style={{ color: Colors.primary }}>Events</Text></Text>
              </View>
              <Text style={styles.footerDesc}>Empowering colleges to create memorable experiences with crystal clear clarity.</Text>
            </View>
            <View style={styles.footerLinks}>
              <Text style={styles.footerLinkTitle}>Product</Text>
              <TouchableOpacity onPress={() => Platform.OS === 'web' ? window.alert('Features coming soon!') : Alert.alert('Coming Soon', 'Features page is under construction.')}>
                <Text style={styles.footerLink}>Features</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Platform.OS === 'web' ? window.alert('Pricing coming soon!') : Alert.alert('Coming Soon', 'Pricing page is under construction.')}>
                <Text style={styles.footerLink}>Pricing</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Platform.OS === 'web' ? window.alert('Security coming soon!') : Alert.alert('Coming Soon', 'Security page is under construction.')}>
                <Text style={styles.footerLink}>Security</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.footerLinks}>
              <Text style={styles.footerLinkTitle}>Company</Text>
              <TouchableOpacity onPress={() => Platform.OS === 'web' ? window.alert('About coming soon!') : Alert.alert('Coming Soon', 'About page is under construction.')}>
                <Text style={styles.footerLink}>About</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Platform.OS === 'web' ? window.alert('Careers coming soon!') : Alert.alert('Coming Soon', 'Careers page is under construction.')}>
                <Text style={styles.footerLink}>Careers</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Platform.OS === 'web' ? window.alert('Contact coming soon!') : Alert.alert('Coming Soon', 'Contact page is under construction.')}>
                <Text style={styles.footerLink}>Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.footerBottom}>
            <Text style={styles.footerCopyright}>© 2026 Smart College Events. All rights reserved.</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scrollContent: { flexGrow: 1, paddingTop: 80 }, // offset for fixed navbar
  navbar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: isWeb ? '10%' : 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(226, 232, 240, 0.5)',
    zIndex: 100,
    ...(isWeb && { backdropFilter: 'blur(12px)' } as any),
  },
  navLogo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', ...Shadow.sm },
  logoText: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  navActions: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  navLink: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  navBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: BorderRadius.full, ...Shadow.md },
  navBtnText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  hero: {
    paddingHorizontal: isWeb ? '10%' : 20,
    paddingTop: 60, paddingBottom: 100,
    alignItems: 'center', position: 'relative', overflow: 'hidden',
  },
  blob1: {
    position: 'absolute', top: -100, left: -50, width: 400, height: 400,
    borderRadius: 200, backgroundColor: Colors.accent, opacity: 0.15,
    ...(isWeb && { filter: 'blur(80px)' } as any),
  },
  blob2: {
    position: 'absolute', bottom: 50, right: -100, width: 500, height: 500,
    borderRadius: 250, backgroundColor: Colors.primary, opacity: 0.1,
    ...(isWeb && { filter: 'blur(100px)' } as any),
  },
  heroContent: { maxWidth: 850, alignItems: 'center', zIndex: 10 },
  badgeGlass: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: Colors.white,
    marginBottom: 24, ...Shadow.sm,
  },
  badgeDot: { width: 8, height: 8, borderRadius: 4 },
  badgeText: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  heroTitle: {
    fontSize: isWeb ? 64 : 40, fontWeight: '800', color: Colors.textPrimary,
    textAlign: 'center', lineHeight: isWeb ? 72 : 48, letterSpacing: -1.5,
    marginBottom: 24,
  },
  heroSub: {
    fontSize: isWeb ? 20 : 16, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 30, maxWidth: 650, marginBottom: 40,
  },
  heroButtons: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', justifyContent: 'center' },
  shadowWrapper: {
    ...Shadow.lg, shadowColor: Colors.primary, // Colored shadow!
  },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 36, paddingVertical: 18,
    borderRadius: BorderRadius.full,
  },
  primaryBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    paddingHorizontal: 36, paddingVertical: 18,
    borderRadius: BorderRadius.full, backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  secondaryBtnText: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600' },
  statsWrapper: { paddingHorizontal: isWeb ? '10%' : 20, marginTop: -50, zIndex: 20 },
  statsContainer: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: BorderRadius.xl, paddingVertical: 32, paddingHorizontal: 20,
    borderWidth: 1, borderColor: Colors.white, ...Shadow.lg, flexWrap: 'wrap', gap: 30,
    ...(isWeb && { backdropFilter: 'blur(20px)' } as any),
  },
  statBox: { alignItems: 'center', minWidth: 120 },
  statNum: { fontSize: 40, fontWeight: '800', color: Colors.primary, marginBottom: 4, letterSpacing: -1 },
  statLabel: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  statDivider: { width: 1, height: 50, backgroundColor: Colors.borderLight },
  featuresSection: {
    paddingHorizontal: isWeb ? '10%' : 20, paddingVertical: 100,
    alignItems: 'center', backgroundColor: Colors.background,
  },
  sectionTag: { color: Colors.primary, fontSize: 13, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12 },
  sectionTitle: { fontSize: 36, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', marginBottom: 60, letterSpacing: -0.5 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 24, maxWidth: 1200 },
  featureCard: {
    width: isWeb ? 260 : '100%', backgroundColor: Colors.white,
    padding: 28, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.white, ...Shadow.md,
  },
  featureIconWrap: { width: 56, height: 56, justifyContent: 'center', alignItems: 'center', marginBottom: 20, overflow: 'hidden' },
  featureTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 },
  featureDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 24 },
  footer: { backgroundColor: Colors.white, paddingTop: 80, paddingBottom: 40, paddingHorizontal: isWeb ? '10%' : 20, borderTopWidth: 1, borderColor: Colors.borderLight },
  footerContent: { flexDirection: isWeb ? 'row' : 'column', justifyContent: 'space-between', gap: 40, maxWidth: 1200, alignSelf: 'center', width: '100%', marginBottom: 60 },
  footerBrand: { flex: 2, minWidth: 250 },
  footerDesc: { color: Colors.textSecondary, lineHeight: 24, fontSize: 15, paddingRight: 40 },
  footerLinks: { flex: 1, minWidth: 120 },
  footerLinkTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: 20 },
  footerLink: { fontSize: 15, color: Colors.textSecondary, marginBottom: 16, fontWeight: '500' },
  footerBottom: { borderTopWidth: 1, borderColor: Colors.borderLight, paddingTop: 30, alignItems: 'center' },
  footerCopyright: { color: Colors.textMuted, fontSize: 14, fontWeight: '500' },
});
