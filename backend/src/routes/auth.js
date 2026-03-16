const { Router } = require('express');
const admin = require('firebase-admin');
const { getDb } = require('../config/firebase');
const { authenticate } = require('../middleware/auth');

const router = Router();

// POST /api/auth/register
// Creates a Firebase Auth user + Firestore user doc
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  try {
    const db = getDb();

    // Check username uniqueness
    const usernameSnap = await db
      .collection('users')
      .where('username', '==', username)
      .limit(1)
      .get();
    if (!usernameSnap.empty) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    const userRecord = await admin.auth().createUser({ email, password, displayName: username });

    const now = new Date();
    const userData = {
      username,
      email,
      avatarUrl: null,
      credits: 1000, // starter credits
      joinedAt: now,
      trackedBlueprints: [],
      activeListings: 0,
    };
    await db.collection('users').doc(userRecord.uid).set(userData);

    // Create a custom token (client should exchange for ID token via Firebase SDK)
    const token = await admin.auth().createCustomToken(userRecord.uid);

    res.status(201).json({
      token,
      user: { id: userRecord.uid, ...userData, joinedAt: now.toISOString() },
    });
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      return res.status(409).json({ message: 'Email already in use' });
    }
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
// Returns a custom token — mobile client should use Firebase SDK to sign in
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Firebase Admin SDK can't verify passwords directly; use Firebase Auth REST API
    const firebaseApiKey = process.env.FIREBASE_WEB_API_KEY;
    if (!firebaseApiKey) {
      return res.status(503).json({ message: 'Login service not configured' });
    }

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      },
    );
    const data = await response.json();

    if (!response.ok) {
      const msg = data.error?.message ?? 'Invalid credentials';
      return res.status(401).json({ message: msg });
    }

    const db = getDb();
    const userDoc = await db.collection('users').doc(data.localId).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    res.json({
      token: data.idToken,
      user: {
        id: data.localId,
        email: data.email,
        ...userData,
        joinedAt: userData.joinedAt?.toDate?.()?.toISOString() ?? null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const doc = await db.collection('users').doc(req.uid).get();
    if (!doc.exists) return res.status(404).json({ message: 'User not found' });
    const data = doc.data();
    res.json({
      id: req.uid,
      ...data,
      joinedAt: data.joinedAt?.toDate?.()?.toISOString() ?? null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
