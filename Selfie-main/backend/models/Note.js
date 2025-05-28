/* const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    owner: { 
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Utente'
    },
    categoria: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categoria'
    },
    titolo: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    testo: {
        type: String,
        trim: true
    },
    is_in_markdown: {
        type: Boolean,
        default: false
    },
    is_pubblica: {
        type: Boolean,
        default: true
    },
    visibile_da: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utente'
    }]
}, {
    timestamps: true
});

// Pre-save hook
noteSchema.post('save', function(next) {
    if (this.is_pubblica) {
        this.visibile_da = null;
    }
    next();
});

const Note = mongoose.model('Note', noteSchema); */

class Note {
    constructor(id, title, body, creator, lastModificationDate, creationDate) {
      this.id = id;
      this.title = title;
      this.body = body;
      this.creator = creator;
      this.lastModificationDate =lastModificationDate;
      this.creationDate = creationDate;
    }
  }
  
  module.exports = Note;