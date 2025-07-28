// backend/controller/AttivitaController.js

const express = require('express');
const router = express.Router();
const Attivita = require('../models/Attivita');

// Crea una nuova attività
router.post('/', async (req, res) => {
  try {
    const attivita = new Attivita(req.body);
    await attivita.save();
    res.status(201).json(attivita);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Ottieni tutte le attività (opzionale: solo del creatore)
router.get('/', async (req, res) => {
  try {
    const { creatore } = req.query;
    const filtro = creatore ? { creatore } : {};
    const attivita = await Attivita.find(filtro).sort({ dataScadenza: 1 });
    res.json(attivita);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ottieni un'attività specifica
router.get('/:id', async (req, res) => {
  try {
    const attivita = await Attivita.findById(req.params.id);
    if (!attivita) return res.status(404).json({ error: 'Attività non trovata' });
    res.json(attivita);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Aggiorna un'attività
router.put('/:id', async (req, res) => {
  try {
    const attivita = await Attivita.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!attivita) return res.status(404).json({ error: 'Attività non trovata' });
    res.json(attivita);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Elimina un'attività
router.delete('/:id', async (req, res) => {
  try {
    const result = await Attivita.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Attività non trovata' });
    res.json({ message: 'Attività eliminata' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Segna attività come completata
router.patch('/:id/completa', async (req, res) => {
  try {
    const attivita = await Attivita.findByIdAndUpdate(
      req.params.id,
      { completata: true },
      { new: true }
    );
    if (!attivita) return res.status(404).json({ error: 'Attività non trovata' });
    res.json(attivita);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
