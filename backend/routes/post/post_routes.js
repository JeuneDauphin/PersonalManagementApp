import express from 'express';
import Contact from '../../models/Contact.js';

const router = express.Router();

// POST /api/contacts - create a contact
router.post('/contacts', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json(contact);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create contact', details: err.message });
  }
});

export default router;
