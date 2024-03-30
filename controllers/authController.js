const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.login = async (req, res) => {
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
};
