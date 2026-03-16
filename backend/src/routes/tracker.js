const { Router } = require('express');
const admin = require('firebase-admin');
const { getDb } = require('../config/firebase');
const { authenticate } = require('../middleware/auth');

const router = Router();

// GET /api/tracker — list tracked blueprints for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const userDoc = await db.collection('users').doc(req.uid).get();
    const trackedIds = userDoc.data()?.trackedBlueprints ?? [];

    if (trackedIds.length === 0) return res.json([]);

    // Firestore 'in' query supports max 30 items; chunk if needed
    const chunks = [];
    for (let i = 0; i < trackedIds.length; i += 30) {
      chunks.push(trackedIds.slice(i, i + 30));
    }

    const results = await Promise.all(
      chunks.map((chunk) =>
        db.collection('blueprints').where(admin.firestore.FieldPath.documentId(), 'in', chunk).get(),
      ),
    );

    const blueprints = results.flatMap((snap) =>
      snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    );
    res.json(blueprints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tracker/:blueprintId — track a blueprint
router.post('/:blueprintId', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const { blueprintId } = req.params;

    const bpDoc = await db.collection('blueprints').doc(blueprintId).get();
    if (!bpDoc.exists) return res.status(404).json({ message: 'Blueprint not found' });

    await db.collection('users').doc(req.uid).update({
      trackedBlueprints: admin.firestore.FieldValue.arrayUnion(blueprintId),
    });

    // Increment trackedBy counter on blueprint
    await bpDoc.ref.update({
      trackedBy: admin.firestore.FieldValue.increment(1),
    });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/tracker/:blueprintId — untrack a blueprint
router.delete('/:blueprintId', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const { blueprintId } = req.params;

    await db.collection('users').doc(req.uid).update({
      trackedBlueprints: admin.firestore.FieldValue.arrayRemove(blueprintId),
    });

    const bpDoc = await db.collection('blueprints').doc(blueprintId).get();
    if (bpDoc.exists) {
      await bpDoc.ref.update({
        trackedBy: admin.firestore.FieldValue.increment(-1),
      });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
