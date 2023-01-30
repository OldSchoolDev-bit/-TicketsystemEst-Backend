const express = require('express');
const router = express.Router();
const userMiddleware = require('../middleware/users.js');
const verifyJWT = require('../middleware/verifyJWT');
const pool = require('../lib/db.js');

router.get('/check-connection', (req, res) => {
 
});

router.get('/countrys', verifyJWT, (req, res) => {
    res.Status(200).send("Worked fine")

});

router.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
    console.log(req.userData);
    res.send('This is the secret content. Only logged in users can see that!');
});
module.exports = router;