const mongoose = require('mongoose')


 
//27017 is standard port mongo uses
mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser:true,
    useUnifiedTopology: true,
    useCreateIndex:true
})








