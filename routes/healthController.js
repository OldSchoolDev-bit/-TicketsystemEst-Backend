const express = require('express');
const healthRouter = express.Router();
const pool = require('../lib/db.js');


/**
 * @swagger
 * /check-alive:
 *   get:
 *     summary: Returns health Status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: The server is alive
 *         content:
 *           application/json:
 */
healthRouter.get('/check-alive', (req, res) => {
  res.set({
    'API-Version': '1.0',
    'API-Author': 'Sebastian Stadlmeier',
    'Tip-Of-The-Day': 'Drink Mate Cola'
  })
  return res.status(200).send('The Server is alive')
});


module.exports = healthRouter;