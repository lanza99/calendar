// backend/app.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import controller/router
const UtenteController = require('./controller/UtenteController');
const NoteController = require('./controller/NoteController');
const eventRouter = require('./controller/EventController');
const attivitaRouter = require('./controller/AttivitaController');
const unavailabilityRouter = require('./controller/UnavailabilityController');


const app = express();
const port = 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/evento', eventRouter);
app.use('/attivita', attivitaRouter);
app.use('/unavailability', unavailabilityRouter);


// Connessione a MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/Selfie', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Connesso a MongoDB');
  startServer();
})
.catch(err => {
  console.error('❌ Errore nella connessione a MongoDB:', err);
  process.exit(1);
});

function startServer() {
  // Controllers che usano direttamente MongoDB
  const db = mongoose.connection.db;
  const utenteController = new UtenteController(db);
  const noteController = new NoteController(db);

  // Rotte
  app.use('/utente', utenteController.router);
  app.use('/note', noteController.router);
  app.use('/evento', eventRouter); // Eventi già pronti con mongoose

  app.listen(port, () => {
    console.log(`🚀 Server in esecuzione su http://localhost:${port}`);
  });
}
