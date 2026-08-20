import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, SafeAreaView, ActivityIndicator, Image, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useEvents } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Colors, Gradients } from '../../constants/Colors';
import { BorderRadius, Shadow, Spacing } from '../../constants/Theme';
import Badge from '../../components/ui/Badge';
import CountdownTimer from '../../components/ui/CountdownTimer';

const CATEGORY_COLORS: Record<string, string> = {
  Technology: Colors.categoryTech,
  Cultural: Colors.categoryCultural,
  Sports: Colors.categorySports,
  Academic: Colors.categoryAcademic,
  Workshop: Colors.categoryWorkshop,
  Other: Colors.categoryOther,
};
const CATEGORY_EMOJI: Record<string, string> = {
  Technology: '💻', Cultural: '🎭', Sports: '🏆', Academic: '📚', Workshop: '🔧', Other: '🌟',
};

function InfoRow({ icon, label, value, color }: { icon: string; label: string; value: string; color?: string }) {
  return (
    <View style={dStyles.infoRow}>
      <View style={[dStyles.infoIcon, { backgroundColor: (color || Colors.primary) + '15' }]}>
        <Ionicons name={icon as any} size={18} color={color || Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={dStyles.infoLabel}>{label}</Text>
        <Text style={dStyles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const dStyles = StyleSheet.create({
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 14 },
  infoIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  infoLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 14, color: Colors.textPrimary, fontWeight: '600', lineHeight: 20 },
});

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getEvent, registerForEvent, isUserRegistered, cancelRegistration, fetchEventById } = useEvents();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [showModal, setShowModal] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [phone, setPhone] = useState(user?.phone || '');
  const [paymentScreenshot, setPaymentScreenshot] = useState('');
  
  // Start with context event, then fetch full event (which includes paymentQrCode)
  const [event, setEvent] = useState(getEvent(id));
  
  React.useEffect(() => {
    fetchEventById(id).then(fullEvent => {
      if (fullEvent) setEvent(fullEvent);
    });
  }, [id]);
  const isRegistered = user ? isUserRegistered(id, user.id) : false;
  const isFull = event ? event.registeredCount >= event.capacity : false;
  const catColor = event ? CATEGORY_COLORS[event.category] || Colors.primary : Colors.primary;

  if (!event) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <Ionicons name="alert-circle-outline" size={56} color={Colors.textMuted} />
        <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginTop: 12 }}>Event not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: Colors.primary, fontWeight: '700' }}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleRegister = async () => {
    if (!user) return;
    setRegLoading(true);
    const result = await registerForEvent(event.id, user.id, {
      userName: user.name,
      userEmail: user.email,
      userPhone: phone,
      department: user.department,
      paymentScreenshot,
    });
    setRegLoading(false);
    setShowModal(false);

    if (result.success) {
      addNotification({
        title: 'Registration Confirmed! 🎉',
        message: `You're now registered for ${event.title}. See you there!`,
        type: 'registration',
        eventId: event.id,
        read: false,
      });
      if (Platform.OS === 'web') {
        window.alert(`🎉 Registered! You've successfully registered for ${event.title}.`);
      } else {
        Alert.alert('🎉 Registered!', `You've successfully registered for ${event.title}. Check your notifications for updates!`);
      }
    } else {
      if (Platform.OS === 'web') {
        window.alert(`Registration Failed: ${result.error || 'Something went wrong.'}`);
      } else {
        Alert.alert('Registration Failed', result.error || 'Something went wrong.');
      }
    }
  };

  const handleCancel = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to cancel your registration?')) {
        cancelRegistration(event.id, user!.id);
      }
    } else {
      Alert.alert('Cancel Registration', 'Are you sure you want to cancel your registration?', [
        { text: 'Keep Registration', style: 'cancel' },
        { text: 'Cancel Registration', style: 'destructive', onPress: () => { cancelRegistration(event.id, user!.id); } },
      ]);
    }
  };

  const pickScreenshot = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPaymentScreenshot(result.assets[0].uri);
    }
  };

  const fillPercent = Math.min(100, (event.registeredCount / event.capacity) * 100);

  return (
    <SafeAreaView style={styles.container}>
      {/* Registration Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setShowModal(false)} activeOpacity={1} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Register for Event</Text>
            <Text style={styles.modalSubtitle}>{event.title}</Text>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Full Name</Text>
              <View style={styles.modalInput}>
                <Ionicons name="person-outline" size={18} color={Colors.textMuted} />
                <Text style={styles.modalPrefilled}>{user?.name}</Text>
              </View>
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Email</Text>
              <View style={styles.modalInput}>
                <Ionicons name="mail-outline" size={18} color={Colors.textMuted} />
                <Text style={styles.modalPrefilled}>{user?.email}</Text>
              </View>
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Phone Number</Text>
              <View style={styles.modalInputEdit}>
                <Ionicons name="call-outline" size={18} color={Colors.textMuted} style={{ marginRight: 10 }} />
                <TextInput
                  style={{ flex: 1, fontSize: 15, color: Colors.textPrimary }}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+91 XXXXX XXXXX"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="phone-pad"
                  testID="event_registration_phone"
                  accessibilityLabel="event_registration_phone"
                />
              </View>
            </View>

            {event.price > 0 && (
              <View style={styles.priceSummary}>
                <Ionicons name="wallet-outline" size={16} color={Colors.warning} />
                <Text style={styles.priceSummaryText}>Registration Fee: <Text style={{ fontWeight: '800', color: Colors.textPrimary }}>₹{event.price}</Text></Text>
              </View>
            )}

            {event.price > 0 && event.paymentQrCode && (
              <View style={styles.qrSection}>
                <Text style={styles.modalLabel}>Scan to Pay</Text>
                <Image source={{ uri: event.paymentQrCode }} style={styles.studentQr} />
                <TouchableOpacity style={styles.screenshotBtn} onPress={pickScreenshot}>
                  {paymentScreenshot ? (
                    <Image source={{ uri: paymentScreenshot }} style={styles.screenshotPreview} />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={20} color={Colors.primary} />
                      <Text style={styles.screenshotBtnText}>Upload Payment Screenshot</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[styles.modalRegBtn, (event.price > 0 && !paymentScreenshot) && styles.modalRegBtnDisabled]}
              onPress={handleRegister}
              disabled={regLoading || (event.price > 0 && !paymentScreenshot)}
              activeOpacity={0.85}
              testID="event_registration_submit"
              accessibilityLabel="event_registration_submit"
            >
              <LinearGradient colors={Gradients.aurora} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modalRegGrad}>
                {regLoading ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={styles.modalRegText}>Confirm Registration</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.webContainer}>
        {/* Color Header */}
        <View style={[styles.eventHeader, { backgroundColor: catColor }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} testID="event_detail_back" accessibilityLabel="event_detail_back">
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.categoryEmoji}>{CATEGORY_EMOJI[event.category]}</Text>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={styles.headerBadges}>
            <Badge label={event.category} variant="primary" />
            <Badge label={event.price === 0 ? '🎉 FREE' : `₹${event.price}`} variant="success" />
          </View>
        </View>

        {/* Countdown */}
        {event.status === 'upcoming' && (
          <View style={styles.countdownSection}>
            <Text style={styles.countdownLabel}>Event starts in</Text>
            <CountdownTimer targetDate={event.date} />
          </View>
        )}

        {/* Quick Info */}
        <View style={styles.quickInfo}>
          <View style={styles.quickInfoItem}>
            <Ionicons name="calendar" size={20} color={catColor} />
            <Text style={styles.quickInfoText}>
              {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </Text>
          </View>
          <View style={styles.qiDivider} />
          <View style={styles.quickInfoItem}>
            <Ionicons name="people" size={20} color={catColor} />
            <Text style={styles.quickInfoText}>{event.registeredCount} / {event.capacity}</Text>
          </View>
          <View style={styles.qiDivider} />
          <View style={styles.quickInfoItem}>
            <Ionicons name="location" size={20} color={catColor} />
            <Text style={styles.quickInfoText} numberOfLines={1}>{event.venue.split(',')[0]}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Event</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {/* Tags */}
        <View style={styles.tagsRow}>
          {event.tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}># {tag}</Text>
            </View>
          ))}
        </View>

        {/* Event Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          <View style={styles.detailsCard}>
            <InfoRow icon="calendar-outline" label="Date & Time" value={`${new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at ${new Date(event.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`} color={Colors.primary} />
            <InfoRow icon="location-outline" label="Venue" value={`${event.venue}\n${event.venueAddress || ''}`} color={Colors.accentGreen} />
            <InfoRow icon="time-outline" label="Duration" value={`${new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — ${new Date(event.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`} color={Colors.accentOrange} />
            <InfoRow icon="people-outline" label="Capacity" value={`${event.registeredCount} registered out of ${event.capacity} seats`} color={Colors.accentPurple} />
          </View>
        </View>

        {/* Capacity Bar */}
        <View style={styles.section}>
          <View style={styles.capacityHeader}>
            <Text style={styles.sectionTitle}>Registration Status</Text>
            <Text style={[styles.seatsLeft, isFull && { color: Colors.error }]}>
              {isFull ? '⚠️ Full' : `${event.capacity - event.registeredCount} seats left`}
            </Text>
          </View>
          <View style={styles.capacityBar}>
            <View style={[styles.capacityFill, { width: `${fillPercent}%` as any, backgroundColor: isFull ? Colors.error : catColor }]} />
          </View>
          <Text style={styles.capacityNote}>{Math.round(fillPercent)}% filled</Text>
        </View>

        {/* Organizer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Organized By</Text>
          <View style={styles.organizerCard}>
            <View style={styles.organizerAvatar}>
              <Ionicons name="people" size={24} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.organizerName}>{event.organizer}</Text>
              <Text style={styles.organizerEmail}>{event.organizerEmail}</Text>
              {event.organizerPhone && (
                <Text style={styles.organizerPhone}>{event.organizerPhone}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={{ height: 140 }} />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomCTA}>
        <View style={styles.webContainerInner}>
        {isRegistered ? (
          <View style={styles.registeredRow}>
            <View style={styles.registeredBadge}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.registeredText}>You're Registered!</Text>
            </View>
            <TouchableOpacity style={styles.cancelRegBtn} onPress={handleCancel} testID="event_cancel" accessibilityLabel="event_cancel">
              <Text style={styles.cancelRegText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.registerBtn, (isFull || event.status === 'completed') && styles.registerBtnDisabled]}
            onPress={() => {
              if (!user) { router.push('/(auth)/login'); return; }
              setShowModal(true);
            }}
            disabled={isFull || event.status === 'completed'}
            activeOpacity={0.85}
            testID="event_register"
            accessibilityLabel="event_register"
          >
            <LinearGradient
              colors={isFull || event.status === 'completed' ? ['#B0D0F0', '#9EC5E8'] : Gradients.aurora}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.registerGrad}
            >
              <Ionicons name={isFull ? 'lock-closed' : 'checkmark-circle-outline'} size={22} color="#fff" />
              <Text style={styles.registerText}>
                {event.status === 'completed' ? 'Event Completed' : isFull ? 'Event is Full' : `Register Now${event.price > 0 ? ` • ₹${event.price}` : ' • FREE'}`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  webContainer: { width: '100%', maxWidth: 1000, alignSelf: 'center', backgroundColor: Colors.white, ...Shadow.sm },
  webContainerInner: { width: '100%', maxWidth: 1000, alignSelf: 'center' },
  eventHeader: {
    padding: Spacing.md, paddingTop: 50, paddingBottom: 30,
    alignItems: 'center', position: 'relative',
  },
  backBtn: {
    position: 'absolute', top: 50, left: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, padding: 8, zIndex: 10,
  },
  categoryEmoji: { fontSize: 52, marginBottom: 12 },
  eventTitle: { fontSize: 26, fontWeight: '800', color: '#fff', textAlign: 'center', lineHeight: 32, marginBottom: 12, letterSpacing: -0.5 },
  headerBadges: { flexDirection: 'row', gap: 8 },
  countdownSection: { backgroundColor: Colors.white, padding: Spacing.md, alignItems: 'center', ...Shadow.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  countdownLabel: { fontSize: 13, fontWeight: '600', color: Colors.textMuted, marginBottom: 12 },
  quickInfo: {
    flexDirection: 'row', backgroundColor: Colors.white,
    paddingVertical: 14, paddingHorizontal: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  quickInfoItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  quickInfoText: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  qiDivider: { width: 1, backgroundColor: Colors.border },
  section: { paddingHorizontal: Spacing.md, marginTop: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 },
  description: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: Spacing.md, marginTop: 12 },
  tag: {
    backgroundColor: Colors.primaryUltraLight, borderRadius: BorderRadius.full,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  tagText: { fontSize: 12, color: Colors.primaryDark, fontWeight: '600' },
  detailsCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: 16, ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight },
  capacityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  seatsLeft: { fontSize: 13, fontWeight: '700', color: Colors.success },
  capacityBar: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden' },
  capacityFill: { height: '100%', borderRadius: 4 },
  capacityNote: { fontSize: 11, color: Colors.textMuted, marginTop: 6 },
  organizerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: 16, ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight,
  },
  organizerAvatar: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: Colors.primaryUltraLight,
    justifyContent: 'center', alignItems: 'center',
  },
  organizerName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 3 },
  organizerEmail: { fontSize: 13, color: Colors.textSecondary },
  organizerPhone: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  bottomCTA: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white, padding: Spacing.md,
    paddingBottom: 32, borderTopWidth: 1, borderTopColor: Colors.borderLight,
    ...Shadow.lg,
  },
  registerBtn: { borderRadius: BorderRadius.xl, overflow: 'hidden', ...Shadow.md, shadowColor: Colors.primary },
  registerBtnDisabled: { opacity: 0.7, shadowOpacity: 0 },
  registerGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 56,
  },
  registerText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  registeredRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  registeredBadge: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.successLight, borderRadius: BorderRadius.xl,
    paddingHorizontal: 20, height: 54, borderWidth: 1, borderColor: Colors.success + '40',
  },
  registeredText: { fontSize: 15, fontWeight: '700', color: Colors.success },
  cancelRegBtn: {
    backgroundColor: Colors.errorLight, borderRadius: BorderRadius.xl,
    paddingHorizontal: 16, height: 54, justifyContent: 'center', borderWidth: 1, borderColor: Colors.error + '40',
  },
  cancelRegText: { color: Colors.error, fontWeight: '700', fontSize: 14 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl,
    padding: 24, paddingBottom: 40,
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: Colors.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: Colors.textMuted, marginBottom: 24 },
  modalField: { marginBottom: 16 },
  modalLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8 },
  modalInput: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.background, borderRadius: BorderRadius.lg,
    paddingHorizontal: 14, height: 48,
  },
  modalInputEdit: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.background, borderRadius: BorderRadius.lg,
    paddingHorizontal: 14, height: 48,
    borderWidth: 1.5, borderColor: Colors.borderLight,
  },
  modalPrefilled: { fontSize: 14, color: Colors.textPrimary, fontWeight: '600' },
  priceSummary: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.warningLight, borderRadius: BorderRadius.lg,
    padding: 12, marginBottom: 20, borderWidth: 1, borderColor: Colors.warning + '40',
  },
  priceSummaryText: { fontSize: 14, color: Colors.textSecondary },
  modalRegBtn: { borderRadius: BorderRadius.xl, overflow: 'hidden', ...Shadow.md, shadowColor: Colors.primary },
  modalRegBtnDisabled: { opacity: 0.5 },
  modalRegGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 54,
  },
  modalRegText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  qrSection: { alignItems: 'center', marginBottom: 20 },
  studentQr: { width: 160, height: 160, borderRadius: 12, marginBottom: 12 },
  screenshotBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primaryUltraLight, paddingVertical: 14, paddingHorizontal: 20,
    borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.primary + '40',
    width: '100%', ...Shadow.sm,
  },
  screenshotBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  screenshotPreview: { width: '100%', height: 100, borderRadius: 8 },
});
