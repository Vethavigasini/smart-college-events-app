import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Alert, Dimensions, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';
import { Colors, Gradients } from '../../constants/Colors';
import { BorderRadius, Shadow, Spacing } from '../../constants/Theme';
import Badge from '../../components/ui/Badge';

const { width } = Dimensions.get('window');

function MetricCard({ icon, value, label, color, sub }: { icon: string; value: string | number; label: string; color: string; sub?: string }) {
  return (
    <View style={[mStyles.card, { borderLeftColor: color }]}>
      <View style={[mStyles.iconWrap, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={mStyles.value}>{value}</Text>
      <Text style={mStyles.label}>{label}</Text>
      {sub && <Text style={mStyles.sub}>{sub}</Text>}
    </View>
  );
}

const mStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: 16, flex: 1, borderLeftWidth: 4, ...Shadow.sm,
  },
  iconWrap: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  value: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  label: { fontSize: 12, color: Colors.textMuted, fontWeight: '600', marginTop: 2 },
  sub: { fontSize: 11, color: Colors.success, fontWeight: '700', marginTop: 4 },
});

const CATEGORY_CONFIG = [
  { label: 'Technology', short: 'Tech', emoji: '💻', color: '#4A90E2', bg: '#EEF4FE', key: 'Technology' },
  { label: 'Cultural', short: 'Cultural', emoji: '🎭', color: '#E85D75', bg: '#FEF0F3', key: 'Cultural' },
  { label: 'Sports', short: 'Sports', emoji: '🏆', color: '#27AE60', bg: '#EDFBF4', key: 'Sports' },
  { label: 'Academic', short: 'Academic', emoji: '📚', color: '#8E44AD', bg: '#F5EFFE', key: 'Academic' },
  { label: 'Workshop', short: 'Workshop', emoji: '🔧', color: '#E67E22', bg: '#FEF5EC', key: 'Workshop' },
  { label: 'Hackathon', short: 'Hackathon', emoji: '⚡', color: '#16A085', bg: '#E8F8F5', key: 'Hackathon' },
];

function CreativeCategoryChart({ events }: { events: any[] }) {
  const total = events.length || 1;
  return (
    <View style={ccStyles.grid}>
      {CATEGORY_CONFIG.map((cat, i) => {
        const count = events.filter(e => e.category === cat.key).length;
        const pct = Math.round((count / total) * 100);
        return (
          <View key={i} style={[ccStyles.card, { borderTopColor: cat.color, backgroundColor: cat.bg }]}>
            <View style={[ccStyles.emojiWrap, { backgroundColor: cat.color + '20' }]}>
              <Text style={ccStyles.emoji}>{cat.emoji}</Text>
            </View>
            <Text style={[ccStyles.count, { color: cat.color }]}>{count}</Text>
            <Text style={ccStyles.catLabel}>{cat.short}</Text>
            <View style={ccStyles.barBg}>
              <View style={[ccStyles.barFill, { width: `${Math.max(pct, count > 0 ? 10 : 0)}%` as any, backgroundColor: cat.color }]} />
            </View>
            <Text style={[ccStyles.pctLabel, { color: cat.color }]}>{pct}%</Text>
          </View>
        );
      })}
    </View>
  );
}

