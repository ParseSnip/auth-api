const app = require('./app')

//environment variables
const port = process.env.PORT

app.listen(port, ()=>{
    console.log('app is up on port '+ port)
})

