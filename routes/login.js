const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

router.get('/', (req, res) => {
    res.render('login');
});

router.post('/', async (req, res) => {
    const {
        email,
        password
    } = req.body;

    try {
        const user = await User.findOne({
            email
        });
        if (!user) {
            return res.status(401).render('login', {
                error: 'Invalid email or password'
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).render('login', {
                error: 'Invalid email or password'
            });
        }

        res.redirect('/subjectSelection');
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Failed to login');
    }
});

module.exports = router;
