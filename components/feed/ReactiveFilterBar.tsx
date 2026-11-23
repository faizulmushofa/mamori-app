import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import { colors, spacing, radii, typography, shadows } from '../../lib/tokens';
import {
  CATEGORY_METADATA,
  type IncidentCategory,
  type IncidentStatus,
} from '../../lib/types';

interface ReactiveFilterBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  selectedCategory: IncidentCategory | 'all';
  onCategoryChange: (cat: IncidentCategory | 'all') => void;
  selectedStatus: IncidentStatus | 'all';
  onStatusChange: (status: IncidentStatus | 'all') => void;
  isDebouncing?: boolean;
}

/**
 * Filter Reaktif & Search Bar (Pertemuan 11 & PRD F-17)
 */
export const ReactiveFilterBar: React.FC<ReactiveFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  isDebouncing = false,
}) => {
  const statusOptions: Array<{ key: IncidentStatus | 'all'; label: string }> = [
    { key: 'all', label: 'Semua Status' },
    { key: 'dilaporkan', label: 'Dilaporkan' },
    { key: 'terverifikasi', label: 'Terverifikasi' },
    { key: 'dikerjakan', label: 'Dikerjakan' },
    { key: 'selesai', label: 'Selesai' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Cari masalah, gedung, atau fasilitas..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {isDebouncing && (
          <View style={styles.debounceIndicator}>
            <Text style={styles.debounceText}>⚡ RxJS...</Text>
          </View>
        )}
        {searchQuery.length > 0 && !isDebouncing && (
          <Pressable onPress={() => onSearchChange('')} hitSlop={8}>
            <Text style={styles.clearBtn}>✕</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScroll}
      >
        <Pressable
          style={[
            styles.chip,
            selectedCategory === 'all' && styles.chipActive,
          ]}
          onPress={() => onCategoryChange('all')}
        >
          <Text
            style={[
              styles.chipText,
              selectedCategory === 'all' && styles.chipTextActive,
            ]}
          >
            Semua
          </Text>
        </Pressable>

        {(Object.keys(CATEGORY_METADATA) as IncidentCategory[]).map((cat) => {
          const meta = CATEGORY_METADATA[cat];
          const isSelected = selectedCategory === cat;
          return (
            <Pressable
              key={cat}
              style={[
                styles.chip,
                isSelected && {
                  backgroundColor: meta.bgColor,
                  borderColor: meta.color,
                },
              ]}
              onPress={() => onCategoryChange(cat)}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && { color: meta.color, fontWeight: '700' },
                ]}
              >
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statusChipsScroll}
      >
        {statusOptions.map((opt) => {
          const isSelected = selectedStatus === opt.key;
          return (
            <Pressable
              key={opt.key}
              style={[
                styles.statusChip,
                isSelected && styles.statusChipActive,
              ]}
              onPress={() => onStatusChange(opt.key)}
            >
              <Text
                style={[
                  styles.statusChipText,
                  isSelected && styles.statusChipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    height: 42,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.textMain,
    height: '100%',
  },
  debounceIndicator: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  debounceText: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: typography.weight.bold,
  },
  clearBtn: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    paddingHorizontal: 4,
  },
  chipsScroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: typography.size.xs,
    color: colors.textMain,
    fontWeight: typography.weight.medium,
  },
  chipTextActive: {
    color: colors.textInverse,
    fontWeight: typography.weight.bold,
  },
  statusChipsScroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    gap: spacing.xs,
  },
  statusChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  statusChipActive: {
    backgroundColor: '#E0E7FF',
  },
  statusChipText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: typography.weight.medium,
  },
  statusChipTextActive: {
    color: colors.primary,
    fontWeight: typography.weight.bold,
  },
});
