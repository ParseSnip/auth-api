const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const Tasks = require('../../src/models/task')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'Seany',
    email: 'sean12@gmail.com',
    password: 'Hashme123',
    tokens:[{
        token: jwt.sign({_id:userOneId}, process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: 'Sean2',
    email: 'sean123@gmail.com',
    password: 'Hashme123',
    tokens:[{
        token: jwt.sign({_id:userTwoId}, process.env.JWT_SECRET)
    }]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'first task',
    completed: false,
    owner: userOne._id
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'second task',
    completed: true,
    owner: userOne._id
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'third task',
    completed: false,
    owner: userTwo._id
}

const setupDatabase = async()=>{
    await User.deleteMany()
    await Tasks.deleteMany()
    //create a new user to test logins
    const user = new User(userOne)
    await user.save()

    await new User(userTwo).save()
    await new Tasks(taskOne).save()
    await new Tasks(taskTwo).save()
    await new Tasks(taskThree).save()


}

module.exports ={
    userOne,
    userTwo,
    userOneId,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
}