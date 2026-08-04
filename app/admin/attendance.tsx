import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Alert, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useEvents } from '../../context/EventContext';
import { Colors, Gradients } from '../../constants/Colors';
import { BorderRadius, Shadow, Spacing } from '../../constants/Theme';

export default function AttendanceScreen() {
  const router = useRouter();
  const { events, markAttendance } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const upcomingEvents = events.filter(e => e.status === 'upcoming' || e.status === 'ongoing');
  const selectedEvent = selectedEventId ? events.find(e => e.id === selectedEventId) : null;

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleMark = async (userId: string, userName: string) => {
    if (!selectedEvent) return;
    setMarkingId(userId);
    try {
      await markAttendance(selectedEvent.id, userId);
      showToast('success', `✅ ${userName} marked present!`);
    } catch {
      showToast('error', '❌ Failed to mark attendance');
    } finally {
      setMarkingId(null);
    }
  };

  const handleSimulate = async () => {
    if (!selectedEvent) return;
    const unattended = selectedEvent.registrations.find(r => !r.attended);
    if (!unattended) {
      if (Platform.OS === 'web') {
        window.alert('All attendees already marked!');
      } else {
        Alert.alert('Done', 'All attendees already marked!');
      }
      return;
    }
    await handleMark(unattended.userId, unattended.userName);
  };

  const registered = selectedEvent?.registeredCount ?? 0;
  const attended = selectedEvent?.attendees?.length ?? 0;
  const pending = registered - attended;
  const rate = registered > 0 ? Math.round((attended / registered) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.webContainer}>

        {/* Header */}
        <LinearGradient colors={Gradients.aurora} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} testID="admin_attendance_back" accessibilityLabel="admin_attendance_back">
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QR Attendance</Text>
          <Text style={styles.headerSub}>Scan student QR codes for check-in</Text>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Toast */}
          {toast && (
            <View style={[styles.toast, { backgroundColor: toast.type === 'success' ? Colors.successLight : Colors.errorLight }]}>
              <Text style={[styles.toastText, { color: toast.type === 'success' ? Colors.success : Colors.error }]}>
                {toast.msg}
              </Text>
            </View>
          )}

          {/* Select Event */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Event</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {upcomingEvents.length === 0 && (
                <Text style={{ color: Colors.textMuted, fontSize: 13 }}>No upcoming events found.</Text>
              )}
              {upcomingEvents.map(event => (
                <TouchableOpacity
                  key={event.id}
                  style={[styles.eventChip, selectedEventId === event.id && styles.eventChipActive]}
                  onPress={() => setSelectedEventId(event.id)}
                  testID={"admin_attendance_event_" + event.id}
                  accessibilityLabel={"admin_attendance_event_" + event.id}
                >
                  <Text style={[styles.eventChipText, selectedEventId === event.id && styles.eventChipTextActive]} numberOfLines={1}>
                    {event.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* No event selected placeholder */}
          {!selectedEvent && (
            <View style={styles.emptyState}>
              <Ionicons name="scan-outline" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Select an Event</Text>
              <Text style={styles.emptyBody}>Choose an event above to start tracking attendance</Text>
            </View>
          )}

          {/* Event selected */}
          {selectedEvent && (
            <>
              {/* Stats */}
              <View style={styles.statsRow}>
                {[
                  { label: 'Registered', value: registered, color: Colors.primary, icon: 'people' },
                  { label: 'Attended', value: attended, color: Colors.success, icon: 'checkbox' },
                  { label: 'Pending', value: pending, color: Colors.warning, icon: 'hourglass' },
                  { label: 'Rate', value: `${rate}%`, color: Colors.accentPurple, icon: 'trending-up' },
                ].map((s, i) => (
                  <View key={i} style={styles.statCard}>
                    <Ionicons name={s.icon as any} size={22} color={s.color} />
                    <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>

              {/* QR Frame */}
              <View style={styles.scanSection}>
                <Text style={styles.sectionTitle}>📷 Scan QR Code</Text>
                <View style={styles.qrFrame}>
                  <View style={[styles.corner, styles.tl]} />
                  <View style={[styles.corner, styles.tr]} />
                  <View style={[styles.corner, styles.bl]} />
                  <View style={[styles.corner, styles.br]} />
                  <Ionicons name="scan-outline" size={100} color="rgba(77,166,255,0.35)" />
                </View>
                <Text style={styles.qrHint}>Position student QR code within the frame</Text>

                {/* Simulate Button */}
                <TouchableOpacity style={styles.demoBtn} onPress={handleSimulate} activeOpacity={0.85} testID="admin_attendance_simulate" accessibilityLabel="admin_attendance_simulate">
                  <LinearGradient colors={Gradients.aurora} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.demoBtnGrad}>
                    <Ionicons name="qr-code-outline" size={20} color="#fff" />
                    <Text style={styles.demoBtnText}>Simulate QR Scan (Demo)</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Registration List */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>👥 Registration List</Text>
                {selectedEvent.registrations.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="people-outline" size={40} color={Colors.textMuted} />
                    <Text style={styles.emptyBody}>No registrations for this event</Text>
                  </View>
                ) : (
                  selectedEvent.registrations.map(reg => (
                    <View key={reg.id || reg.userId} style={styles.regRow}>
                      <View style={[styles.regAvatar, reg.attended && styles.regAvatarAttended]}>
                        <Text style={[styles.regAvatarText, reg.attended && { color: Colors.success }]}>
                          {reg.userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.regName}>{reg.userName}</Text>
                        <Text style={styles.regDept}>{reg.department ?? ''}{reg.department ? ' • ' : ''}{reg.userEmail}</Text>
                      </View>
                      {reg.attended ? (
                        <View style={styles.presentBadge}>
                          <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                          <Text style={styles.presentText}>Present</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[styles.markBtn, markingId === reg.userId && styles.markBtnLoading]}
                          onPress={() => handleMark(reg.userId, reg.userName)}
                          disabled={markingId === reg.userId}
                          testID={"admin_attendance_mark_" + reg.userId}
                          accessibilityLabel={"admin_attendance_mark_" + reg.userId}
                        >
                          <Text style={styles.markBtnText}>
                            {markingId === reg.userId ? 'Marking…' : 'Mark ✓'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))
                )}
              </View>
            </>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  webContainer: { width: '100%', maxWidth: 1000, alignSelf: 'center', flex: 1 },
  header: {
    padding: Spacing.md, paddingTop: 50, paddingBottom: 24,
    alignItems: 'center',
    borderBottomLeftRadius: BorderRadius.xxl, borderBottomRightRadius: BorderRadius.xxl,
  },
  backBtn: {
    position: 'absolute', top: 50, left: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 20, padding: 8,
    borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 4, fontWeight: '500' },
  toast: {
    margin: Spacing.md, padding: 14, borderRadius: BorderRadius.xl,
    flexDirection: 'row', alignItems: 'center',
  },
  toastText: { fontSize: 14, fontWeight: '700', flex: 1 },
  section: { paddingHorizontal: Spacing.md, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 16 },
  eventChip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: BorderRadius.full, borderWidth: 1.5,
    borderColor: Colors.border, backgroundColor: Colors.white, maxWidth: 200,
  },
  eventChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  eventChipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  eventChipTextActive: { color: '#fff' },
  statsRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.md,
    marginTop: 20, gap: 10,
  },
  statCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    padding: 12, alignItems: 'center', gap: 4,
    ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight,
  },
  statVal: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600', textAlign: 'center' },
  scanSection: { paddingHorizontal: Spacing.md, marginTop: 24, alignItems: 'center' },
  qrFrame: {
    width: 220, height: 220,
    backgroundColor: Colors.primaryUltraLight,
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    position: 'relative', marginBottom: 12,
  },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: Colors.primary, borderWidth: 3 },
  tl: { top: 10, left: 10, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
  tr: { top: 10, right: 10, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
  bl: { bottom: 10, left: 10, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
  br: { bottom: 10, right: 10, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },
  qrHint: { fontSize: 13, color: Colors.textMuted, marginBottom: 16, textAlign: 'center' },
  demoBtn: { width: '100%', borderRadius: BorderRadius.xl, overflow: 'hidden', ...Shadow.md },
  demoBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 54 },
  demoBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  regRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    padding: 14, marginBottom: 12,
    ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight,
  },
  regAvatar: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: Colors.primaryUltraLight,
    justifyContent: 'center', alignItems: 'center',
  },
  regAvatarAttended: { backgroundColor: Colors.successLight },
  regAvatarText: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  regName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  regDept: { fontSize: 12, color: Colors.textMuted },
  presentBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  presentText: { fontSize: 12, fontWeight: '700', color: Colors.success },
  markBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  markBtnLoading: { backgroundColor: Colors.textMuted, opacity: 0.6 },
  markBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  emptyBody: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
});
