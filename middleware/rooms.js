require('dotenv').config();

const validate = (req, res, next) => {
    const roomID  = req.params.roomID
        if(!roomID){
            return res.status(400).send('Please submit a Room ID!')
        } else{
            next();
        }
            

}

module.exports = { validate } 