const mongoose = require('mongoose');

const UnavailabilitySchema = new mongoose.Schema({
  utente: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  recurrence: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'none'
  },
  note: String
});

module.exports = mongoose.model('Unavailability', UnavailabilitySchema);
