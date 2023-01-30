const express = require('express');
const ticketRouter = express.Router();
const pool = require('../lib/db.js');

ticketRouter.get('/', async (req, res) => {
    pool.pool.query(`SELECT * FROM ticket;`, (err, result) => {
        if (err) {
            return res.status(500).send({ error: 'There appears to be a problem on our side. Please come back later!' });
        }
        if (!result.length) {
            return res.status(204).send({ message: 'There are no tickets created!' });
        }
        return res.status(200).send(result);
    });
});

ticketRouter.post('/ticket', async (req, res) => {
    pool.pool.query(
        `INSERT INTO ticket (RoomID, ticketTitle, ticketDescription, StatusID, UserID) VALUES (
            ${pool.pool.escape(req.body.roomID)},
            ${pool.pool.escape(req.body.ticketTitle)},
            ${pool.pool.escape(req.body.ticketDescription)},
            ${pool.pool.escape(1)},
            ${pool.pool.escape(req.body.UserID)}
            )`,
        (err, result) => {
            if (err) {
                return res.status(400).send({
                    msg: err,
                });
            }
            return res.status(201).send({
                msg: `Das Ticket "${req.body.ticketTitle}" wurde erstellt, und wird in Kürze bearbeitet!`
            });
        }
    );
})


// Show tickets for specific user with room information
ticketRouter.get('/ticket/users/user/:userID', async(req, res) => {
    const userID = req.params.userID
    if(!userID){
        return res.status(400).send('Please submit a valid User ID')
    } 
    pool.pool.query(`SELECT * FROM ticket WHERE UserID = ${pool.pool.escape(userID)};`, (err, result) => {
        if (err) {
            return res.status(500).send({ error: 'There appears to be a problem on our side. Please come back later!' });
        }
        if (!result.length) {
            return res.status(204).send({ message: 'There are no tickets created by this user!' });
        }
        return res.status(200).send(result);
    });
    
})




module.exports = ticketRouter;