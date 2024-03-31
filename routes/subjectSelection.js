const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

router.get('/', (req, res) => {
    const subjects = {
        IGCSE: ['MAT-101: Mathematics', 'PHY-101: Physics', 'CHEM-101: Chemistry'],
        AS: ['BIO-101: Biology', 'ECO-101: Economics', 'COMP-101: Computer Science'],
        ALevel: ['LIT-101: Literature', 'HIS-101: History', 'PSY-101: Psychology']
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
