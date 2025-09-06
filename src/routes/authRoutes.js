const express = require('express');
const router = express.Router();
const { signup, login} = require('../controllers/authController');

//Signup(Register user)
router.post('/signup', signup);

//Login (Authenticate user)
router.post('/login', login);

module.exports = router;