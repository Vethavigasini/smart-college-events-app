import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, SafeAreaView, Alert, Switch, Platform, Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useEvents } from '../../context/EventContext';
import { Colors, Gradients } from '../../constants/Colors';
import { BorderRadius, Shadow, Spacing } from '../../constants/Theme';
import { EventCategory } from '../../data/types';
import Button from '../../components/ui/Button';

const CATEGORIES: EventCategory[] = ['Technology', 'Cultural', 'Sports', 'Academic', 'Workshop', 'Other'];
const CATEGORY_EMOJI: Record<string, string> = {
  Technology: '💻', Cultural: '🎭', Sports: '🏆', Academic: '📚', Workshop: '🔧', Other: '🌟',
};

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <View style={fStyles.group}>
      <Text style={fStyles.label}>{label}</Text>
      {children}
      {error ? <Text style={fStyles.error}>{error}</Text> : null}
    </View>
  );
}

const fStyles = StyleSheet.create({
  group: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  error: { fontSize: 12, color: Colors.error, marginTop: 4 },
});

export default function CreateEventScreen() {
  const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const { createEvent, getEvent, updateEvent } = useEvents();

  const existing = editId ? getEvent(editId) : null;

  const [form, setForm] = useState({
    title: existing?.title || '',
    shortDescription: existing?.shortDescription || '',
    description: existing?.description || '',
    category: (existing?.category || 'Technology') as EventCategory,
    venue: existing?.venue || '',
    venueAddress: existing?.venueAddress || '',
    organizer: existing?.organizer || '',
    organizerEmail: existing?.organizerEmail || '',
    organizerPhone: existing?.organizerPhone || '',
    date: existing?.date ? new Date(existing.date).toISOString().slice(0, 16) : '',
    endDate: existing?.endDate ? new Date(existing.endDate).toISOString().slice(0, 16) : '',
    capacity: String(existing?.capacity || ''),
    price: String(existing?.price || '0'),
    tags: existing?.tags.join(', ') || '',
    featured: existing?.featured || false,
    paymentQrCode: existing?.paymentQrCode || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (key: string, val: string | boolean) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.venue.trim()) e.venue = 'Venue is required';
    if (!form.organizer.trim()) e.organizer = 'Organizer is required';
    if (!form.organizerEmail.trim()) e.organizerEmail = 'Organizer email is required';
    if (!form.date) e.date = 'Date is required';
    if (!form.capacity || isNaN(Number(form.capacity))) e.capacity = 'Valid capacity is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const parseDate = (d: string) => {
      try {
        const parsed = new Date(d);
        if (isNaN(parsed.getTime())) return new Date().toISOString();
        return parsed.toISOString();
      } catch {
        return new Date().toISOString();
      }
    };

    const data = {
      title: form.title.trim(),
      shortDescription: form.shortDescription.trim() || form.description.slice(0, 100),
      description: form.description.trim(),
      category: form.category,
      status: 'upcoming' as const,
      date: parseDate(form.date),
      endDate: form.endDate ? parseDate(form.endDate) : parseDate(form.date),
      venue: form.venue.trim(),
      venueAddress: form.venueAddress.trim(),
      organizer: form.organizer.trim(),
      organizerEmail: form.organizerEmail.trim(),
      organizerPhone: form.organizerPhone.trim(),
      capacity: parseInt(form.capacity),
      registeredCount: existing?.registeredCount || 0,
      price: parseInt(form.price) || 0,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      featured: form.featured,
      paymentQrCode: form.paymentQrCode,
    };

    if (existing && editId) {
      updateEvent(editId as string, data);
      if (Platform.OS === 'web') {
        window.alert('Event updated successfully!');
        router.back();
      } else {
        Alert.alert('✅ Updated', 'Event updated successfully!', [{ text: 'OK', onPress: () => router.back() }]);
      }
    } else {
      createEvent(data);
      if (Platform.OS === 'web') {
        window.alert('Event created successfully!');
        router.back();
      } else {
        Alert.alert('🎉 Created!', 'Event created successfully!', [{ text: 'OK', onPress: () => router.back() }]);
      }
    }
    setLoading(false);
  };

  const inputStyle = (key: string) => [styles.input, errors[key] ? styles.inputError : null];

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      set('paymentQrCode', result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.webContainer}>
      {/* Header */}
      <LinearGradient colors={Gradients.aurora} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} testID="admin_create_back" accessibilityLabel="admin_create_back">
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{existing ? 'Edit Event' : 'Create New Event'}</Text>
        <Text style={styles.headerSub}>{existing ? 'Update event details' : 'Fill in the details below'}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>

        {/* Category */}
        <Field label="Event Category">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, form.category === cat && styles.catChipActive]}
                onPress={() => set('category', cat)}
                testID={"admin_create_cat_" + cat.toLowerCase()}
                accessibilityLabel={"admin_create_cat_" + cat.toLowerCase()}
              >
                <Text style={styles.catEmoji}>{CATEGORY_EMOJI[cat]}</Text>
                <Text style={[styles.catText, form.category === cat && styles.catTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Field>

        {/* Title */}
        <Field label="Event Title *" error={errors.title}>
          <TextInput
            style={inputStyle('title')}
            value={form.title}
            onChangeText={v => set('title', v)}
            placeholder="e.g. National Tech Symposium 2025"
            placeholderTextColor={Colors.textMuted}
            testID="admin_create_title"
            accessibilityLabel="admin_create_title"
          />
        </Field>

        {/* Short Description */}
        <Field label="Short Description">
          <TextInput
            style={inputStyle('shortDescription')}
            value={form.shortDescription}
            onChangeText={v => set('shortDescription', v)}
            placeholder="Brief one-line summary (used in cards)"
            placeholderTextColor={Colors.textMuted}
            testID="admin_create_short_desc"
            accessibilityLabel="admin_create_short_desc"
          />
        </Field>

        {/* Full Description */}
        <Field label="Full Description *" error={errors.description}>
          <TextInput
            style={[inputStyle('description'), styles.multiline]}
            value={form.description}
            onChangeText={v => set('description', v)}
            placeholder="Detailed description of the event..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            testID="admin_create_desc"
            accessibilityLabel="admin_create_desc"
          />
        </Field>

        {/* Date */}
        <View style={styles.row}>
          <Field label="Start Date & Time *" error={errors.date}>
            <TextInput
              style={[inputStyle('date'), styles.halfInput]}
              value={form.date}
              onChangeText={v => set('date', v)}
              placeholder="YYYY-MM-DDTHH:MM"
              placeholderTextColor={Colors.textMuted}
              testID="admin_create_start_date"
              accessibilityLabel="admin_create_start_date"
            />
          </Field>
          <Field label="End Date & Time">
            <TextInput
              style={[inputStyle('endDate'), styles.halfInput]}
              value={form.endDate}
              onChangeText={v => set('endDate', v)}
              placeholder="YYYY-MM-DDTHH:MM"
              placeholderTextColor={Colors.textMuted}
              testID="admin_create_end_date"
              accessibilityLabel="admin_create_end_date"
            />
          </Field>
        </View>

        {/* Venue */}
        <Field label="Venue *" error={errors.venue}>
          <TextInput
            style={inputStyle('venue')}
            value={form.venue}
            onChangeText={v => set('venue', v)}
            placeholder="e.g. Main Auditorium, Block A"
            placeholderTextColor={Colors.textMuted}
            testID="admin_create_venue"
            accessibilityLabel="admin_create_venue"
          />
        </Field>

        <Field label="Venue Address">
          <TextInput
            style={inputStyle('venueAddress')}
            value={form.venueAddress}
            onChangeText={v => set('venueAddress', v)}
            placeholder="Full address"
            placeholderTextColor={Colors.textMuted}
            testID="admin_create_venue_address"
            accessibilityLabel="admin_create_venue_address"
          />
        </Field>

        {/* Organizer */}
        <Field label="Organizer *" error={errors.organizer}>
          <TextInput
            style={inputStyle('organizer')}
            value={form.organizer}
            onChangeText={v => set('organizer', v)}
            placeholder="e.g. Tech Club"
            placeholderTextColor={Colors.textMuted}
            testID="admin_create_organizer"
            accessibilityLabel="admin_create_organizer"
          />
        </Field>

        <View style={styles.row}>
          <Field label="Organizer Email *" error={errors.organizerEmail}>
            <TextInput
              style={[inputStyle('organizerEmail'), styles.halfInput]}
              value={form.organizerEmail}
              onChangeText={v => set('organizerEmail', v)}
              placeholder="email@college.edu"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="admin_create_org_email"
              accessibilityLabel="admin_create_org_email"
            />
          </Field>
          <Field label="Organizer Phone">
            <TextInput
              style={[inputStyle('organizerPhone'), styles.halfInput]}
              value={form.organizerPhone}
              onChangeText={v => set('organizerPhone', v)}
              placeholder="+91 XXXXX XXXXX"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              testID="admin_create_org_phone"
              accessibilityLabel="admin_create_org_phone"
            />
          </Field>
        </View>

        <View style={styles.row}>
          <Field label="Capacity *" error={errors.capacity}>
            <TextInput
              style={[inputStyle('capacity'), styles.halfInput]}
              value={form.capacity}
              onChangeText={v => set('capacity', v)}
              placeholder="e.g. 200"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
              testID="admin_create_capacity"
              accessibilityLabel="admin_create_capacity"
            />
          </Field>
          <Field label="Registration Fee (₹)">
            <TextInput
              style={[inputStyle('price'), styles.halfInput]}
              value={form.price}
              onChangeText={v => set('price', v)}
              placeholder="0 = Free"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
              testID="admin_create_price"
              accessibilityLabel="admin_create_price"
            />
          </Field>
        </View>

        {Number(form.price) > 0 && (
          <Field label="Payment QR Code (For Paid Events)">
            <TouchableOpacity style={styles.qrUploadBtn} onPress={pickImage}>
              {form.paymentQrCode ? (
                <Image source={{ uri: form.paymentQrCode }} style={styles.qrPreview} />
              ) : (
                <>
                  <Ionicons name="qr-code-outline" size={32} color={Colors.primary} />
                  <Text style={styles.qrUploadText}>Upload QR Code</Text>
                </>
              )}
            </TouchableOpacity>
          </Field>
        )}

        <Field label="Tags (comma-separated)">
          <TextInput
            style={inputStyle('tags')}
            value={form.tags}
            onChangeText={v => set('tags', v)}
            placeholder="e.g. AI, ML, Workshop"
            placeholderTextColor={Colors.textMuted}
            testID="admin_create_tags"
            accessibilityLabel="admin_create_tags"
          />
        </Field>

        {/* Featured Toggle */}
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>Featured Event</Text>
            <Text style={styles.toggleSub}>Show in home page highlights</Text>
          </View>
          <Switch
            value={form.featured}
            onValueChange={v => set('featured', v)}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.white}
            testID="admin_create_featured_switch"
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={styles.shadowWrapper}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
          testID={existing ? "admin_update_event" : "admin_create_event"}
          accessibilityLabel={existing ? "admin_update_event" : "admin_create_event"}
        >
          <LinearGradient colors={Gradients.aurora} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitGrad}>
            <Ionicons name={existing ? 'checkmark-circle-outline' : 'add-circle-outline'} size={22} color="#fff" />
            <Text style={styles.submitText}>{loading ? 'Saving...' : existing ? 'Update Event' : 'Create Event'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  webContainer: { width: '100%', maxWidth: 1000, alignSelf: 'center', flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.md, paddingTop: 50, paddingBottom: 24, position: 'relative', borderBottomLeftRadius: BorderRadius.xxl, borderBottomRightRadius: BorderRadius.xxl },
  backBtn: {
    position: 'absolute', top: 50, left: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20, padding: 8, zIndex: 10,
    borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', textAlign: 'center', marginTop: 8, letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: 4, fontWeight: '500' },
  form: { padding: Spacing.md, paddingTop: 24 },
  input: {
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, paddingHorizontal: 14, height: 48,
    fontSize: 15, color: Colors.textPrimary, ...Shadow.sm,
  },
  inputError: { borderColor: Colors.error },
  multiline: { height: 120, paddingTop: 12 },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: BorderRadius.full, borderWidth: 1.5,
    borderColor: Colors.border, backgroundColor: Colors.white,
    marginRight: 8,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catEmoji: { fontSize: 16 },
  catText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  catTextActive: { color: Colors.white },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    padding: 16, marginBottom: 24, ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight,
  },
  toggleLabel: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  toggleSub: { fontSize: 13, color: Colors.textMuted, marginTop: 2, fontWeight: '500' },
  shadowWrapper: { borderRadius: BorderRadius.xl, overflow: 'hidden', ...Shadow.md, shadowColor: Colors.primary },
  submitGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 56,
  },
  submitText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  qrUploadBtn: {
    height: 120, borderWidth: 1.5, borderColor: Colors.primary,
    borderStyle: 'dashed', borderRadius: BorderRadius.lg,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.primaryUltraLight,
  },
  qrPreview: { width: 100, height: 100, borderRadius: 8 },
  qrUploadText: { color: Colors.primary, fontSize: 13, fontWeight: '600', marginTop: 8 },
});
