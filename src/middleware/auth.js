const jwt= require('jsonwebtoken')
const User=require('../models/user')


//whenever we use auth if it is successful we return a single user by id as req.user
const auth = async(req,res,next)=>{
    try {
        //get token from request in header
        const token = req.header('Authorization').replace('Bearer ','')
        //make sure token is valid
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        //user logout from device/token expire removes it from the tokens array in the document
        const user = await User.findOne({_id: decoded._id, 'tokens.token':token})

        if(!user){
            throw new Error()
        }
        //pass token to remove it when logging out
        req.token = token

        req.user = user
        next()
    } catch (e) {
        res.status(400).send({error: 'Please authenticate'})
    }
}

module.exports = auth