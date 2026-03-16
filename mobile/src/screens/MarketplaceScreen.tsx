/**
 * Marketplace screen — G2G-inspired layout
 *
 * Features:
 * - Top sort bar (Most Recent, Price ↑↓, Rating)
 * - Filter sheet (category, rarity, price range, delivery type)
 * - Listing cards: item image placeholder, name, seller with star rating,
 *   trust badge, delivery type, price & Buy Now button
 * - Infinite scroll / pagination
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RarityBadge } from '@/components/RarityBadge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Listing } from '@/services/api';
import { useRealtimeListings } from '@/hooks/useRealtimeListings';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/theme';

// ─── Types ─────────────────────────────────────────────────────────────────

type SortKey = 'most_recent' | 'price_asc' | 'price_desc' | 'rating';

interface Filters {
  category: string;
  rarity: string;
  minPrice: string;
  maxPrice: string;
  delivery: 'all' | 'instant' | 'manual';
}

const DEFAULT_FILTERS: Filters = {
  category: 'All',
  rarity: 'All',
  minPrice: '',
  maxPrice: '',
  delivery: 'all',
};

// ─── Constants ──────────────────────────────────────────────────────────────

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'most_recent', label: 'Most Recent' },
  { key: 'price_asc', label: 'Price ↑' },
  { key: 'price_desc', label: 'Price ↓' },
  { key: 'rating', label: 'Top Rated' },
];

const CATEGORIES = ['All', 'Weapon', 'Armor', 'Tool', 'Consumable', 'Module'];
const RARITIES = ['All', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
const DELIVERY_OPTIONS: { key: Filters['delivery']; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'instant', label: 'Instant' },
  { key: 'manual', label: 'Manual' },
];

// ─── Main Screen ────────────────────────────────────────────────────────────

export function MarketplaceScreen() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('most_recent');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [filterVisible, setFilterVisible] = useState(false);

  // Real-time Firestore listener — updates instantly when listings are added/removed
  const { listings, loading } = useRealtimeListings({
    category: filters.category !== 'All' ? filters.category : undefined,
    rarity: filters.rarity !== 'All' ? filters.rarity : undefined,
  });

  const activeFilters = Object.values(filters).filter(
    (v) => v !== 'All' && v !== 'all' && v !== '',
  ).length;

  // Client-side sort + search + price range
  const displayed = useMemo(() => {
    const min = Number(filters.minPrice) || 0;
    const max = Number(filters.maxPrice) || Infinity;
    const q = search.toLowerCase();

    let list = listings.filter(
      (l) =>
        l.price >= min &&
        l.price <= max &&
        (q === '' || l.itemName.toLowerCase().includes(q)),
    );

    if (sort === 'price_asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') list = [...list].sort((a, b) => b.price - a.price);

    return list;
  }, [listings, sort, search, filters.minPrice, filters.maxPrice]);

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {/* ── Search Bar ─────────────────────────────────────────── */}
      <View style={styles.searchRow}>
        <View style={styles.searchInput}>
          <Ionicons name="search" size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchText}
            value={search}
            onChangeText={setSearch}
            placeholder="Search items…"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, activeFilters > 0 && styles.filterBtnActive]}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons
            name="options"
            size={18}
            color={activeFilters > 0 ? Colors.bg : Colors.textSecondary}
          />
          {activeFilters > 0 && <Text style={styles.filterCount}>{activeFilters}</Text>}
        </TouchableOpacity>
      </View>

      {/* ── Sort Bar ──────────────────────────────────────────── */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={SORT_OPTIONS}
        keyExtractor={(s) => s.key}
        contentContainerStyle={styles.sortBar}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.sortChip, sort === item.key && styles.sortChipActive]}
            onPress={() => setSort(item.key)}
          >
            <Text style={[styles.sortChipText, sort === item.key && styles.sortChipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* ── Results header ────────────────────────────────────── */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>{displayed.length.toLocaleString()} listings</Text>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>
      </View>

      {/* ── Listings ──────────────────────────────────────────── */}
      <FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <G2GListingCard listing={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<EmptyState />}
      />

      {/* ── Filter Modal ──────────────────────────────────────── */}
      <FilterSheet
        visible={filterVisible}
        filters={filters}
        onApply={(f) => { setFilters(f); setFilterVisible(false); }}
        onClose={() => setFilterVisible(false)}
      />
    </SafeAreaView>
  );
}

