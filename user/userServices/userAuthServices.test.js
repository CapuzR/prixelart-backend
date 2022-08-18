//En todos los archivos de test hacer los request de login y register agrupados.

const bcrypt = require('bcrypt');
const userAuthServices = require('./userAuthServices.js');
const mongoose = require('mongoose');
const User = require( "../userModel" );
const userServices = require('./userServices');
const dotenv = require('dotenv');
dotenv.config();

const userTestData = {
    username: 'malvarez',
    firstName: 'María Eugenia',
    lastName: 'Álvarez',
    email: 'mariaeugeniaalvarezb@gmail.com',
    password: bcrypt.hashSync('Dry0607.*', config.saltRounds)
}

const userTestDataGT = {
    username: 'malvarez',
    firstName: 'María Eugenia',
    lastName: 'Álvarez',
    email: 'mariaeugeniaalvarezb@gmail.com',
    password: bcrypt.hashSync('Dry0607.*', config.saltRounds)
}

describe('User Authentication Services tests', () => {

    let testUser;

    beforeAll(() => {
        mongoose.connect(process.env.MONGO_TEST_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
    });

    beforeEach(async () => {
        const user = new User(userTestData);
        testUser = await user.save();
        
        return testUser;
    });

    afterEach(() => {
        return userServices.removeUsers();
    });

    afterAll((done) => {
        mongoose.disconnect(done);
    });

    it('1. User doesn\'t exist.', async (done)=>{
        const input = {
            email: 'failedemail@gmail.com',
            password: bcrypt.hashSync('Dry0607.*', config.saltRounds)
        };

        const exOutput = {
            error_info: 'error_email',
            error_message: 'No se encuentra el email, por favor regístrate para formar parte de la #ExperienciaPrixelart'
        }
        const output = await userAuthServices.authenticate(input);

        expect(output.error_info).toEqual(exOutput.error_info);
        expect(output.error_message).toEqual(exOutput.error_message);
        done();
    });

    it('2. Wrong Password.', async (done)=>{
        const input = {
            email: 'mariaeugeniaalvarezb@gmail.com',
            password: bcrypt.hashSync('Dry0607Fallo.*', config.saltRounds)
        };

        const exOutput = {
            error_info: 'error_pw',
            error_message: 'Inténtalo de nuevo, contraseña incorrecta.'
        }
        const output = await userAuthServices.authenticate(input);

        expect(output.error_info).toEqual(exOutput.error_info);
        expect(output.error_message).toEqual(exOutput.error_message);
        done();
    });

    it('3. Should return userId and Token.', async (done)=>{
        const input = {
            email: 'mariaeugeniaalvarezb@gmail.com',
            password: 'Dry0607.*'
        };

        const exOutput = {
            error_info: null,
            error_message: null,
            userId: testUser._id
        }
        const output = await userAuthServices.authenticate(input);
        //Todo: Se debe validar bien el userId.
        expect(output.userId == exOutput.userId).toBeTruthy();
        //Todo:  Se debe validar bien el token.
        expect(output.token).toBeTruthy();
        done();
    });

    it('4. Should return token.', async (done)=>{
        const input = userTestDataGT;
        input.id = testUser._id;

        const output = await userAuthServices.generateToken(input);
        //Todo:  Se debe validar bien el token.
        expect(output).toBeTruthy();
        done();
    });
});