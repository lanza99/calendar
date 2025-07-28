// backend/controller/UnavailabilityController.js
const express = require('express');
const router = express.Router();
const Unavailability = require('../models/unavailability');

// Crea
router.post('/', async (req, res) => {
  try {
    const entry = new Unavailability(req.body);
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Leggi tutte per utente
router.get('/:utente', async (req, res) => {
  try {
    const unavailability = await Unavailability.find({ utente: req.params.utente });
    res.json(unavailability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Modifica
router.patch('/:id', async (req, res) => {
  try {
    const updated = await Unavailability.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// (opzionale) Cancella
router.delete('/:id', async (req, res) => {
  try {
    await Unavailability.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(404).json({ error: 'Not found' });
  }
});

module.exports = router;
