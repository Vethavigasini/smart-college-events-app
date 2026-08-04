import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { BorderRadius, Shadow } from '../../constants/Theme';
import { Event } from '../../data/types';
import Badge from '../ui/Badge';

interface EventCardProps {
  event: Event;
  style?: object;
  compact?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  Technology: Colors.categoryTech,
  Cultural: Colors.categoryCultural,
  Sports: Colors.categorySports,
  Academic: Colors.categoryAcademic,
  Workshop: Colors.categoryWorkshop,
  Other: Colors.categoryOther,
};

const CATEGORY_ICONS: Record<string, string> = {
  Technology: '💻',
  Cultural: '🎭',
  Sports: '🏆',
  Academic: '📚',
  Workshop: '🔧',
  Other: '🌟',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function EventCard({ event, style, compact = false }: EventCardProps) {
  const router = useRouter();
  const seatsLeft = event.capacity - event.registeredCount;
  const isFull = seatsLeft <= 0;
  const fillPercent = Math.min(100, (event.registeredCount / event.capacity) * 100);
  const catColor = CATEGORY_COLORS[event.category] || Colors.primary;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/event/${event.id}`)}
      activeOpacity={0.92}
      style={[styles.card, compact && styles.compact, style]}
      testID={"event_card_" + event.id}
      accessibilityLabel={"event_card_" + event.id}
    >
      {/* Color Header */}
      <View style={[styles.header, { backgroundColor: catColor }]}>
        <Text style={styles.categoryEmoji}>{CATEGORY_ICONS[event.category]}</Text>
        {event.featured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={10} color="#fff" />
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{event.price === 0 ? 'FREE' : `₹${event.price}`}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.row}>
          <Badge
            label={event.category}
            variant={event.category === 'Technology' ? 'primary' : event.category === 'Cultural' ? 'error' : event.category === 'Sports' ? 'success' : event.category === 'Academic' ? 'purple' : event.category === 'Workshop' ? 'warning' : 'teal'}
            size="sm"
          />
          <Badge
            label={event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            variant={event.status === 'upcoming' ? 'success' : event.status === 'ongoing' ? 'info' : event.status === 'cancelled' ? 'error' : 'neutral'}
            size="sm"
          />
        </View>

        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>

        {!compact && (
          <Text style={styles.description} numberOfLines={2}>{event.shortDescription}</Text>
        )}

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.metaText}>{formatDate(event.date)}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.metaText} numberOfLines={1}>{event.venue}</Text>
        </View>

        {/* Capacity Bar */}
        <View style={styles.capacityRow}>
          <View style={styles.capacityBar}>
            <View style={[styles.capacityFill, { width: `${fillPercent}%` as any, backgroundColor: isFull ? Colors.error : catColor }]} />
          </View>
          <Text style={[styles.seatsText, isFull && { color: Colors.error }]}>
            {isFull ? 'Full' : `${seatsLeft} seats left`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
    marginBottom: 16,
  },
  compact: {
    width: 240,
    marginBottom: 0,
    marginRight: 14,
  },
  header: {
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  categoryEmoji: {
    fontSize: 36,
  },
  featuredBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(4px)' } as any),
  },
  featuredText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  priceBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(4px)' } as any),
  },
  priceText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  content: { padding: 14 },
  row: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  metaText: { fontSize: 12, color: Colors.textMuted, flex: 1 },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  capacityBar: {
    flex: 1,
    height: 5,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    borderRadius: 3,
  },
  seatsText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    minWidth: 65,
  },
});
