const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: String,
    password: String
}));

const Cart = mongoose.model('Cart', new mongoose.Schema({
    email: String,
    subjects: [String]
}));

app.get('/', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    const {
        name,
        email,
        password
    } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });
        await newUser.save();
        req.session.email = email;
        res.redirect('/login');
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).send('Failed to register user');
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const {
        email,
        password
    } = req.body;

    try {
        const user = await User.findOne({
            email
        });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).render('login', {
                error: 'Invalid email or password'
            });
        }
        req.session.email = email;
        res.redirect('/subjectSelection');
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Failed to login');
    }
});

app.get('/subjectSelection', authenticateUser, (req, res) => {
    const userEmail = req.session.email;
    const subjects = {
        IGCSE: ['Mathematics', 'Physics', 'Chemistry'],
        AS: ['Biology', 'Economics', 'Computer Science'],
        ALevel: ['Literature', 'History', 'Psychology']
    };

    res.render('subjectSelection', {
        userEmail,
        subjects
    });
});

app.post('/subjectSelection/register', authenticateUser, async (req, res) => {
    const {
        email,
        subjects
    } = req.body;
    try {
        let cart = await Cart.findOne({
            email
        });

        if (!cart) {
            cart = new Cart({
                email,
                subjects
            });
        } else {
            cart.subjects = [...cart.subjects, ...subjects];
        }

        await cart.save();

        res.send('Subjects added to cart successfully');
    } catch (error) {
        console.error('Error adding subjects to cart:', error);
        res.status(500).send('Failed to add subjects to cart');
    }
});

app.get('/cart', async (req, res) => {
    try {
        const cartItems = await Cart.find({
            email: req.session.email
        }).exec();
        res.render('cart', {
            cartItems
        });
    } catch (error) {
        console.error('Error retrieving cart items:', error);
        res.status(500).send('Failed to retrieve cart items');
    }
});

app.get('/search', authenticateUser, async (req, res) => {
    const userEmail = req.query.email;

    try {
        const cart = await Cart.findOne({
            email: userEmail
        }).exec();
        if (!cart) {
            return res.json([]);
        }

        const cartItems = cart.subjects;
        res.json(cartItems);
    } catch (error) {
        console.error('Error retrieving cart items:', error);
        res.status(500).send('Failed to retrieve cart items');
    }
});

function authenticateUser(req, res, next) {
    if (req.session.email) {
        next();
    } else {
        res.redirect('/login');
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
