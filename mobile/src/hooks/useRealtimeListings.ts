import { useEffect, useRef, useState } from 'react';
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
  type Query,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Listing } from '@/services/api';

interface Options {
  category?: string;
  rarity?: string;
  pageSize?: number;
}

function docToListing(id: string, data: DocumentData): Listing {
  return {
    id,
    itemName: data.itemName ?? '',
    itemCategory: data.itemCategory ?? '',
    rarity: data.rarity ?? 'common',
    imageUrl: data.imageUrl,
    price: data.price ?? 0,
    currency: 'credits',
    quantity: data.quantity ?? 1,
    seller: data.seller ?? { id: '', username: 'Unknown' },
    createdAt: (data.createdAt instanceof Timestamp
      ? data.createdAt.toDate()
      : new Date(data.createdAt ?? 0)
    ).toISOString(),
    expiresAt: (data.expiresAt instanceof Timestamp
      ? data.expiresAt.toDate()
      : new Date(data.expiresAt ?? 0)
    ).toISOString(),
  };
}

/**
 * Real-time Firestore listener for marketplace listings.
 * Returns live-updating listings — new posts and deletions reflect instantly
 * without a manual refresh.
 */
export function useRealtimeListings(options: Options = {}) {
  const { category, rarity, pageSize = 40 } = options;
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    let q: Query = query(
      collection(db, 'listings'),
      where('expiresAt', '>', Timestamp.now()),
      orderBy('expiresAt'),
      orderBy('createdAt', 'desc'),
      limit(pageSize),
    );

    if (category && category !== 'All') {
      q = query(q, where('itemCategory', '==', category));
    }
    if (rarity && rarity !== 'All') {
      q = query(q, where('rarity', '==', rarity.toLowerCase()));
    }

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((doc) => docToListing(doc.id, doc.data()));
        setListings(items);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    unsubRef.current = unsub;
    return () => unsub();
  }, [category, rarity, pageSize]);

  return { listings, loading, error };
}
