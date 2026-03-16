const { Router } = require('express');
const { getDb } = require('../config/firebase');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = Router();
const PAGE_SIZE = 20;

// GET /api/marketplace
router.get('/', optionalAuth, async (req, res) => {
  try {
    const db = getDb();
    const { category, rarity, search, page = 1 } = req.query;
    let query = db.collection('listings')
      .where('expiresAt', '>', new Date())
      .orderBy('expiresAt')
      .orderBy('createdAt', 'desc');

    if (category) query = query.where('itemCategory', '==', category);
    if (rarity) query = query.where('rarity', '==', rarity);

    const countSnap = await query.count().get();
    const total = countSnap.data().count;

    const offset = (Number(page) - 1) * PAGE_SIZE;
    const snap = await query.limit(PAGE_SIZE).offset(offset).get();

    let listings = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // In-memory search filter (Firestore doesn't support full-text search natively)
    if (search) {
      const q = search.toLowerCase();
      listings = listings.filter((l) => l.itemName.toLowerCase().includes(q));
    }

    res.json({ listings, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/marketplace
router.post('/', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const { itemName, itemCategory, rarity, price, quantity } = req.body;

    if (!itemName || !price || !quantity) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const userDoc = await db.collection('users').doc(req.uid).get();
    const seller = userDoc.exists
      ? { id: req.uid, username: userDoc.data().username }
      : { id: req.uid, username: 'Unknown' };

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const ref = await db.collection('listings').add({
      itemName,
      itemCategory: itemCategory ?? 'Misc',
      rarity: rarity ?? 'common',
      price: Number(price),
      currency: 'credits',
      quantity: Number(quantity),
      seller,
      createdAt: now,
      expiresAt,
    });

    // Increment activeListings for user
    await db.collection('users').doc(req.uid).update({
      activeListings: (userDoc.data()?.activeListings ?? 0) + 1,
    });

    const doc = await ref.get();
    res.status(201).json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/marketplace/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const doc = await db.collection('listings').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: 'Listing not found' });
    if (doc.data().seller.id !== req.uid) {
      return res.status(403).json({ message: 'Not your listing' });
    }
    await doc.ref.delete();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
