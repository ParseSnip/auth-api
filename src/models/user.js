const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Tasks = require('./task')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    age:{
        type: Number,
        default: 0,
        validate(value){
            if(value<0){
                throw new Error('Cannot be less tha 0 age')
            }
        }
    },
    email:{
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        //email validation using validator package
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    password:{
        type: String,
        required: true,
        trim: true,
        validate(value){
            if(!validator.isStrongPassword(value,
                {
                    minLength: 4,
                    minUppercase: 1,
                    minSymbols: 0
                }
            )
            ||value.toLowerCase().includes('password')){
                throw new Error('Password is weak sauce')
            }
        }
    },
    avatar:{
        type: Buffer//store image as binary data
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }]

},{
    timestamps:true
})

//virtual props 2 way relations between the two models
userSchema.virtual('tasks', {
    ref: 'Tasks',//model to connect
    localField: '_id',//inner join where _id is equal to Tasks schemas owner field 
    foreignField: 'owner'
    //_id isnt explicity defined by our schema..it is basically a Primary key auto gen..
})



//use statics to add custom methods/functionality to schema such as find and findbyid 
userSchema.statics.findByCredentials = async (email, password)=>{
    const user = await User.findOne({email:email})

   
        if(!user){
            return console.log('Unable to login')
        }
        
        const isMatch = await bcrypt.compare(password, user.password)
        
        if(!isMatch){
            return console.log('Unable to login')
        }
        return user
}

userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET,{expiresIn: '30 minutes'})
   
    user.tokens.push({token: token})
    await user.save()
    return token
}

//return the document without password and tokens and avatar binary data.. keep safe
userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}


//middleware.. like a life cycle hook pre=run before save then the function you want
userSchema.pre('save', async function(next){
    const user = this
     
    //only hash password if it is already not hashed ie. if it is an update to user pass would be hashed(unless changing pass)
    if(user.isModified('password')){

        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

//Delete all associated tasks to user when user is removed
userSchema.pre('remove', async function(next){
    const user = this
    await Tasks.deleteMany({owner: user._id})


    next()
})

const User = mongoose.model('User', userSchema)


// const me = new User({
//     name: 'Sean',
//     age: 30,
//     email: 'sean@hotmail.com',
//     password: 'Aple3'
// })

// me.save().then(()=>{
//     //print new document
//     console.log(me)
// }).catch((error)=>{
//     console.log('Error',error)
// })

module.exports = User