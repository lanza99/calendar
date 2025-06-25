const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// GET all
router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new
router.post('/', async (req, res) => {
  try {
    const ev = new Event(req.body);
    await ev.save();
    res.status(201).json(ev);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update
router.put('/:id', async (req, res) => {
  try {
    const ev = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(ev);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE one
router.delete('/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(404).json({ error: 'Event not found' });
  }
});

// DELETE series
router.delete('/series/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const original = await Event.findById(id);
    if (!original) return res.status(404).json({ error: 'Evento non trovato' });

    const toDelete = await Event.find({
      title: original.title,
      recurrence: original.recurrence,
      startTime: original.startTime,
      startDate: { $gte: original.startDate },
      color: original.color
    });

    const ids = toDelete.map(ev => ev._id);
    await Event.deleteMany({ _id: { $in: ids } });

    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
