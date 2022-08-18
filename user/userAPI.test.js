//En todos los archivos de test hacer los request de login y register agrupados.

const supertest = require('supertest');
const app = require('../server');
const request = supertest(app);
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const userServices = require('./userServices/userServices');
const User = require( "./userModel" );
const dotenv = require('dotenv');
dotenv.config();


const testData = {
    username: 'malvarez',
    firstName: 'María Eugenia',
    lastName: 'Álvarez',
    email: 'mariaeugeniaalvarezb@gmail.com',
    password: bcrypt.hashSync('Dry0607.*', config.saltRounds)
}

let testUser;

    beforeAll(() => {
        mongoose.connect(process.env.MONGO_TEST_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });        
    });

    beforeEach(async () => {
        const user = new User(testData);
        testUser = await user.save();
        return testUser;
    });

    afterEach(() => {
        return userServices.removeUsers();
    });

    afterAll((done) => {
        mongoose.disconnect(done);
    });

describe('User API tests.', () => {
    it('1. Should **login** and return userId, assigning token to a secure cookie.', async (done) => {
        const input = {
            email: 'mariaeugeniaalvarezb@gmail.com',
            password: 'Dry0607.*'
        };
        const res = await request
            .post('/login')
            .send(input);

        expect(res.statusCode).toEqual(200);
        expect(res.headers['set-cookie'][0]).toBeTruthy();
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('userId');
        done();
    });

    
    it('2. Should **register** and return userId, assigning token to a secure cookie.', async (done) => {
        const input = {
            username: 'rcapuz',
            firstName: 'Ricardo Jesús',
            lastName: 'Capuz Lárez',
            email: 'capuzr@gmail.com',
            password: 'Dry0607.*'
        };

        const user = supertest.agent(app);
        
        const res = await user
            .post('/register')
            .send(input);

        expect(res.statusCode).toEqual(200);
        expect(res.headers['set-cookie'][0]).toBeTruthy();
        expect(res.body).toHaveProperty('userId');
        done();
    });

    it('3. Should **get** and return user data.', async (done) => {
        const input = {
            email: 'mariaeugeniaalvarezb@gmail.com',
            password: 'Dry0607.*'
        };

        const user = supertest.agent(app);

        await user
            .post('/login')
            .send(input);
        const res = await user
            .get('/user/read');
            
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('username');
        expect(res.body).toHaveProperty('firstName');
        expect(res.body).toHaveProperty('lastName');
        expect(res.body).toHaveProperty('email');
        done();
    });
    
    it('4. Should update user data.', async (done) => {
        const input = {
            email: 'mariaeugeniaalvarezb@gmail.com',
            password: 'Dry0607.*'
        };

        const inputToUpdate = {
            _id: testUser._id,
            username: 'mealvarez',
            firstName: 'Maroou',
            lastName: 'Álvarez',
            email: 'mariaeugeniaalvarezb@gmail.com'
        };

        const user = supertest.agent(app);

        await user
            .post('/login')
            .send(input);
        const res = await user
            .post('/update-user-data')
            .send(inputToUpdate);
            
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('username');
        expect(res.body).toHaveProperty('firstName');
        expect(res.body).toHaveProperty('lastName');
        expect(res.body).toHaveProperty('email');
        done();
    });

  })

