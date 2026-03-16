import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '@/components/Card';
import { RarityBadge } from '@/components/RarityBadge';
import { SearchBar } from '@/components/SearchBar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getBlueprintsApi, Blueprint } from '@/services/api';
import { Colors, FontSize, Spacing } from '@/theme';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CATEGORIES = ['All', 'Weapon', 'Armor', 'Tool', 'Consumable', 'Module'];
const RARITIES = ['All', 'common', 'uncommon', 'rare', 'epic', 'legendary'] as const;

export function BlueprintsScreen() {
  const navigation = useNavigation<Nav>();
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [rarity, setRarity] = useState<string>('All');

  useEffect(() => {
    getBlueprintsApi()
      .then((res) => setBlueprints(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return blueprints.filter((bp) => {
      const matchSearch = bp.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'All' || bp.category === category;
      const matchRarity = rarity === 'All' || bp.rarity === rarity;
      return matchSearch && matchCategory && matchRarity;
    });
  }, [blueprints, search, category, rarity]);

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search blueprints…" />
      </View>

      {/* Category filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(c) => c}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, category === item && styles.chipActive]}
            onPress={() => setCategory(item)}
          >
            <Text style={[styles.chipText, category === item && styles.chipTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Rarity filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={RARITIES}
        keyExtractor={(r) => r}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, rarity === item && styles.chipActive]}
            onPress={() => setRarity(item)}
          >
            <Text style={[styles.chipText, rarity === item && styles.chipTextActive]}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card
            onPress={() => navigation.navigate('BlueprintDetail', { id: item.id })}
            style={styles.card}
          >
            <View style={styles.cardRow}>
              <View style={styles.cardInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.category}>{item.category}</Text>
              </View>
              <View style={styles.cardRight}>
                <RarityBadge rarity={item.rarity} />
                {item.trackedBy !== undefined && (
                  <Text style={styles.tracked}>{item.trackedBy} tracking</Text>
                )}
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No blueprints found.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: Spacing.md, paddingBottom: 0 },
  filterRow: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.xs },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
  },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryDark },
  chipText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  chipTextActive: { color: Colors.textPrimary, fontWeight: '600' },
  list: { padding: Spacing.md, gap: Spacing.sm },
  card: {},
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardInfo: { flex: 1 },
  name: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '600' },
  category: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  tracked: { color: Colors.textMuted, fontSize: FontSize.xs },
  empty: { textAlign: 'center', color: Colors.textMuted, marginTop: Spacing.xl },
});
