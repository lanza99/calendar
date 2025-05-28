const express = require('express');

class UtenteController {

    constructor(db) {
        this.router = express.Router();
        this.userService = new (require('../service/UtenteService'))(db);

        // Definizione degli endpoint
        this.router.get('/:id', this.getUser.bind(this));
    }

    
    async getUser(req, res) {
        const utenteId = req.params.id;
        try {
            const utente = await this.userService.findById(utenteId);
            res.status(200).json(utente);
        } catch (error) {
            res.status(500).send(error.message);
        }
    }
}



module.exports = UtenteController;