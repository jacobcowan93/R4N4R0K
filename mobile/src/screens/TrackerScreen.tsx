import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/Card';
import { RarityBadge } from '@/components/RarityBadge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getTrackedBlueprintsApi, untrackBlueprintApi, Blueprint } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Colors, FontSize, Spacing } from '@/theme';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function TrackerScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getTrackedBlueprintsApi()
      .then((res) => setBlueprints(res.data))
      .finally(() => setLoading(false));
  }, [user]);

  async function untrack(id: string) {
    await untrackBlueprintApi(id);
    setBlueprints((prev) => prev.filter((bp) => bp.id !== id));
  }

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return (
      <View style={styles.center}>
        <Ionicons name="lock-closed" size={48} color={Colors.textMuted} />
        <Text style={styles.emptyTitle}>Sign In Required</Text>
        <Text style={styles.emptyBody}>Log in to track blueprints across sessions.</Text>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginBtnText}>Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={blueprints}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <Text style={styles.heading}>
          {blueprints.length} tracked blueprint{blueprints.length !== 1 ? 's' : ''}
        </Text>
      }
      renderItem={({ item }) => (
        <Card
          style={styles.card}
          onPress={() => navigation.navigate('BlueprintDetail', { id: item.id })}
        >
          <View style={styles.cardRow}>
            <View style={styles.cardInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.category}>{item.category}</Text>
              <RarityBadge rarity={item.rarity} />
            </View>
            <TouchableOpacity onPress={() => untrack(item.id)} hitSlop={8}>
              <Ionicons name="bookmark" size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>
      )}
      ListEmptyComponent={
        <View style={styles.center}>
          <Ionicons name="bookmark-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No Tracked Blueprints</Text>
          <Text style={styles.emptyBody}>
            Browse blueprints and tap the bookmark icon to track them here.
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Blueprints')}
          >
            <Text style={styles.loginBtnText}>Browse Blueprints</Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.xxl },
  heading: { color: Colors.textSecondary, fontSize: FontSize.sm, marginBottom: Spacing.xs },
  card: {},
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cardInfo: { flex: 1, gap: 4 },
  name: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '600' },
  category: { color: Colors.textSecondary, fontSize: FontSize.sm },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
    marginTop: Spacing.xxl,
  },
  emptyTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '700' },
  emptyBody: { color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'center' },
  loginBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    marginTop: Spacing.sm,
  },
  loginBtnText: { color: Colors.bg, fontWeight: '700', fontSize: FontSize.md },
});
