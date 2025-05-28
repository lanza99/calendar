const express = require('express');

class NoteController {

    constructor(db) {
        this.router = express.Router();
        this.noteService = new (require('../service/NoteService'))(db);

        // Definizione degli endpoint
        this.router.get('/getNote/:id', this.getNote.bind(this));
        this.router.get('/getAllNotes', this.getAllNotes.bind(this));
    }

    
    async getNote(req, res) {
        const id = req.params.id;
        try {
            const note = await this.noteService.findById(id);
            res.status(200).json(note);
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    async getAllNotes(req, res){
        try{
            const notes = this.noteService.getAllNotes();
            res.status(200).json(notes);
        }catch(error){
            res.status(400).send(error.message);
        }
    }
}



module.exports = NoteController;