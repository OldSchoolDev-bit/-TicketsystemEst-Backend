const express = require('express');
const roomRouter = express.Router();
const pool = require('../lib/db.js');
const csv = require('csv-parser');
const fs = require('fs');


// Get all rooms
roomRouter.get('/', async (req, res) => {
    pool.pool.query(`SELECT * FROM room;`, (err, result) => {
        if (err) {
            return res.status(500).send({ error: 'There appears to be a problem on our side. Please come back later!' });
        }
        if (!result.length) {
            return res.status(204).send({ message: 'There are no rooms created!' });
        }
        return res.status(200).send(result);
    });
});


// Create new room
roomRouter.post('/room', async (req, res) => {
    pool.pool.query(
        `INSERT INTO room (RoomID) VALUES (
            ${pool.pool.escape(req.body.roomID)})`,
        (err, result) => {
            if (err) {
                return res.status(400).send({
                    msg: err,
                });
            }
            return res.status(201).send({
                msg: `Der Raum ${req.body.roomID} wurde erstellt, und kann nun für Tickets ausgewählt werden!`
            });
        }
    );
})


// Get specific room details
roomRouter.get('/room/:roomID', async (req, res) => {
    if (!req.params.roomID) {
        return res.status(400).send({ error: 'No roomID was provided' });
    }
    const roomID = pool.pool.escape(req.params.roomID);
    pool.pool.query(`SELECT * FROM room WHERE RoomID = ${roomID};`, (err, result) => {
        if (err) {
            return res.status(500).send({ error: 'There appears to be a problem on our side. Please come back later!' });
        }
        if (!result.length) {
            return res.status(204).send({ message: 'No room found with the provided ID.' });
        }
        return res.status(200).send(result);
    });
});

// Get tickets for specific room
roomRouter.get('/room/:roomID/tickets/', async (req, res) => {
    const roomID = req.params.roomID;
    if (!roomID) {
        return res.status(400).send({ error: 'Please submit a Room ID!' });
    }
    pool.pool.query(`SELECT * FROM ticket WHERE RoomID = '${roomID}' AND StatusID !=3;`, (err, ticketResult) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ error: 'There appears to be a problem on our side. Please come back later!' });
        }
        if (!ticketResult.length) {
            return res.status(204).send({ message: 'There are no tickets for the provided room.' });
        }
        return res.status(200).send(ticketResult);
    });
});

// Get all rooms for one specific user
roomRouter.get('/users/user/:userID/rooms', async (req, res) => {

    const userID = req.params.userID;
    if (!userID) {
        return res.status(400).send('Please submit a userID');
    }
    pool.pool.query(`SELECT user.userFirstname, user.userLastname, room.RoomID 
    FROM useradministatesroom,user, room
    WHERE useradministatesroom.UserID = user.UserID AND useradministatesroom.RoomID = room.RoomID AND user.UserID=${pool.pool.escape(userID)};`, (err, result) => {
        if(err){
            console.log(err);
            return res.status(500).send({ error: 'There was a problem inserting the data into the database' });
        } 
        return res.status(200).send(result);
    });
});

// Get all users and their rooms
roomRouter.get('/users', async (req, res) => {
    pool.pool.query(`SELECT user.userFirstname, user.userLastname, room.RoomID 
    FROM useradministatesroom,user, room
    WHERE useradministatesroom.UserID = user.UserID AND useradministatesroom.RoomID = room.RoomID;`, (err, result) => {
        if(err){
            console.log(err);
            return res.status(500).send({ error: 'There was a problem inserting the data into the database' });
        } 
        return res.status(200).send(result);
    });
});

// Get all users responsible for one specific room
roomRouter.get('/room/:roomID/users', async (req, res) => {
    const roomID = req.params.roomID
    pool.pool.query(`SELECT user.userFirstname, user.userLastname, room.RoomID 
    FROM useradministatesroom,user, room
    WHERE useradministatesroom.UserID = user.UserID AND useradministatesroom.RoomID = room.RoomID AND room.RoomID=${pool.pool.escape(roomID)};`, (err, result) => {
        if(err){
            console.log(err);
            return res.status(500).send({ error: 'There was a problem inserting the data into the database' });
        } 
        return res.status(200).send(result);
    });
});

// Import tooms via csv file
roomRouter.post('/import', async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send({ error: 'No files were uploaded' });
    }

    const csvFile = req.files.file;

    fs.createReadStream(csvFile.tempFilePath)
        .pipe(csv())
        .on('data', (data) => {
            pool.pool.query(`INSERT INTO room (RoomID) VALUES ('${data.RoomID}');`, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({ error: 'There was a problem inserting the data into the database' });
                }
            });
        })
        .on('end', () => {
            return res.status(200).send({ message: 'Data was imported successfully' });
        });
});

module.exports = roomRouter;