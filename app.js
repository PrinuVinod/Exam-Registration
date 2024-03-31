const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const PDFDocument = require('pdfkit');
const blobStream = require('blob-stream');
const path = require('path');
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

app.use(express.static(path.join(__dirname, 'public')));

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
        IGCSE: ['MAT-101: Mathematics', 'PHY-101: Physics', 'CHEM-101: Chemistry'],
        AS: ['BIO-101: Biology', 'ECO-101: Economics', 'COMP-101: Computer Science'],
        ALevel: ['LIT-101: Literature', 'HIS-101: History', 'PSY-101: Psychology']
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
            await cart.save();
            return res.send('Subjects added to cart successfully');
        }

        const existingSubjects = cart.subjects;
        const newSubjects = subjects.filter(subject => !existingSubjects.includes(subject));

        if (newSubjects.length === 0) {
            return res.status(400).send('All subjects already exist in the cart');
        }

        cart.subjects = [...existingSubjects, ...newSubjects];
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

app.get('/generateInvoice', async (req, res) => {
    try {
        const userEmail = req.query.email;
        const cart = await Cart.findOne({
            email: userEmail
        }).exec();
        if (!cart) {
            return res.status(404).send('Cart not found');
        }
        res.json(cart.subjects);
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).send('Failed to generate invoice');
    }
});

app.get('/generatePDFInvoice', async (req, res) => {
    try {
        const userEmail = req.query.email;
        const cart = await Cart.findOne({
            email: userEmail
        }).exec();
        if (!cart) {
            return res.status(404).send('Cart not found');
        }

        const doc = new PDFDocument();

        res.setHeader('Content-disposition', 'attachment; filename="invoice.pdf"');
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        doc.fontSize(12).text(`Email: ${userEmail}`, 50, 50);
        doc.moveDown();
        doc.fontSize(14).text('Subjects:', 50, 100);
        cart.subjects.forEach((item, index) => {
            doc.text(`${index + 1}. ${item}`, 60, 130 + index * 20);
        });

        doc.end();
    } catch (error) {
        console.error('Error generating PDF invoice:', error);
        res.status(500).send('Failed to generate PDF invoice');
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
