import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEvents } from '../../context/EventContext';
import { Colors } from '../../constants/Colors';
import { BorderRadius, Spacing, Shadow } from '../../constants/Theme';
import EventCard from '../../components/events/EventCard';
import SearchBar from '../../components/ui/SearchBar';
import CategoryChip from '../../components/events/CategoryChip';
import { Event } from '../../data/types';

const CATEGORIES = ['All', 'Technology', 'Cultural', 'Sports', 'Academic', 'Workshop', 'Other'];
const SORT_OPTIONS = ['Date (Soonest)', 'Date (Latest)', 'Seats Available', 'Price (Low to High)'];
const STATUS_FILTERS = ['All', 'Upcoming', 'Ongoing', 'Completed'];

function SortModal({ visible, onClose, value, onChange }: { visible: boolean; onClose: () => void; value: string; onChange: (v: string) => void }) {
  if (!visible) return null;
  return (
    <View style={mStyles.overlay}>
      <TouchableOpacity style={mStyles.backdrop} onPress={onClose} activeOpacity={1} />
      <View style={mStyles.sheet}>
        <Text style={mStyles.title}>Sort By</Text>
        {SORT_OPTIONS.map(opt => (
          <TouchableOpacity key={opt} style={mStyles.row} onPress={() => { onChange(opt); onClose(); }} testID={"sort_option_" + opt.replace(/\s+/g, '_').replace(/[()]/g, '').toLowerCase()} accessibilityLabel={"sort_option_" + opt.replace(/\s+/g, '_').replace(/[()]/g, '').toLowerCase()}>
            <Text style={[mStyles.opt, value === opt && mStyles.optActive]}>{opt}</Text>
            {value === opt && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const mStyles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', zIndex: 100 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  title: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  opt: { fontSize: 15, color: Colors.textSecondary, fontWeight: '500' },
  optActive: { color: Colors.primary, fontWeight: '700' },
});

export default function EventsScreen() {
  const { events, searchEvents } = useEvents();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState(SORT_OPTIONS[0]);
  const [showSort, setShowSort] = useState(false);

  const filtered = useMemo(() => {
    let list: Event[] = query.trim() ? searchEvents(query) : [...events];
    if (category !== 'All') list = list.filter(e => e.category === category);
    if (status !== 'All') list = list.filter(e => e.status === status.toLowerCase());

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'Date (Soonest)': return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'Date (Latest)': return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'Seats Available': return (b.capacity - b.registeredCount) - (a.capacity - a.registeredCount);
        case 'Price (Low to High)': return a.price - b.price;
        default: return 0;
      }
    });
    return list;
  }, [query, category, status, sort, events]);

  return (
    <SafeAreaView style={styles.container}>
      <SortModal visible={showSort} onClose={() => setShowSort(false)} value={sort} onChange={setSort} />

      <View style={styles.webContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Events</Text>
          <Text style={styles.headerSub}>{filtered.length} event{filtered.length !== 1 ? 's' : ''} found</Text>
        </View>
        <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(true)} testID="event_sort_btn" accessibilityLabel="event_sort_btn">
          <Ionicons name="funnel-outline" size={18} color={Colors.primary} />
          <Text style={styles.sortText}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <SearchBar value={query} onChangeText={setQuery} testID="dashboard_search" />
      </View>

      {/* Category Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipContent}>
        {CATEGORIES.map(c => (
          <CategoryChip
            key={c}
            label={c}
            active={category === c}
            onPress={() => setCategory(c)}
            testID={"category_chip_" + c.toLowerCase()}
          />
        ))}
      </ScrollView>

      {/* Status Tabs */}
      <View style={styles.statusRow}>
        {STATUS_FILTERS.map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.statusTab, status === s && styles.statusTabActive]}
            onPress={() => setStatus(s)}
            testID={"status_filter_" + s.toLowerCase()}
            accessibilityLabel={"status_filter_" + s.toLowerCase()}
          >
            <Text style={[styles.statusTabText, status === s && styles.statusTabTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Event List */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={56} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No events found</Text>
          <Text style={styles.emptyBody}>Try changing your search or filters</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={e => e.id}
          renderItem={({ item }) => <EventCard event={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  webContainer: { width: '100%', maxWidth: 1000, alignSelf: 'center', flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: 8,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  headerSub: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  sortBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primaryUltraLight,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full,
  },
  sortText: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  searchWrap: { paddingHorizontal: Spacing.md, marginBottom: 12 },
  chipScroll: { flexGrow: 0 },
  chipContent: { paddingHorizontal: Spacing.md, paddingBottom: 4 },
  statusRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.md,
    marginBottom: 12, gap: 8,
  },
  statusTab: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.border,
  },
  statusTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  statusTabText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  statusTabTextActive: { color: Colors.white },
  list: { paddingHorizontal: Spacing.md, paddingBottom: 100 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  emptyBody: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
});
