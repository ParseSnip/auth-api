const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {userOne, userOneId, setupDatabase} = require('./fixtures/db')




const taskOne = {
    description: 'do this and do that',
    completed: false
}



//use to empty documents then add new user document after each test case
beforeEach(setupDatabase)

// afterEach(()=>{

// })


// Should not signup user with invalid name/email/password
// Should not update user if unauthenticated
// Should not update user with invalid name/email/password
// Should not delete user if unauthenticated



test('Should signup a new user', async()=>{
    const response = await request(app).post('/users').send({
        name: 'Sean',
        email:'sean.m.dev@gmail.com',
        password: 'Hashme123'
    }).expect(201)//expect the success response you define in router

    //advanced assertions..

    //assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //assert about the response
    expect(response.body).toMatchObject({
        user:{
            name: 'Sean',
            email:'sean.m.dev@gmail.com' //emails saved as lower case
            },
             token: user.tokens[0].token
    })

    //ensure plain text password isnt stored we dont want a match
    expect(user.password).not.toBe('Hashme123')

})


test('Should login existing user', async()=>{
   const response =  await request(app)
                            .post('/users/login')
                            .send({
                                    email:userOne.email,
                                    password: userOne.password
                                })
                            .expect(201)

    const user = await User.findById(userOneId)


   //validate new token is saved correctly
   expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not log user in -> incorrect password', async()=>{
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'Incorrectpass1234'
    }).expect(400)
})

test('Should get profile for user', async ()=>{
    await request(app)
            .get('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200)
})

test('Should not get profile for unauth user', async()=>{
    await request(app)
            .get('/users/me')
            .send()
            .expect(400)
})

test('Should delete account for user', async()=>{
     await request(app)
            .delete('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200)

    const user = await User.findById(userOneId)

    expect(user).toBeNull()
})

test('Should not delete account for unauth user', async()=>{
    await request(app)
            .delete('/users/me')
            .send()
            .expect(400)
})

test('Should upload avatar image', async()=>{
    await request(app)
                    .post('/users/me/avatar')
                    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                    .attach('avatar','tests/fixtures/wallpaper-2.jpg')
                    .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))//cant use toBe here as it cant compare objects
})

test('Should update valid user fields', async()=>{
    await request(app)
                    .patch('/users/me')
                    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                    .send({name: 'Mike'})
                    .expect(200)

    const user = await User.findById(userOneId)

    expect(user.name).toBe('Mike')

})

test('Should not update invalid user fields', async()=>{
    await request(app)
                    .patch('/users/me')
                    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                    .send({location: 'Mike'})
                    .expect(400)

})