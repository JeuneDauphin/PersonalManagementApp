import express from 'express';
import mongoose from 'mongoose';
import Contact from '../../models/Contact.js';

const router = express.Router();

// PATCH /api/contacts/:id - partial update
router.patch('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const updates = req.body;
    const contact = await Contact.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update contact', details: err.message });
  }
});

export default router;
