// backend/CheckDate.js
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/Selfie');
const Event = require('./models/Event');

async function check() {
  const events = await Event.find();
  if (!events || events.length === 0) {
    console.log('⚠️ Nessun evento trovato nel database');
  } else {
    console.log(`✅ Trovati ${events.length} eventi:\n`);
    events.forEach(ev => {
      console.log(`--- Evento ID: ${ev._id}`);
      console.log(`Title: ${ev.title}`);
      console.log(`startDate type: ${typeof ev.startDate} value: ${ev.startDate}`);
      console.log(`endDate type: ${typeof ev.endDate} value: ${ev.endDate}`);
      console.log(`startTime: ${ev.startTime}`);
      console.log(`endTime: ${ev.endTime}`);
      console.log(`Recurrence: ${ev.recurrence}`);
      console.log('-------------------------------');
    });
  }
  process.exit();
}
check();
