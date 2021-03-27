const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({    
    description: {
    type: String,
    required: true,
    trim:true,    
},
completed: {
    type: Boolean,
    default: false
    },
owner:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
}},{
    timestamps:true
})
const Tasks = mongoose.model('Tasks', taskSchema)
//type is just saying its expecting an objectId which is a string created by mongoose (each userId)
//the enitre owner field is like a foreign key.. need ref keyword 
module.exports = Tasks
