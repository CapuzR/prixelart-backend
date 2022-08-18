//En todos los archivos de test hacer los request de login y register agrupados.

const bcrypt = require('bcrypt');
const prixerServices = require('./prixerServices');
const userServices = require('../user/userServices/userServices');const mongoose = require('mongoose');
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

describe('Prixer Services tests', () => {

    let testUser;
    let testUserCreate;
    let testPrixer;

    beforeAll(() => {
        mongoose.connect(process.env.MONGO_TEST_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
    });

    beforeEach(async () => {
        const user = new User(userTestData);
        testUser = await user.save();

        const userCreate = new User(userTestDataCreate);
        testUserCreate = await userCreate.save();

        prixerTestData.userId = user._id;

        const prixer = new Prixer(prixerTestData);
        testPrixer = await prixer.save();
        
        return user, userCreate, prixer;
    });

    afterEach(() => {
        return userServices.removeUsers(),
        prixerServices.removePrixers();
    });

    afterAll((done) => {
        mongoose.disconnect(done);
    });

    it('1. Should return the new prixer if it doesn\'t exists already', async (done) => {
        const prixerInput = {
            specialty: 'Ambas',
            instagram: '@capuzr',
            dateOfBirth: '12/05/1991',
            phone: '04143201028',
            country: 'Venezuela',
            city: 'Caracas',
            userId: testUserCreate._id
        }

        const expectedOutput = {
            specialty: 'Ambas',
            instagram: '@capuzr',
            dateOfBirth: '12/05/1991',
            phone: '04143201028',
            country: 'Venezuela',
            city: 'Caracas',
        }
    
        const result = await (await prixerServices.createPrixer(prixerInput)).prixerData;

        expect(result.specialty).toEqual(expectedOutput.specialty);
        expect(result.instagram).toEqual(expectedOutput.instagram);
        expect(result.dateOfBirth).toEqual(expectedOutput.dateOfBirth);
        expect(result.country).toEqual(expectedOutput.country);
        expect(result.city).toEqual(expectedOutput.city);
        done();
    });

    it('2. Should return error pointing that the user is already assigned to a Prixer.', async (done) => {
        const prixerInput = {
            ...prixerTestData,
            id: testUser._id
        };

        const expectedOutput = 'Disculpa, este usuario ya está asignado a un Prixer';
        const result = await (await prixerServices.createPrixer(prixerInput)).message;

        expect(result).toEqual(expectedOutput);
        done();
    });

    it('3. Should return Prixer if exists.', async (done) => {

        const input = {
        ...prixerTestData,
        username: testUser.username,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        email: testUser.email,
        id: testUser._id
        };

        const expectedOutput = input;
        const result = await prixerServices.readPrixer(input);

        expect(result.username).toEqual(expectedOutput.username);
        expect(result.firstName).toEqual(expectedOutput.firstName);
        expect(result.lastName).toEqual(expectedOutput.lastName);
        expect(result.email).toEqual(expectedOutput.email);
        expect(result.lastName).toEqual(expectedOutput.lastName);
        expect(result.specialty).toEqual(expectedOutput.specialty);
        expect(result.instagram).toEqual(expectedOutput.instagram);
        expect(result.dateOfBirth).toEqual(expectedOutput.dateOfBirth);
        expect(result.country).toEqual(expectedOutput.country);
        expect(result.city).toEqual(expectedOutput.city);
        done();
    });
  })