const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', (req, res) => {
    res.render('signup');
});

router.post('/', async (req, res) => {
    const {
        name,
        email,
        password
    } = req.body;

    try {
        const newUser = new User({
            name,
            email,
            password
        });
        await newUser.save();
        res.redirect('/login');
    } catch (error) {
        res.status(500).send('Failed to register user');
    }
});

module.exports = router;
