const express = require('express');
const router  = express.Router();
const ctrl    = require('../controller/EventController');

router.get('/',           ctrl.getAll);
router.post('/',          ctrl.create);
router.put('/:id',        ctrl.update);
router.delete('/:id',     ctrl.delete);

// 🔧 Nuova rotta per eliminare una serie
router.delete('/series/:id', ctrl.deleteSeries);

module.exports = router;
