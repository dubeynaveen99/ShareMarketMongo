const express = require('express');
const router = express.Router();

// Example of a route
router.get('/', (req, res) => {
    res.render('index'); // Assuming you have an index.ejs file in the views folder
});

module.exports = router;
