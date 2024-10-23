const express = require('express');
const bcrypt = require('bcryptjs'); // Ensure you have bcryptjs installed
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust the path if necessary
const router = express.Router();

// Route to get all users (ensure you have users.ejs created)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users from the database
        res.render('users', { users }); // Render the users.ejs view
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error'); // Handle server errors
    }
});

// Registration Route
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create a new user
        user = new User({
            username,
            email,
            password: await bcrypt.hash(password, 10), // Hash the password
        });

        await user.save(); // Save user to the database

        res.redirect('/login'); // Redirect to login after successful registration
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error'); // Handle server errors
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Password is Incorrect' });
        }

        // Generate JWT
        const payload = { user: { id: user.id } }; // Include user ID in the payload
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' }) // Set JWT in a cookie
            .redirect('/dashboard'); // Set JWT in a cookie
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error'); // Handle server errors
    }
});

module.exports = router;
