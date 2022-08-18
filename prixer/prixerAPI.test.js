//En todos los archivos de test hacer los request de login y register agrupados.

const supertest = require('supertest');
const app = require('../server');
const request = supertest(app);
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const prixerServices = require('./prixerServices');
const userServices = require('../user/userServices/userServices');
const Prixer = require( "./prixerModel" );
const User = require( "../user/userModel" );
const dotenv = require('dotenv');
dotenv.config();


const userTestData = {
    username: 'malvarez',
    firstName: 'María Eugenia',
    lastName: 'Álvarez',
    email: 'mariaeugeniaalvarezb@gmail.com',
    password: bcrypt.hashSync('Dry0607.*', config.saltRounds)
}

const userTestDataCreate = {
    username: 'rcapuz',
    firstName: 'Ricardo',
    lastName: 'Capuz',
    email: 'capuzr@gmail.com',
    password: bcrypt.hashSync('Dry0607.*', config.saltRounds)
}

const prixerTestData = {
    specialty: 'Ambas',
    instagram: '@malvarez',
    dateOfBirth: '21/03/1981',
    phone: '04242490166',
    country: 'Venezuela',
    city: 'Caracas'
}

describe('Prixer API tests', () => {

    beforeAll(() => {
        mongoose.connect(process.env.MONGO_TEST_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
    });

    afterEach(() => {
        return userServices.removeUsers(),
        prixerServices.removePrixers();
    });

    afterAll((done) => {
        mongoose.disconnect(done);
    });

    it('1. Should return the new prixer.', async (done) => {
        const prixerInput = {
            specialty: 'Ambas',
            instagram: '@capuzr',
            dateOfBirth: '12/05/1991',
            phone: '04143201028',
            country: 'Venezuela',
            city: 'Caracas'
        }

        const user = supertest.agent(app);
        
        const userCreate = await user
            .post('/register')
            .send(userTestDataCreate);

        prixerInput.id = userCreate.body.userId;

        const res = await user
            .post('/prixer-registration')
            .send(prixerInput);
            
            
        expect(res.body).toHaveProperty('success');
        expect(res.body.prixerData).toHaveProperty('specialty');
        expect(res.body.prixerData).toHaveProperty('instagram');
        expect(res.body.prixerData).toHaveProperty('dateOfBirth');
        expect(res.body.prixerData).toHaveProperty('country');
        expect(res.body.prixerData).toHaveProperty('city');
        done();
    });

    it('2. Should return Prixer data', async (done) => {


        const prixerInput = {
            specialty: 'Ambas',
            instagram: '@capuzr',
            dateOfBirth: '12/05/1991',
            phone: '04143201028',
            country: 'Venezuela',
            city: 'Caracas'
        }

        const user = supertest.agent(app);
        
        const userCreate = await user
            .post('/register')
            .send(userTestDataCreate);

        prixerInput.id = userCreate.body.userId;

        await user
            .post('/prixer-registration')
            .send(prixerInput);

        const res = await user
            .get('/prixer/read')
            .send(prixerInput);
            
        expect(res.body).toHaveProperty('username');
        expect(res.body).toHaveProperty('firstName');
        expect(res.body).toHaveProperty('lastName');
        expect(res.body).toHaveProperty('email');
        expect(res.body).toHaveProperty('specialty');
        expect(res.body).toHaveProperty('instagram');
        expect(res.body).toHaveProperty('dateOfBirth');
        expect(res.body).toHaveProperty('country');
        expect(res.body).toHaveProperty('city');
        done();
    });

    it('3. Should return updated Prixer data', async (done) => {
        const prixerInput = {
            specialty: 'Ambas',
            instagram: '@capuzr',
            dateOfBirth: '12/05/1991',
            phone: '04143201028',
            country: 'Venezuela',
            city: 'Caracas'
        }

        const updatedPrixInput = {
            specialty: 'Ambas',
            instagram: '@capuzricardo',
            dateOfBirth: '12/05/1991',
            phone: '04141060914',
            country: 'Vzla',
            city: 'Ccs'
        }

        const user = supertest.agent(app);
        
        const userCreate = await user
            .post('/register')
            .send(userTestDataCreate);

        prixerInput.id = userCreate.body.userId;

        const prixerCreate = await user
            .post('/prixer-registration')
            .send(prixerInput);

        updatedPrixInput.id = userCreate.body.userId;

        const res = await user
            .post('/prixer/update')
            .send(updatedPrixInput);
            
        expect(res.body).toHaveProperty('username');
        expect(res.body).toHaveProperty('firstName');
        expect(res.body).toHaveProperty('lastName');
        expect(res.body).toHaveProperty('email');
        expect(res.body).toHaveProperty('specialty');
        expect(res.body).toHaveProperty('instagram');
        expect(res.body).toHaveProperty('dateOfBirth');
        expect(res.body).toHaveProperty('country');
        expect(res.body).toHaveProperty('city');
        done();
    });

});
