// backend/clearEvents.js
const mongoose = require('mongoose');
const Event = require('./models/Event');

mongoose.connect('mongodb://127.0.0.1:27017/Selfie')
  .then(async () => {
    const res = await Event.deleteMany({});
    console.log(`✅ Eliminati ${res.deletedCount} eventi`);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Errore durante la connessione o eliminazione:', err);
  });
