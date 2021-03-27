const express = require('express')
const multer = require('multer')
const User = require('../models/user')
const auth = require('../middleware/auth')
const sharp = require('sharp')
const {sendWelcomEmail, sendCancelEmail}= require('../emails/account')

const router = new express.Router()



router.post('/users', async (req,res)=>{
    const user = new User(req.body)
    try{
        await user.save()
        //sendWelcomEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    }catch(e){
        res.status(400).send(e)
    }

})

router.post('/users/login', async (req,res)=>{
    try{
        //custom methods defined in schema
        const user = await User.findByCredentials(req.body.email, req.body.password)
        //here we see diffence between mongoose statics vs methods
        //static is a method on the schema where 'methods' is a function of an instance of said scheme.. User vs user usage
        const token = await user.generateAuthToken()
    
        res.status(201).send({user:user, token: token})
    }catch(e){
        res.status(400).send(e)
        console.log(e)
    }
})

router.post('/users/logout',auth, async (req,res)=>{
    try {
        //filter the user's tokens array returning an array without the token passed back from middleware auth
        //ie. logging off from this device
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        //save the change made to the document
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll',auth , async (req,res)=>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()

    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me',auth, async (req,res)=>{
    res.send(req.user)
})

router.patch('/users/me',auth, async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','email', 'password','age']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
    
    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid update!'})
    }


    try{
        updates.forEach((update)=>{
            //[] this is a dynamic prop 
            req.user[update] = req.body[update]
        })
        await req.user.save()    
        res.send(req.user)

    }catch(e){
        res.status(404).send(e)
    }
})


router.delete('/users/me',auth, async (req,res)=>{
    try{
        // const user = await User.findByIdAndDelete(req.user._id)

        // if(!user){
        //     res.status(404).send()
        // }

        await req.user.remove()
        //sendCancelEmail(req.user.email, req.user.name)

        res.send(req.user)
        
    }catch(e){
        res.status(500).send()
    }
})

//multer is a module middleware that makes file upload easy
const upload = multer({
    //dest: 'images',//destination is our images folder
    limits:{
        fileSize: 2000000//bytes
    },
    fileFilter(req,file,callback){
        //callback(new Error('File must be type x'))
        if(!file.originalname.match(/\.jpg|jpeg|png$/)){
            return callback(new Error('Please upload an image'))
        }
        callback(undefined, true)
    }
})


//multer middleware could also use upload.array
//'avatar' is the key value in the req.body switch type to file in postman
router.post('/users/me/avatar', auth,  upload.single('avatar'), async (req,res)=>{
   
    //convert any image upload to png
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()

    req.user.avatar = buffer
    await req.user.save()
    
    res.status(200).send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.delete('/users/me/avatar', auth, async(req,res)=>{
    req.user.avatar=undefined
    await req.user.save()

    res.status(200).send()
})

//get avatar based on user id
router.get('/users/:id/avatar', async(req,res)=>{
    try{
        const user = await User.findById(req.params.id)

        if(!user|| !user.avatar){
            throw new Error()
        }
        //by default the express content type is JSON..so change it
        res.set('Content-Type','image/jpg')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})
module.exports = router