// ─── Listing Card (G2G-style) ───────────────────────────────────────────────

function G2GListingCard({ listing }: { listing: Listing }) {
  // Simulate seller data — in production this comes from the API
  const sellerRating = 4.8;
  const reviewCount = 312;
  const isInstant = listing.id.charCodeAt(0) % 2 === 0; // mock
  const isVerified = listing.id.charCodeAt(1) % 3 !== 0; // mock

  const expiresInHours = Math.max(
    0,
    Math.floor((new Date(listing.expiresAt).getTime() - Date.now()) / 3600000),
  );

  return (
    <View style={styles.card}>
      {/* Left: item icon placeholder */}
      <View style={styles.cardIcon}>
        <Ionicons name="cube" size={28} color={Colors.primary} />
      </View>

      {/* Center: info */}
      <View style={styles.cardBody}>
        {/* Item name + rarity */}
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardItemName} numberOfLines={1}>{listing.itemName}</Text>
          <RarityBadge rarity={listing.rarity} />
        </View>

        {/* Seller row */}
        <View style={styles.sellerRow}>
          <View style={styles.sellerAvatar}>
            <Text style={styles.sellerAvatarText}>
              {listing.seller.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.sellerName} numberOfLines={1}>{listing.seller.username}</Text>
          {isVerified && (
            <Ionicons name="shield-checkmark" size={12} color={Colors.info} style={styles.verifiedIcon} />
          )}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color="#FFD700" />
            <Text style={styles.ratingText}>{sellerRating}</Text>
            <Text style={styles.reviewCount}>({reviewCount})</Text>
          </View>
        </View>

        {/* Tags row */}
        <View style={styles.tagsRow}>
          {isInstant ? (
            <View style={[styles.tag, styles.tagInstant]}>
              <Ionicons name="flash" size={10} color={Colors.success} />
              <Text style={[styles.tagText, { color: Colors.success }]}>Instant</Text>
            </View>
          ) : (
            <View style={[styles.tag, styles.tagManual]}>
              <Ionicons name="time-outline" size={10} color={Colors.textSecondary} />
              <Text style={[styles.tagText, { color: Colors.textSecondary }]}>Manual</Text>
            </View>
          )}
          <View style={styles.tag}>
            <Ionicons name="cube-outline" size={10} color={Colors.textMuted} />
            <Text style={[styles.tagText, { color: Colors.textMuted }]}>×{listing.quantity}</Text>
          </View>
          <View style={styles.tag}>
            <Ionicons name="time-outline" size={10} color={Colors.textMuted} />
            <Text style={[styles.tagText, { color: Colors.textMuted }]}>{expiresInHours}h left</Text>
          </View>
        </View>
      </View>

      {/* Right: price + buy */}
      <View style={styles.cardPriceCol}>
        <Text style={styles.priceLabel}>Price</Text>
        <Text style={styles.price}>{listing.price.toLocaleString()}</Text>
        <Text style={styles.priceCurrency}>credits</Text>
        <TouchableOpacity style={styles.buyBtn}>
          <Text style={styles.buyBtnText}>Buy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="storefront-outline" size={48} color={Colors.textMuted} />
      <Text style={styles.emptyTitle}>No Listings Found</Text>
      <Text style={styles.emptyBody}>Try adjusting your filters or search term.</Text>
    </View>
  );
}

// ─── Filter Sheet ────────────────────────────────────────────────────────────

interface FilterSheetProps {
  visible: boolean;
  filters: Filters;
  onApply: (f: Filters) => void;
  onClose: () => void;
}

