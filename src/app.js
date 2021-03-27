const express = require('express')
require('./db/mongoose')//just connects mongoose
const userRouter = require('./routers/user')
const taskRouter = require('./routers/tasks')



const app = express()



//parses results from requests to js object
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)



module.exports = app
