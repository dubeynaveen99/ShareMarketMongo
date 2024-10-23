// routes/profile.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust the path if necessary
const auth = require('../middleware/auth'); // Middleware to authenticate JWT

const router = express.Router();

// profile Route
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id); // Fetch user details by ID from the token
        res.render('profile', { user }); // Render the dashboard view with user data
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
