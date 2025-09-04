import express from 'express';
import mongoose from 'mongoose';
import Contact from '../../models/Contact.js';

const router = express.Router();

// GET /api/contacts - list with optional query params: page, limit, q, type
router.get('/contacts', async (req, res) => {
  try {
    const { page = 1, limit = 40, q, type } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (q) {
      filter.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Contact.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(Number(limit)),
      Contact.countDocuments(filter),
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contacts', details: err.message });
  }
});

// GET /api/contacts/:id - single contact
router.get('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const contact = await Contact.findById(id);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contact', details: err.message });
  }
});

export default router;
