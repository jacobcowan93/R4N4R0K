import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '@/theme';
import type { Blueprint } from '@/services/api';

const RARITY_COLOR: Record<Blueprint['rarity'], string> = {
  common: Colors.rarityCommon,
  uncommon: Colors.rarityUncommon,
  rare: Colors.rarityRare,
  epic: Colors.rarityEpic,
  legendary: Colors.rarityLegendary,
};

export function RarityBadge({ rarity }: { rarity: Blueprint['rarity'] }) {
  const color = RARITY_COLOR[rarity];
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{rarity.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
