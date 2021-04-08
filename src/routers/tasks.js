const express = require('express')
const Tasks = require('../models/task')
const auth = require('../middleware/auth')


const router = new express.Router()

router.post('/tasks', auth, async (req,res)=>{
    //const task = new Tasks(req.body)
    const task = new Tasks({
        ...req.body, 
        owner: req.user._id
    })

    try{
        const existingTask = await Tasks.find({description: req.body.description})
        console.log(existingTask)
        if(existingTask.length>0){
            return status(500).send('Task already exists')
        }
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(500).send(e)
    }

})
//GET /tasks?complete=true or false
//Get /tasks?limit=10&skip=0
//skips number of results not pages
router.get('/tasks', auth, async (req,res)=>{
    //populate is like an inner join, our USER/Task schemas are connected by the virtual prop (FK)
    const match={}
    const sort={
    }

    if(req.query.completed){
        req.query.completed === 'true'? match.completed = true : match.completed = false
        //match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        // GET /tasks?sortBy=createdAt:desc
        //split parts into 2 parts of the query
        const parts = req.query.sortBy.split(':')
        //[] property accessor/creator on an object 
        //sort object has an array of parts now and the second index is the asc or desc dependant on the query
        sort[parts[0]] = parts[1] === 'desc'? -1 : 1
         

    }

    try{
        await req.user.populate({
            path: 'tasks',//match to name of virtual prop
            match:match,
            options:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort:sort
            }
        }).execPopulate()        
        res.send(req.user.tasks)
    }catch(e){
        res.status(500).send(e)
    }
})



router.get('/tasks/:id', auth, async (req,res)=>{
   const _id = req.params.id
   
    //const task = await Tasks.findById(_id)
    const task = await Tasks.findOne({_id, owner: req.user._id})
    try{
        if(!task){
            return res.status(404).send()
        }
        res.status(201).send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id', auth, async(req,res)=>{
    const _id = req.params.id
    //this block checks all the fields that are "updateable" if the request body contains fields that dont match an error is thrown
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description','completed']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error: 'you cannot update with that info'})
    }

  
    
    try{
        // const task = await Tasks.findByIdAndUpdate(req.params.id, req.body,{new:true, isValidOperation: true})
        //_id is shorthand for _id:_id
        const task = await Tasks.findOne({_id, owner: req.user._id})
        
        if(!task){
            return res.status(404).send('Error no task found')
        }
        
        updates.forEach((update)=>{
            //[] this is a dynamic prop 
            task[update] = req.body[update]
        })

        await task.save()


        res.status(201).send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req,res)=>{
    const id = req.params.id
    try {
        const task = await Tasks.findOneAndDelete({_id: id, owner: req.user._id})
        //const task = await Tasks.findByIdAndDelete(id)
        if(!task){
            return res.status(404).send()
        }
        res.status(200).send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router