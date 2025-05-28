class UtenteRepository {
    
    constructor(db) {
        this.collection = db.collection('users');
    }

    async findById(id) {
        return this.collection.findOne({ _id: id });
    }

}

module.exports = UtenteRepository;