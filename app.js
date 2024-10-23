const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs'); // Use bcryptjs for password hashing
const cookieParser = require('cookie-parser'); // Make sure to require cookie-parser
const jwt = require('jsonwebtoken'); // Import jsonwebtoken

dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser()); // Use cookie-parser middleware
app.use(express.static(path.join(__dirname, 'public')));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB connection
const connectDB = require('./config/db');
connectDB();

// User model definition
const User = require('./models/User'); // Ensure this path is correct

// Routes
const indexRoutes = require('./routes/index');
const userRoutes = require('./routes/user');
const dashboardRoutes = require('./routes/dashboard');

// Use Routes
app.use('/', indexRoutes);
app.use('/user', userRoutes);
app.use('/dashboard', dashboardRoutes);

// User registration and login routes
app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/login', (req, res) => {
    res.render('login');
});

// Registration logic (assuming it’s moved to user routes)
app.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    // Registration logic
    if (password !== confirmPassword) {
        return res.render('register', { error: 'Passwords do not match' });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('register', { error: 'User already exists' });
        }

        // Create a new user
        const user = new User({ username, email, password: await bcrypt.hash(password, 10) });
        await user.save();

        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.render('register', { error: 'Error creating user' });
    }
});

// Login logic (assuming it’s moved to user routes)
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render('login', { error: 'Invalid email or password' });
        }

        // Generate JWT
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.cookie('token', token, { httpOnly: true }).redirect('/dashboard');
        });
    } catch (error) {
        console.error(error);
        res.render('login', { error: 'Error logging in' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
