import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Alert, TextInput, Platform, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';
import { Colors, Gradients } from '../../constants/Colors';
import { BorderRadius, Shadow, Spacing } from '../../constants/Theme';
import Badge from '../../components/ui/Badge';

const INFO_FIELDS = [
  { key: 'email', label: 'Email', icon: 'mail-outline' },
  { key: 'rollNumber', label: 'Roll Number', icon: 'card-outline' },
  { key: 'department', label: 'Department', icon: 'business-outline' },
  { key: 'year', label: 'Year', icon: 'school-outline' },
  { key: 'phone', label: 'Phone', icon: 'call-outline' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();
  const { events, isUserRegistered } = useEvents();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ phone: user?.phone || '' });

  if (!user) return null;

  const myEventsCount = events.filter(e => isUserRegistered(e.id, user.id)).length;

  const attended = events.filter(e => user.eventsAttended.includes(e.id));
  const attendanceRate = myEventsCount > 0
    ? Math.round((user.eventsAttended.length / myEventsCount) * 100)
    : 0;

  const handleSave = () => {
    updateUser({ phone: formData.phone });
    setEditing(false);
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) {
        logout();
        router.replace('/');
      }
    } else {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {
          logout();
          router.replace('/');
        }},
      ]);
    }
  };

  const handleNotImplemented = (feature: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${feature} is coming soon!`);
    } else {
      Alert.alert('Coming Soon', `${feature} is coming soon!`);
    }
  };

  const handleAvatarUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0].base64) {
        const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        updateUser({ avatar: base64Uri });
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Failed to pick image');
      } else {
        Alert.alert('Error', 'Failed to pick image');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.webContainer}>
        {/* Profile Header */}
        <LinearGradient colors={Gradients.aurora} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</Text>
              )}
            </View>
            <TouchableOpacity style={styles.editAvatarBtn} onPress={handleAvatarUpload}>
              <Ionicons name="camera" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <Badge label={user.role.toUpperCase()} variant="primary" style={{ alignSelf: 'center', marginTop: 8 }} />
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { value: myEventsCount, label: 'Registered', icon: 'calendar', color: Colors.primary },
            { value: user.eventsAttended.length, label: 'Attended', icon: 'checkbox', color: Colors.success },
            { value: `${attendanceRate}%`, label: 'Rate', icon: 'trending-up', color: Colors.accentOrange },
            { value: user.certificates.length, label: 'Certs', icon: 'ribbon', color: Colors.accentPurple },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Ionicons name={s.icon as any} size={22} color={s.color} />
              <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLab}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Personal Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => editing ? handleSave() : setEditing(true)}
              testID={editing ? "profile_save" : "profile_edit"}
              accessibilityLabel={editing ? "profile_save" : "profile_edit"}
            >
              <Ionicons name={editing ? 'checkmark' : 'pencil'} size={16} color={Colors.primary} />
              <Text style={styles.editBtnText}>{editing ? 'Save' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoCard}>
            {INFO_FIELDS.map(field => (
              <View key={field.key} style={styles.infoRow}>
                <View style={styles.infoIconWrap}>
                  <Ionicons name={field.icon as any} size={18} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>{field.label}</Text>
                  {field.key === 'phone' && editing ? (
                    <TextInput
                      style={styles.infoEdit}
                      value={formData.phone}
                      onChangeText={v => setFormData(p => ({ ...p, phone: v }))}
                      placeholder="Enter phone number"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="phone-pad"
                      testID="profile_phone_input"
                      accessibilityLabel="profile_phone_input"
                    />
                  ) : (
                    <Text style={styles.infoValue}>{(user as any)[field.key] || '—'}</Text>
                  )}
                </View>
              </View>
            ))}
            <View style={styles.infoRow}>
              <View style={styles.infoIconWrap}>
                <Ionicons name="time-outline" size={18} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  {new Date(user.joinedAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Participation History */}
        {attended.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Participation History</Text>
            {attended.map(event => (
              <View key={event.id} style={styles.historyRow}>
                <View style={styles.historyBullet} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyTitle}>{event.title}</Text>
                  <Text style={styles.historyDate}>
                    {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <Badge label="Attended" variant="success" size="sm" />
              </View>
            ))}
          </View>
        )}

        {/* Badges */}
        {user.badges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏅 Badges Earned</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {user.badges.map(badge => (
                <View key={badge.id} style={styles.badgeItem}>
                  <View style={[styles.badgeCircle, { backgroundColor: badge.color + '20' }]}>
                    <Ionicons name={badge.icon as any} size={28} color={badge.color} />
                  </View>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsCard}>
            {[
              { icon: 'notifications-outline', label: 'Notification Preferences', color: Colors.primary },
              { icon: 'shield-outline', label: 'Privacy & Security', color: Colors.accentPurple },
              { icon: 'help-circle-outline', label: 'Help & Support', color: Colors.accentTeal },
              { icon: 'information-circle-outline', label: 'About SmartEvents', color: Colors.accentGreen },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={[styles.settingsRow, i > 0 && styles.settingsBorder]} onPress={() => handleNotImplemented(item.label)}>
                <View style={[styles.settingsIcon, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={styles.settingsLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <View style={[styles.section, { paddingBottom: 40 }]}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85} testID="logout_button" accessibilityLabel="logout_button">
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>SmartEvents v1.0.0 — Smart College Event System</Text>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  webContainer: { width: '100%', maxWidth: 1000, alignSelf: 'center' },
  heroSection: { padding: Spacing.lg, paddingTop: 50, alignItems: 'center', paddingBottom: 40, borderBottomLeftRadius: BorderRadius.xxl, borderBottomRightRadius: BorderRadius.xxl },
  avatarContainer: { position: 'relative', marginBottom: 14 },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 45 },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  editAvatarBtn: {
    position: 'absolute', bottom: -2, right: -2,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center',
    ...Shadow.md,
    borderWidth: 2, borderColor: '#4da6ff',
  },
  profileName: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 4, letterSpacing: -0.5 },
  profileEmail: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.95)', marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl, padding: 16, marginTop: -20, ...Shadow.lg,
    borderWidth: 1, borderColor: Colors.borderLight,
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(10px)' } as any),
  },
  statItem: { alignItems: 'center', gap: 4 },
  statVal: { fontSize: 20, fontWeight: '800' },
  statLab: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  section: { paddingHorizontal: Spacing.md, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primaryUltraLight,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: BorderRadius.full,
  },
  editBtnText: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  infoCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight, overflow: 'hidden' },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  infoIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.primaryUltraLight,
    justifyContent: 'center', alignItems: 'center',
  },
  infoLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 14, color: Colors.textPrimary, fontWeight: '600' },
  infoEdit: {
    fontSize: 14, color: Colors.textPrimary, fontWeight: '600',
    borderBottomWidth: 1.5, borderBottomColor: Colors.primary, paddingBottom: 2,
  },
  historyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    padding: 14, marginBottom: 8, ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight,
  },
  historyBullet: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.success },
  historyTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  historyDate: { fontSize: 11, color: Colors.textMuted },
  badgeItem: { alignItems: 'center', marginRight: 16 },
  badgeCircle: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  badgeName: { fontSize: 11, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', maxWidth: 64 },
  settingsCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight, overflow: 'hidden' },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  settingsBorder: { borderTopWidth: 1, borderTopColor: Colors.borderLight },
  settingsIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  settingsLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.errorLight, borderRadius: BorderRadius.xl,
    padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.error + '30',
  },
  logoutText: { fontSize: 16, fontWeight: '800', color: Colors.error },
  versionText: { fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
});
