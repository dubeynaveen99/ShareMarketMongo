// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies.token; // Get the token from cookies
    if (!token) {
        return res.redirect('/user/login'); // Redirect to login if token is not present
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
        req.user = decoded.user; // Attach user info to the request object
        next(); // Call the next middleware or route handler
    } catch (error) {
        console.error(error.message);
        res.redirect('/user/login'); // Redirect to login on token verification failure
    }
};
