// backend/models/Event.js
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: String,
  description: String,
  luogo: String,
  startDate: Date,
  endDate: Date,
  allDay: Boolean,
  startTime: String,
  endTime: String,
  reminderMinutes: Number,
  recurrence: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'none'
  },
  color: String,
  assegnati: [String], // chi è stato invitato
  creatore: {
    type: String,
    required: true
  },
  partecipazioni: [
    {
      utente: String,
      stato: {
        type: String,
        enum: ['accettato', 'rifiutato', 'in_attesa'],
        default: 'in_attesa'
      }
    }
  ]
});

module.exports = mongoose.model('Event', EventSchema);
