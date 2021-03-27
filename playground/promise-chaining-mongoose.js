require('../src/db/mongoose')
const User = require('../src/models/user')
const Tasks = require('../src/models/task')


//sample id of a user : 60576bbd1daa755f8859995e

// User.findByIdAndUpdate('60576bbd1daa755f8859995e',{age: 1 }).then((user)=>{
//     console.log(user)
//     //this return is the key part of chaining
//     return User.countDocuments({age:1})
// }).then((result)=>{
//     console.log(result)
// }).catch((e)=>{
//     console.log(e)
// })

// const updateAgeAndCount = async (id,age) =>{
//     const user = await User.findByIdAndUpdate(id,{age})
//     const count = await User.countDocuments({age})
//     return count
// }

// updateAgeAndCount('60576bbd1daa755f8859995e',2).then((count)=>{
//     console.log(count)
// }).catch((e)=>{console.log(e)})


// Tasks.findByIdAndRemove('60576f34a7feba4b8453fb18').then((task)=>{
//     console.log(task)

//     return Tasks.countDocuments({completed:false})
// }).then((incompleteTasks)=>{
//     console.log(incompleteTasks)
// }).catch((e)=>{
//     console.log(e)
// })


const deleteTaskAndCount = async(id) =>{
    const task = await Tasks.findByIdAndDelete(id)
    console.log(task)
    const count = await Tasks.countDocuments({completed:false})
    return count
}

deleteTaskAndCount('60575ee7ec335c3c8c3e7441').then((count)=>{
    console.log(count)
}).catch((e)=>{
    console.log(e)
})