function FilterSheet({ visible, filters, onApply, onClose }: FilterSheetProps) {
  const [local, setLocal] = useState<Filters>(filters);

  useEffect(() => {
    if (visible) setLocal(filters);
  }, [visible, filters]);

  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    setLocal((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose} />
      <View style={styles.sheet}>
        {/* Header */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Filters</Text>
          <TouchableOpacity
            onPress={() => { setLocal(DEFAULT_FILTERS); onApply(DEFAULT_FILTERS); }}
          >
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Category */}
          <FilterSection label="Category">
            <ChipGroup
              options={CATEGORIES}
              value={local.category}
              onChange={(v) => update('category', v)}
            />
          </FilterSection>

          {/* Rarity */}
          <FilterSection label="Rarity">
            <ChipGroup
              options={RARITIES}
              value={local.rarity}
              onChange={(v) => update('rarity', v)}
            />
          </FilterSection>

          {/* Price Range */}
          <FilterSection label="Price Range">
            <View style={styles.priceRange}>
              <TextInput
                style={styles.priceInput}
                placeholder="Min"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                value={local.minPrice}
                onChangeText={(v) => update('minPrice', v)}
              />
              <Text style={styles.priceRangeDash}>–</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                value={local.maxPrice}
                onChangeText={(v) => update('maxPrice', v)}
              />
            </View>
          </FilterSection>

          {/* Delivery */}
          <FilterSection label="Delivery Type">
            <ChipGroup
              options={DELIVERY_OPTIONS.map((d) => d.label)}
              value={DELIVERY_OPTIONS.find((d) => d.key === local.delivery)?.label ?? 'All'}
              onChange={(label) => {
                const opt = DELIVERY_OPTIONS.find((d) => d.label === label);
                if (opt) update('delivery', opt.key);
              }}
            />
          </FilterSection>
        </ScrollView>

        <TouchableOpacity style={styles.applyBtn} onPress={() => onApply(local)}>
          <Text style={styles.applyBtnText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.chipGroup}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[styles.filterChip, value === opt && styles.filterChipActive]}
          onPress={() => onChange(opt)}
        >
          <Text style={[styles.filterChipText, value === opt && styles.filterChipTextActive]}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    height: 42,
    gap: Spacing.xs,
  },
  searchText: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.md },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  filterBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterCount: { color: Colors.bg, fontSize: FontSize.xs, fontWeight: '700' },

  // Sort bar
  sortBar: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  sortChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
  },
  sortChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sortChipText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  sortChipTextActive: { color: Colors.bg, fontWeight: '700' },

  // Results header
  resultsHeader: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultsCount: { color: Colors.textMuted, fontSize: FontSize.sm },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  liveText: { color: Colors.success, fontSize: FontSize.xs, fontWeight: '600' },

  // List
  listContent: { paddingBottom: Spacing.xxl },
  separator: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.md },

  // ── G2G Card ──────────────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    flexShrink: 0,
  },
  cardBody: { flex: 1, gap: 4 },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  cardItemName: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
    flex: 1,
  },

  // Seller
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sellerAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerAvatarText: { color: Colors.bg, fontSize: 9, fontWeight: '800' },
  sellerName: { color: Colors.textSecondary, fontSize: FontSize.xs, maxWidth: 80 },
  verifiedIcon: { marginLeft: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 4 },
  ratingText: { color: '#FFD700', fontSize: FontSize.xs, fontWeight: '700' },
  reviewCount: { color: Colors.textMuted, fontSize: FontSize.xs },

  // Tags
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagInstant: { borderColor: Colors.success + '55' },
  tagManual: {},
  tagText: { fontSize: FontSize.xs },

  // Price column
  cardPriceCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexShrink: 0,
    minWidth: 72,
  },
  priceLabel: { color: Colors.textMuted, fontSize: FontSize.xs },
  price: { color: Colors.primary, fontSize: FontSize.lg, fontWeight: '800' },
  priceCurrency: { color: Colors.textMuted, fontSize: 10, marginTop: -4 },
  buyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 60,
  },
  buyBtnText: { color: Colors.bg, fontWeight: '700', fontSize: FontSize.sm },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
    gap: Spacing.md,
  },
  emptyTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '700' },
  emptyBody: { color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'center' },

  // Filter modal
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bgElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    maxHeight: '80%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sheetTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '700' },
  resetText: { color: Colors.primary, fontSize: FontSize.md },
  filterSection: { marginBottom: Spacing.lg },
  filterSectionLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  filterChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  filterChipTextActive: { color: Colors.bg, fontWeight: '700' },
  priceRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  priceInput: {
    flex: 1,
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
  },
  priceRangeDash: { color: Colors.textMuted },
  applyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  applyBtnText: { color: Colors.bg, fontWeight: '700', fontSize: FontSize.md },
});
