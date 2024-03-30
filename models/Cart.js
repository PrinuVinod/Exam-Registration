const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    subjects: {
        type: [String],
        required: true
    }
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
