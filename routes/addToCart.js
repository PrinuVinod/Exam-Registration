const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

router.post('/', async (req, res) => {
    const {
        email,
        subjects
    } = req.body;

    try {
        const cart = new Cart({
            email,
            subjects
        });
        await cart.save();
        res.send('Subjects added to cart successfully');
    } catch (error) {
        console.error('Error adding subjects to cart:', error.message);
        res.status(500).send('Failed to add subjects to cart');
    }
});

module.exports = router;
