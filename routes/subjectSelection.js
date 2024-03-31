const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

router.get('/', (req, res) => {
    const subjects = {
        IGCSE: ['Mathematics', 'Physics', 'Chemistry'],
        AS: ['Biology', 'Economics', 'Computer Science'],
        ALevel: ['Literature', 'History', 'Psychology']
    };

    res.render('subjectSelection', {
        subjects
    });
});

router.post('/register', async (req, res) => {
    const selectedSubjects = req.body.subjects;
    const userEmail = req.session.email;

    if (!userEmail) {
        return res.status(401).send('Unauthorized');
    }

    try {
        await Cart.create({
            email: userEmail,
            subjects: selectedSubjects
        });

        res.send('Subjects registered successfully');
    } catch (error) {
        console.error('Failed to register subjects:', error);
        res.status(500).send('Failed to register subjects');
    }
});

module.exports = router;
