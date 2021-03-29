const request = require('supertest')
const app = require('../src/app')
const Tasks = require('../src/models/task')
const {userOne, userTwo, userOneId,taskOne, setupDatabase} = require('./fixtures/db')

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