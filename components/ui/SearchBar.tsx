import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { BorderRadius, Shadow } from '../../constants/Theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  testID?: string;
}

export default function SearchBar({ value, onChangeText, placeholder = 'Search events...', onClear, testID }: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, focused && styles.focused]}>
      <Ionicons name="search" size={20} color={focused ? Colors.primary : Colors.textMuted} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType="search"
        testID={testID || "event_search"}
        accessibilityLabel={testID || "event_search"}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => { onChangeText(''); onClear?.(); }} style={styles.clearBtn}>
          <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    ...Shadow.sm,
  },
  focused: {
    borderColor: Colors.primary,
  },
  icon: { marginRight: 8 },
  input: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  clearBtn: { padding: 4 },
});
