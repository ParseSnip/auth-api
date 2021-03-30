const { response } = require('express')
const request = require('supertest')
const app = require('../src/app')
const Tasks = require('../src/models/task')
const {userOne, userTwo,userOneId,taskOne,taskTwo, setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should create task for user', async()=>{
    const response = await request(app)
                .post('/tasks')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send({
                    description: 'do some stuff'
                })
                .expect(201)

    expect(response.body.description).toBe('do some stuff')
})

test('Unauth should not create task', async()=>{
    const response = await request(app)
                        .post('/tasks')
                        .send({
                            description: 'whatever'
                        })
                        .expect(400)
    expect(response.body.description).not.toBe('whatever')
})

test('Should read owning tasks', async()=>{
    const response = await request(app)
                                .get('/tasks')
                                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                                .send()
                                .expect(200)
    
    expect(response.body.length).toBe(2)

})

test('Should not read unauth tasks', async()=>{
    const response = await request(app)
    .get('/tasks')
    .send()
    .expect(400)

expect(response.body.length).toBeNull
})

test('Should fetch only completed tasks', async()=>{
    const response = await request(app)
        .get('/tasks?completed=true')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    expect(response.body.length).toBe(1)
    
})

test('Should sort tasks by creation', async()=>{
    const response = await request(app)
        .get('/tasks?sortBy=createdAt:desc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

        //userOne has two tasks task two should be top
    expect(response.body[0].description).toBe(taskTwo.description)
})

test('Should be able to delete own task', async()=>{
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Unauth user should not delete task', async()=>{
    await request(app)
                .delete(`/tasks/${taskOne._id}`)
                .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
                .send()
                .expect(404)

    //double check that tasks exists on database 
    const task = await Tasks.findById(taskOne._id)
    expect(task).not.toBeNull()
})

test('Should not create task with invalid completion', async()=>{
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 12345,
            completed: 'ahhhhh'
        })
        .expect(500)

})

test('Should not create duplicate tasks', async()=>{
    await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'first task'
        })
        .expect(500)
})

test('Should not update other users tasks', async()=>{
    await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            description: 12345,
            completed: true
        })
        .expect(500)
})

test('Should update users tasks', async()=>{
    await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            completed: true
        })
        .expect(201)

        const task = await Tasks.findById(taskOne._id)

        expect(task.completed).toBe(true)
})



//Tests

//
// Task Test Ideas
//
// Should not create task with invalid description/completed
// Should not update task with invalid description/completed
// Should delete user task
// Should not delete task if unauthenticated
// Should not update other users task
// Should fetch user task by id
// Should not fetch user task by id if unauthenticated
// Should not fetch other users task by id
// Should fetch only completed tasks
// Should fetch only incomplete tasks
// Should sort tasks by description/completed/createdAt/updatedAt
// Should fetch page of tasks