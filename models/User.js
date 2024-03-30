const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const hashedPassword = await bcrypt.hash(this.password, parseInt(process.env.SALT_ROUNDS));
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
