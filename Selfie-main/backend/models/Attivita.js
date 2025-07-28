// backend/models/Attivita.js

const mongoose = require('mongoose');

const AttivitaSchema = new mongoose.Schema({
  titolo: {
    type: String,
    required: true
  },
  descrizione: {
    type: String
  },
  dataScadenza: {
    type: Date,
    required: true
  },
  completata: {
    type: Boolean,
    default: false
  },
  assegnati: [{
    type: String // username o ID utente
  }],
  creatore: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Attivita', AttivitaSchema);
