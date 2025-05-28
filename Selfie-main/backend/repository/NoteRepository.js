class NoteRepository {
    
    constructor(db) {
        this.collection = db.collection('notes');
    }

    async findById(id) {
        return this.collection.findOne({ _id: id });
    }

    async findAllNotes(){
        console.log(`Using database: ${this.collection.s.dbName}`);  // Verifica il database
        console.log(`Using collection: ${this.collection.collectionName}`);
        try {
            const notes = await this.collection.find({}).toArray();  
            return notes;
        } catch (error) {
            console.error('Error retrieving notes:', error);
            throw error;  
        }
    }

}

module.exports = NoteRepository;