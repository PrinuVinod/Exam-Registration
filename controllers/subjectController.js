const Cart = require('../models/Cart');

exports.addToCart = async (req, res) => {
    const {
        email,
        subjects
    } = req.body;

    try {
        await Cart.create({
            email,
            subjects
        });
        res.send('Subjects added to cart successfully');
    } catch (error) {
        console.error('Error adding subjects to cart:', error);
        res.status(500).send('Failed to add subjects to cart');
    }
};
