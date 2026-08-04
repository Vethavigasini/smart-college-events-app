import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { BorderRadius } from '../../constants/Theme';

interface CategoryChipProps {
  label: string;
  emoji?: string;
  active?: boolean;
  onPress: () => void;
  testID?: string;
}

export default function CategoryChip({ label, emoji, active = false, onPress, testID }: CategoryChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, active && styles.active]}
      testID={testID}
      accessibilityLabel={testID}
    >
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={[styles.text, active && styles.activeText]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginRight: 8,
  },
  active: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  emoji: { fontSize: 14 },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeText: {
    color: Colors.white,
  },
});
