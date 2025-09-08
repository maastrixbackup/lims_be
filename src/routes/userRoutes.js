const express = require('express');
const router = express.Router();

const userProfile = require('../controllers/userController');

router.post('/userProfile',userProfile);

module.exports = router;