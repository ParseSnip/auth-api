const request = require('supertest')
const app = require('../src/app')

test('Should signup a new user', async()=>{
    await await request(app).post('/users').send({
        name: 'Sean',
        email:'Sean.m.d@gmail.com',
        password: 'Hashme123'
    }).expect(201)//expect the success response you define in router
})