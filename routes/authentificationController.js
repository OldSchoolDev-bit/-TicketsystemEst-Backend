const express = require('express');
const authRouter = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userMiddleware = require('../middleware/users.js');
const pool = require('../lib/db.js');
const uuid = require('uuid')


// Append verifyJWT middleware if neccessary
authRouter.post('/login', (req, res, next) => {
    // Check if user exists on Database
    pool.pool.query(
        `SELECT * FROM UserSecurity WHERE username = ${pool.pool.escape(req.body.username)};`,
        (err, result) => {
            // user does not exists
            if (err) {
                return res.status(400).send({
                    msg: err
                })
            }
            if (!result.length) {
                return res.status(401).send({
                    msg: 'Username or password is incorrect!'
                });
            }
            // check if hashed password matches Database hash
            bcrypt.compare(
                req.body.password, result[0]['userPassword'],
                (bErr, bResult) => {
                    // wrong password
                    if (bErr) {
                        return res.status(401).send({
                            msg: 'Username or password is incorrect!',
                        })
                    }
                    if (bResult) {
                        // create accessToken
                        const accessToken = jwt.sign({
                            username: result[0].userName,
                            userId: result[0].SecurityID
                        },
                            process.env.API_SECRET_ACCESS_TOKEN, {
                            expiresIn: '5m'
                        }
                        );
                        // create refreshToken
                        const refreshToken = jwt.sign({
                            username: result[0].userName,
                            UserID: result[0].SecurityID
                        },
                            process.env.API_SECRET_REFRESH_TOKEN, {
                            expiresIn: '3d'
                        }
                        );
                        var rToken = JSON.stringify(refreshToken, null, '\"');
                        rToken = rToken.replaceAll('\"', '');
                        //    console.log(rToken);

                        // Update refreshToken in Database
                        pool.pool.query(`UPDATE UserSecurity set refreshToken = ${pool.pool.escape(rToken)} WHERE username=${pool.pool.escape(req.body.username)};`)

                        // return httpOnly refreshToken & Memory accessToken to Frontend.
                        res.cookie('jwt', refreshToken, { domain: "*" ,httpOnly: true, sameSite: 'None', secure: true ,maxAge: 72 * 60 * 60 * 1000, path: '/' }); 
                        return res.status(200).send({
                            msg: 'Logged in!',
                            accessToken,
                            user: result[0].username && result[0].id && result[0].UserID
                        });
                    }
                    return res.status(401).send({
                        msg: 'Username or password is incorrect!'
                    });
                }
            );
        }
    );
    pool.end;
});
// Register
authRouter.post('/sign-up', userMiddleware.validateRegister, async(req, res, next) => {
    console.log(req.body)
    let userID = uuid.v4()
    pool.pool.query(
        `SELECT * FROM UserSecurity WHERE LOWER(username) = LOWER(${pool.pool.escape(
            req.body.username
        )});`,
        (err, result) => {
            if (result.length) {
                return res.status(409).send({
                    msg: 'This username is already in use!'
                });
            } else {
                // username is available
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).send({
                            msg: err,
                        });
                    } else {
                        // has hashed pw => add to database

                        // Create User Profile Object
                        pool.pool.query(
                            `INSERT INTO user (UserID, userFirstname, userLastname, userEmail, RoleID, userStreetNumber, userStreetName, userTown, userPLZ, userCountry) VALUES (
                              ${pool.pool.escape(userID)},
                              ${pool.pool.escape(req.body.userFirstname)},
                              ${pool.pool.escape(req.body.userLastname)},
                              ${pool.pool.escape(req.body.userEmail)},
                              ${pool.pool.escape(req.body.RoleID)},
                              ${pool.pool.escape(req.body.userStreetNumber)},
                              ${pool.pool.escape(req.body.userStreetName)},
                              ${pool.pool.escape(req.body.userTown)},
                              ${pool.pool.escape(req.body.userPLZ)},
                              ${pool.pool.escape(req.body.userCountry)})`,
                            (err, result) => {
                              if (err) {
                                return res.status(400).send({
                                  msg: err,
                                });
                              }
                              // Create UserSecurity Object
                              pool.pool.query(
                                `INSERT INTO UserSecurity (SecurityID, username, userPassword) VALUES (
                                  ${pool.pool.escape(userID)},
                                  ${pool.pool.escape(req.body.username)},
                                  ${pool.pool.escape(hash)})`,
                                (err, result) => {
                                  if (err) {
                                    return res.status(400).send({
                                      msg: err,
                                    });
                                  }
                                  return res.status(201).send({
                                    msg: 'Registered!'
                                  });
                                }
                              );
                            }
                          );
                    }
                });
            }
        }
    );
});

authRouter.get('/refresh', (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.status(401).send("No Cookie! :(");
    //    console.log(cookies.jwt);
    const refreshToken = cookies.jwt;
    // if Username & Token exist in Database: jwt.verify, else: 403
    pool.pool.query(`SELECT username FROM UserSecurity WHERE refreshToken = ${pool.pool.escape(refreshToken)};`,
        (err, result) => {
            if (err) { console.log(err); return res.sendStatus(403); }
            if (result) {
                jwt.verify(
                    refreshToken,
                    process.env.API_SECRET_REFRESH_TOKEN,
                    (err, decoded) => {
                        if (err) return res.sendStatus(403);
                        const accessToken = jwt.sign(
                            { "username": decoded.username },
                            process.env.API_SECRET_ACCESS_TOKEN,
                            { expiresIn: '5m' }
                        );
                        res.json({ accessToken })
                    }
                )
            }
        }
    )
});

authRouter.get('/logout', (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);  // No content
    const refreshToken = cookies.jwt;

    // Check for refreshToken in Database
    pool.pool.query(`SELECT username FROM UserSecurity WHERE refreshToken = ${pool.escape(refreshToken)};`,
        (err, result) => {
            // No refreshToken in Database, just delete cookie
            if (err) {
                res.clearCookie('jwt', { domain: "*" ,httpOnly: true, sameSite: 'none', secure: true ,maxAge: 72 * 60 * 60 * 1000 })
                return res.sendStatus(204)
            }
            // Delete refreshToken in Database
            if (result) {
                pool.pool.query(`UPDATE UserSecurity set refreshToken=NULL where refreshToken = ${pool.escape(refreshToken)};`)
                res.clearCookie('jwt',  { domain: "*" ,httpOnly: true, sameSite: 'None', secure: true , maxAge: 72 * 60 * 60 * 1000 })
                return res.sendStatus(204);
            }
        })
});
module.exports = authRouter;