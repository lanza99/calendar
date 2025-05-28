
/* const AttivitaController = require('./src/controller/AttivitaController');
const CalendarioController = require('./src/controller/CalendarioController');
const CategoriaController = require('./src/controller/CategoriaController');
const EventoController = require('./src/controller/EventoController');
const PomodoroController = require('./src/controller/PomodoroController'); */
const UtenteController = require('./controller/UtenteController');
const NoteController = require('./controller/NoteController');
// const cors = require('cors');
const express = require('express');
const { MongoClient} = require('mongodb');


var db;

async function main() {

    const app = express();
    app.use(express.json());
    const port = 8080;
    await connectToDB();

    /* // creazione controllers
    const attivitaController = new AttivitaController(db);
    const calendarioController = new CalendarioController(db);
    const categoriaController = new CategoriaController(db);
    const eventoController = new EventoController(db);
    const pomodoroController = new PomodoroController(db); */
    const utenteController = new UtenteController(db);
    const noteController = new NoteController(db);

    /* // creazione endpoints
    app.use('/attivita', attivitaController.router);
    app.use('/calendario', calendarioController.router);
    app.use('/categoria', categoriaController.router);
    app.use('/evento', eventoController.router);
    app.use('/pomodoro', pomodoroController.router); */
    app.use('/utente', utenteController.router);
    app.use('/note', noteController.router);

    app.listen(port, () => {
    console.log(`Server in esecuzione su http://localhost:${port}`);
    });
}

main();



module.exports = db;

async function connectToDB() {
    const uri = "mongodb://localhost:27017/Selfie";

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connesso a MongoDB');
        db = client.db();
        const collection = db.collection("Utente");

        // aggiungi utente alla Collection
        const newUser = {
            nome: "Samuele",
            cognome: "Selfie",
            email: "samuele.selfie@unibo.com",
            dataDiRegistrazione: new Date() // Data di registrazione
        };

        const result = await collection.insertOne(newUser);
        console.log("Documento inserito correttamente");
        console.log(result);

    } catch(error) {
        console.error("Errore nel connettersi al DB\n", error);
    } finally {
        await client.close();
    }
}


/* const connectToDB = async () => {
    try {
      const mongoURI = 'mongodb://localhost:27017/selfie';  
  
      const options = {
        serverSelectionTimeoutMS: 5000
      };

      await mongoose.connect(mongoURI, options);
      
      const connectionState = mongoose.connection.readyState; 
      if (connectionState === 1) {
        console.log('Connessione a MongoDB stabilita con successo!');
      } else {
        throw new Error('Connessione a MongoDB fallita');
      }
  
    } catch (err) {
      console.error('Errore nella connessione a MongoDB:', err.message);
      process.exit(1); 
    }
  };
connectToDB();

const noteSchema = new mongoose.Schema({
    id: Number,
    title: String,
    body: String,
    creator: String,
    lastModificationDate: String,
    creationDate: String
});
const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

const Note = mongoose.model('Note', noteSchema);
const User = mongoose.model('User', userSchema);

app.get('/getAllNotes', async (req, res) => {
    try {
        const notes = await Note.find();
        res.status(200).json(notes);
    } catch (err) {
        console.error('Errore nel recupero delle note:', err.message);
        res.status(500).json({ message: 'Errore nel recupero delle note' });
    }
});

app.get('/getNote/:id', async (req, res) => {
    const noteId = parseInt(req.params.id);
    try{
        const note = await Note.findOne({id: noteId});
        res.json(note);
    }
    catch{
        console.error("Unable to fetch note: ", id);
        res.status(400).json({message: "Unable to fetch note"});
    }

});

app.post('/login', async (req, res) => {
    console.log("Login attempt for user:", req.body.email);

    try {
        const userFound = await User.findOne({email: req.body.email});

        if(!userFound){
            console.log('User not found');
            return res.json({message: "User not found."});
        }

        if (userFound.password === req.body.password){
            console.log(req.body.email, ': Login succesfull');
            const token = jwt.sign({ email: req.body.email }, '77f8519958b5544c3bd4742ef610563df88be40ba4bd164309a8c37261412ab1'); 
            return res.status(200).json({ token, email: req.body.email});
        }
        else{
            console.log('Invalid password.')
            return res.status(400).json({ message: 'Password invalid.' });
        }

    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
  }); */
