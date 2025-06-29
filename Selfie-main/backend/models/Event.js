// backend/models/Event.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const EventSchema = new Schema({
  title:       { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate:   { type: Date, required: true },
  allDay:      { type: Boolean, default: false },
  startTime:   { type: String },  // "HH:mm"
  endTime:     { type: String },  // "HH:mm"
  reminder:    { type: Number, default: 0 },  // minuti prima
  recurrence:  { type: String, enum: ['none','daily','weekly','monthly','yearly'], default: 'none' },
  color:       { type: String, default: '#6f42c1' }
});

module.exports = mongoose.model('Event', EventSchema);
