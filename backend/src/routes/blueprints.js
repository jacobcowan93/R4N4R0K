const { Router } = require('express');
const { getDb } = require('../config/firebase');
const { optionalAuth } = require('../middleware/auth');

const router = Router();

// GET /api/blueprints
router.get('/', optionalAuth, async (req, res) => {
  try {
    const db = getDb();
    const snap = await db.collection('blueprints').orderBy('name').get();
    const blueprints = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(blueprints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/blueprints/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const db = getDb();
    const doc = await db.collection('blueprints').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: 'Blueprint not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