const ccStyles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '30%', minWidth: 90, flex: 1,
    backgroundColor: '#F5F8FF',
    borderRadius: 16, padding: 12,
    borderTopWidth: 3, alignItems: 'center',
    ...Shadow.sm,
  },
  emojiWrap: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  emoji: { fontSize: 22 },
  count: { fontSize: 28, fontWeight: '900', lineHeight: 32 },
  catLabel: { fontSize: 10, fontWeight: '700', color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  barBg: { width: '100%', height: 5, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  barFill: { height: '100%', borderRadius: 4 },
  pctLabel: { fontSize: 10, fontWeight: '800' },
});

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { events, deleteEvent } = useEvents();

  const totalRegistrations = events.reduce((sum, e) => sum + e.registeredCount, 0);
  const totalAttendance = events.reduce((sum, e) => sum + e.attendees.length, 0);
  const upcomingCount = events.filter(e => e.status === 'upcoming').length;
  const completedCount = events.filter(e => e.status === 'completed').length;
  const attendanceRate = totalRegistrations > 0 ? Math.round((totalAttendance / totalRegistrations) * 100) : 0;

  // categoryData no longer used (replaced by CreativeCategoryChart)

  const recentEvents = [...events].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const handleDeleteEvent = (eventId: string, eventTitle: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
        deleteEvent(eventId);
      }
    } else {
      Alert.alert('Delete Event', `Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteEvent(eventId) },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.webContainer}>
          {/* Header */}
          <LinearGradient colors={Gradients.aurora} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.adminLabel}>Admin Dashboard</Text>
                <Text style={styles.adminName}>{user?.name}</Text>
                <Text style={styles.adminDept}>{user?.department || 'Event Management Cell'}</Text>
              </View>
              <TouchableOpacity style={styles.logoutBtn} onPress={() => {
                if (Platform.OS === 'web') {
                  if (window.confirm('Are you sure you want to logout?')) {
                    logout();
                    router.replace('/');
                  }
                } else {
                  Alert.alert('Logout', 'Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Logout', style: 'destructive', onPress: () => {
                    logout();
                    router.replace('/');
                  } }]);
                }
              }}>
                <Ionicons name="log-out-outline" size={22} color="rgba(255,255,255,0.9)" />
              </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/admin/create-event')} activeOpacity={0.85} testID="admin_quick_create_event" accessibilityLabel="admin_quick_create_event">
                <LinearGradient colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']} style={styles.qaGrad}>
                  <Ionicons name="add-circle-outline" size={28} color="#fff" />
                  <Text style={styles.qaLabel}>Create Event</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/admin/attendance')} activeOpacity={0.85} testID="admin_quick_attendance" accessibilityLabel="admin_quick_attendance">
                <LinearGradient colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']} style={styles.qaGrad}>
                  <Ionicons name="scan-outline" size={28} color="#fff" />
                  <Text style={styles.qaLabel}>QR Attendance</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/admin/analytics')} activeOpacity={0.85} testID="admin_quick_analytics" accessibilityLabel="admin_quick_analytics">
                <LinearGradient colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']} style={styles.qaGrad}>
                  <Ionicons name="bar-chart-outline" size={28} color="#fff" />
                  <Text style={styles.qaLabel}>Analytics</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/admin/users')} activeOpacity={0.85} testID="admin_quick_users" accessibilityLabel="admin_quick_users">
                <LinearGradient colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']} style={styles.qaGrad}>
                  <Ionicons name="people-outline" size={28} color="#fff" />
                  <Text style={styles.qaLabel}>Users</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Metrics */}
        <View style={styles.metricsSection}>
          <View style={styles.metricsRow}>
            <MetricCard icon="calendar" value={events.length} label="Total Events" color={Colors.primary} sub={`${upcomingCount} upcoming`} />
            <MetricCard icon="people" value={totalRegistrations} label="Registrations" color={Colors.accentPurple} />
          </View>
          <View style={styles.metricsRow}>
            <MetricCard icon="checkbox" value={totalAttendance} label="Attendance" color={Colors.success} sub={`${attendanceRate}% rate`} />
            <MetricCard icon="checkmark-done" value={completedCount} label="Completed" color={Colors.accentOrange} />
          </View>
        </View>

        {/* Category Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Events by Category</Text>
          <CreativeCategoryChart events={events} />
        </View>

        {/* Event Management Table */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 All Events</Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/admin/create-event')} testID="admin_create_event" accessibilityLabel="admin_create_event">
              <Ionicons name="add" size={18} color={Colors.white} />
              <Text style={styles.createBtnText}>New</Text>
            </TouchableOpacity>
          </View>
          {recentEvents.map(event => (
            <View key={event.id} style={styles.eventRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                <View style={styles.eventMeta}>
                  <Badge
                    label={event.status}
                    variant={event.status === 'upcoming' ? 'success' : event.status === 'completed' ? 'neutral' : 'info'}
                    size="sm"
                  />
                  <Text style={styles.eventStat}>{event.registeredCount}/{event.capacity} regs</Text>
                </View>
              </View>
              <View style={styles.eventActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/event/${event.id}` as any)} testID={"admin_view_event_" + event.id} accessibilityLabel={"admin_view_event_" + event.id}>
                  <Ionicons name="eye-outline" size={18} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/admin/create-event?editId=${event.id}` as any)} testID={"admin_update_event_" + event.id} accessibilityLabel={"admin_update_event_" + event.id}>
                  <Ionicons name="pencil-outline" size={18} color={Colors.warning} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteEvent(event.id, event.title)} testID={"admin_delete_event_" + event.id} accessibilityLabel={"admin_delete_event_" + event.id}>
                  <Ionicons name="trash-outline" size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Registration List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Recent Registrations</Text>
          {events.flatMap(e => e.registrations).slice(0, 8).map(reg => (
            <View key={reg.id} style={styles.regRow}>
              <View style={styles.regAvatar}>
                <Text style={styles.regAvatarText}>{reg.userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.regName}>{reg.userName}</Text>
                <Text style={styles.regDept}>{reg.department} • {reg.userEmail}</Text>
              </View>
              <Badge label={reg.status} variant={reg.status === 'confirmed' ? 'success' : 'warning'} size="sm" />
            </View>
          ))}
        </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  webContainer: { width: '100%', maxWidth: 1200, alignSelf: 'center', paddingBottom: 40 },
  header: { padding: Spacing.md, paddingTop: 50, paddingBottom: 24, borderBottomLeftRadius: BorderRadius.xxl, borderBottomRightRadius: BorderRadius.xxl },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  adminLabel: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  adminName: { fontSize: 26, fontWeight: '800', color: '#fff', marginTop: 2, letterSpacing: -0.5 },
  adminDept: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: '500' },
  logoutBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, ...Shadow.sm },
  quickActions: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  quickAction: { flex: 1, borderRadius: BorderRadius.lg, overflow: 'hidden', ...Shadow.sm },
  qaGrad: { alignItems: 'center', gap: 6, paddingVertical: 14, paddingHorizontal: 6 },
  qaLabel: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '700', textAlign: 'center' },
  metricsSection: { padding: Spacing.md, gap: 10, marginTop: 8 },
  metricsRow: { flexDirection: 'row', gap: 10 },
  section: { paddingHorizontal: Spacing.md, marginTop: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12, letterSpacing: -0.2 },
  chartCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: 16, ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  createBtnText: { fontSize: 13, color: '#fff', fontWeight: '700' },
  eventRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    padding: 14, marginBottom: 12, ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight,
  },
  eventTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eventStat: { fontSize: 12, color: Colors.textMuted },
  eventActions: { flexDirection: 'row', gap: 4 },
  actionBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: Colors.background,
    justifyContent: 'center', alignItems: 'center',
  },
  regRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    padding: 12, marginBottom: 10, ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight,
  },
  regAvatar: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: Colors.primaryUltraLight,
    justifyContent: 'center', alignItems: 'center',
  },
  regAvatarText: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  regName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  regDept: { fontSize: 12, color: Colors.textMuted },
});
