class UtenteService {

    constructor(db) {
        this.utenteRepository = new (require('../repository/UtenteRepository'))(db);
    }

    async findById(id) {
        return await this.utenteRepository.findById(id);
    }
}


module.exports = UtenteService;