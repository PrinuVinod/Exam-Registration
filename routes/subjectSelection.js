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
    const userEmail = req.session.email; // Retrieve user's email from session

    // Check if user is authenticated
    if (!userEmail) {
        return res.status(401).send('Unauthorized');
    }

    // Implement logic to handle registration process
    try {
        // Save selected subjects to the user's cart in the database
        await Cart.create({
            email: userEmail,
            subjects: selectedSubjects
        });

        // Respond with success message
        res.send('Subjects registered successfully');
    } catch (error) {
        console.error('Failed to register subjects:', error);
        // Respond with error message
        res.status(500).send('Failed to register subjects');
    }
});

module.exports = router;
