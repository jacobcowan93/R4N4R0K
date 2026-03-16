import React, { useEffect, useState } from 'react';
import {
  FlatList,
  ImageBackground,
  RefreshControl,
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
import { getBlueprintsApi, getListingsApi, Blueprint, Listing } from '@/services/api';
import { Colors, FontSize, Spacing } from '@/theme';
import { Images } from '@/theme/images';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchData() {
    try {
      const [bpRes, listRes] = await Promise.all([
        getBlueprintsApi(),
        getListingsApi({ page: 1 }),
      ]);
      setBlueprints(bpRes.data.slice(0, 5));
      setListings(listRes.data.listings.slice(0, 5));
    } catch {
      // handled silently; show stale data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchData(); }}
          tintColor={Colors.primary}
        />
      }
      ListHeaderComponent={
        <>
          {/* Hero — bg-banner.jpg with open-world bleed */}
          <ImageBackground
            source={Images.bgBanner}
            style={styles.heroBg}
            imageStyle={styles.heroBgImage}
          >
            <View style={styles.heroOverlay}>
              <Text style={styles.heroTitle}>RAIDER</Text>
              <Text style={[styles.heroTitle, { color: Colors.primary }]}>SYNDICATE</Text>
              <Text style={styles.heroSub}>ARC Raiders Community Hub</Text>
            </View>
          </ImageBackground>

          {/* Quick Actions */}
          <View style={styles.sectionPad}>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Blueprints')}
            >
              <Ionicons name="construct" size={24} color={Colors.primary} />
              <Text style={styles.actionLabel}>Blueprints</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Marketplace')}
            >
              <Ionicons name="storefront" size={24} color={Colors.primary} />
              <Text style={styles.actionLabel}>Marketplace</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Tracker')}
            >
              <Ionicons name="bookmark" size={24} color={Colors.primary} />
              <Text style={styles.actionLabel}>Tracker</Text>
            </TouchableOpacity>
          </View>

          {/* Section: Recent Blueprints */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Blueprints</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Blueprints')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          </View>
        </>
      }
      data={blueprints}
      keyExtractor={(item) => `bp-${item.id}`}
      renderItem={({ item }) => (
        <Card
          style={[styles.blueprintCard, styles.cardPad]}
          onPress={() => navigation.navigate('BlueprintDetail', { id: item.id })}
        >
          <View style={styles.cardRow}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardCategory}>{item.category}</Text>
            </View>
            <RarityBadge rarity={item.rarity} />
          </View>
        </Card>
      )}
      ListFooterComponent={
        <>
          {/* Section: Recent Listings */}
          <View style={styles.sectionPad}>
          <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
            <Text style={styles.sectionTitle}>Recent Listings</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Marketplace')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {listings.map((item) => (
            <Card key={`listing-${item.id}`} style={styles.blueprintCard}>
              <View style={styles.cardRow}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{item.itemName}</Text>
                  <Text style={styles.cardCategory}>
                    {item.seller.username} · {item.quantity}x
                  </Text>
                </View>
                <Text style={styles.price}>{item.price.toLocaleString()} cr</Text>
              </View>
            </Card>
          ))}
          </View>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingBottom: Spacing.xxl },

  // Hero
  heroBg: { width: '100%', height: 220 },
  heroBgImage: { resizeMode: 'cover', opacity: 0.7 },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: Spacing.xl,
  },
  heroTitle: {
    fontSize: FontSize.hero,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 4,
    lineHeight: 40,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroSub: {
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    letterSpacing: 1,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  sectionPad: { paddingHorizontal: Spacing.md },
  cardPad: { marginHorizontal: Spacing.md },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
    backgroundColor: Colors.bgElevated,
    borderRadius: 12,
    padding: Spacing.md,
  },
  actionBtn: { alignItems: 'center', gap: Spacing.xs },
  actionLabel: { color: Colors.textSecondary, fontSize: FontSize.sm },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '700' },
  seeAll: { color: Colors.primary, fontSize: FontSize.sm },
  blueprintCard: { marginBottom: Spacing.sm },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardName: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '600' },
  cardCategory: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 2 },
  price: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.md },
});
