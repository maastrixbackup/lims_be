const express = require('express');
const { deleteProjectData } = require('../controllers/masterController');
const router = express.Router();

router.delete('/deleteProject/:id', deleteProjectData);

module.exports = router;