// backend/controller/EventController.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// GET all eventi
router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST nuovo evento
router.post('/', async (req, res) => {
  try {
    const data = {
      ...req.body,
      creatore: req.body.creatore || 'sconosciuto',
      assegnati: req.body.assegnati || [],
      partecipazioni: (req.body.assegnati || []).map(u => ({
        utente: u,
        stato: 'in_attesa'
      }))
    };
    const ev = new Event(data);
    await ev.save();
    res.status(201).json(ev);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT aggiornamento evento
router.put('/:id', async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      creatore: req.body.creatore || 'sconosciuto',
      assegnati: req.body.assegnati || []
    };
    const updated = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH risposta ad un invito (accetta/rifiuta/in_attesa)
router.patch('/:id/rispondi', async (req, res) => {
  try {
    const { utente, stato } = req.body;
    if (!utente || !['accettato', 'rifiutato', 'in_attesa'].includes(stato)) {
      return res.status(400).json({ error: 'Dati non validi' });
    }

    const evento = await Event.findById(req.params.id);
    if (!evento) return res.status(404).json({ error: 'Evento non trovato' });

    const partecipazione = evento.partecipazioni.find(p => p.utente === utente);

    if (partecipazione) {
      partecipazione.stato = stato;
    } else {
      evento.partecipazioni.push({ utente, stato });
    }

    await evento.save();
    res.json({ message: 'Stato aggiornato' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE singolo evento
router.delete('/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(404).json({ error: 'Event not found' });
  }
});

// DELETE intera serie di eventi ricorrenti
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
