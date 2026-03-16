import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RarityBadge } from '@/components/RarityBadge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card } from '@/components/Card';
import { getBlueprintApi, trackBlueprintApi, untrackBlueprintApi, Blueprint } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Colors, FontSize, Spacing } from '@/theme';
import type { RootStackParamList } from '@/navigation/types';

type Route = RouteProp<RootStackParamList, 'BlueprintDetail'>;

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function BlueprintDetailScreen() {
  const { params } = useRoute<Route>();
  const { user } = useAuth();
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [tracked, setTracked] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    getBlueprintApi(params.id)
      .then((res) => {
        setBlueprint(res.data);
        if (user) {
          setTracked(user.trackedBlueprints.includes(params.id));
        }
      })
      .finally(() => setLoading(false));
  }, [params.id, user]);

  async function toggleTrack() {
    if (!blueprint) return;
    setToggling(true);
    try {
      if (tracked) {
        await untrackBlueprintApi(blueprint.id);
      } else {
        await trackBlueprintApi(blueprint.id);
      }
      setTracked((prev) => !prev);
    } finally {
      setToggling(false);
    }
  }

  if (loading || !blueprint) return <LoadingSpinner />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{blueprint.name}</Text>
          <Text style={styles.category}>{blueprint.category}</Text>
          <RarityBadge rarity={blueprint.rarity} />
        </View>
        <TouchableOpacity
          style={[styles.trackBtn, tracked && styles.trackBtnActive]}
          onPress={toggleTrack}
          disabled={toggling || !user}
        >
          <Ionicons
            name={tracked ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={tracked ? Colors.bg : Colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Description */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{blueprint.description}</Text>
      </Card>

      {/* Craft Time */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Craft Time</Text>
        <Text style={styles.stat}>{formatTime(blueprint.craftTime)}</Text>
      </Card>

      {/* Materials */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Required Materials</Text>
        {blueprint.materials.map((mat) => (
          <View key={mat.name} style={styles.materialRow}>
            <Text style={styles.materialName}>{mat.name}</Text>
            <Text style={styles.materialQty}>×{mat.quantity}</Text>
          </View>
        ))}
      </Card>

      {!user && (
        <Text style={styles.loginNote}>Log in to track this blueprint.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.xxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  headerInfo: { flex: 1, gap: Spacing.xs },
  name: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '800' },
  category: { color: Colors.textSecondary, fontSize: FontSize.sm },
  trackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackBtnActive: { backgroundColor: Colors.primary },
  section: {},
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  description: { color: Colors.textSecondary, fontSize: FontSize.md, lineHeight: 22 },
  stat: { color: Colors.primary, fontSize: FontSize.lg, fontWeight: '700' },
  materialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  materialName: { color: Colors.textPrimary, fontSize: FontSize.md },
  materialQty: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.md },
  loginNote: { textAlign: 'center', color: Colors.textMuted, fontSize: FontSize.sm },
});
