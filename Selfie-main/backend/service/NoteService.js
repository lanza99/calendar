class NoteService {

    constructor(db) {
        this.noteRepository = new (require('../repository/NoteRepository'))(db);
    }

    async findById(id) {
        return await this.noteRepository.findById(id);
    }

    async getAllNotes(){
        return await this.noteRepository.findAllNotes();
    }
}


module.exports = NoteService;