//En todos los archivos de test hacer los request de login y register agrupados.

const bcrypt = require('bcrypt');
const userServices = require('./userServices');
const mongoose = require('mongoose');
const User = require( "../userModel" );
const dotenv = require('dotenv');
dotenv.config();

const testData = {
    username: 'malvarez ',
    firstName: 'María Eugenia',
    lastName: 'Álvarez',
    email: 'mariaeugeniaalvarezb@gmail.com',
    password: bcrypt.hashSync('Dry0607.*', config.saltRounds)
}

describe('User Services tests', () => {

    let testUser;

    beforeAll(() => {
        mongoose.connect(process.env.MONGO_TEST_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });        
    });

    beforeEach(async () => {
        userServices.removeUsers();
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

    it('1. Should return the new user if it doesn\'t exists already', async (done) => {
      const input = {
        username: 'rcapuz',
        firstName: 'Ricardo',
        lastName: 'Capuz',
        email: 'rcapuz@prixelart.com',
        password: bcrypt.hashSync('Dry0607.*', config.saltRounds)
      }
      const expectedOutput = {
        username: 'rcapuz',
        firstName: 'Ricardo',
        lastName: 'Capuz',
        email: 'rcapuz@prixelart.com',
        password: 'Dry0607.*',
        __v: 0
      }
      const result = await (await userServices.createUser(input)).newUser;

      expect(result.username).toEqual(expectedOutput.username);
      expect(result.firstName).toEqual(expectedOutput.firstName);
      expect(result.lastName).toEqual(expectedOutput.lastName);
      expect(result.email).toEqual(expectedOutput.email);
      expect(result.lastName).toEqual(expectedOutput.lastName);
      done();
    });

    it('2. Should return user found by id.', async (done) => {
        const input = testUser;
        const result = await userServices.readUserById(input);

        const expectedOutput = {
          username: 'malvarez ',
          firstName: 'María Eugenia',
          lastName: 'Álvarez',
          email: 'mariaeugeniaalvarezb@gmail.com',
          password: bcrypt.hashSync('Dry0607.*', config.saltRounds)
        }

        expect(result.username).toEqual(expectedOutput.username);
        expect(result.firstName).toEqual(expectedOutput.firstName);
        expect(result.lastName).toEqual(expectedOutput.lastName);
        expect(result.email).toEqual(expectedOutput.email);
        expect(result.lastName).toEqual(expectedOutput.lastName);
        done();  
      })

      it('3. Should return user found by email.', async (done) => {
        const input = testUser;
        const result = await userServices.readUserByEmail(input);

        const expectedOutput = {
          username: 'malvarez ',
          firstName: 'María Eugenia',
          lastName: 'Álvarez',
          email: 'mariaeugeniaalvarezb@gmail.com',
          password: bcrypt.hashSync('Dry0607.*', config.saltRounds)
        }

        expect(result.username).toEqual(expectedOutput.username);
        expect(result.firstName).toEqual(expectedOutput.firstName);
        expect(result.lastName).toEqual(expectedOutput.lastName);
        expect(result.email).toEqual(expectedOutput.email);
        expect(result.lastName).toEqual(expectedOutput.lastName);
        done();  
      })

      it('4. Should return user found by username.', async (done) => {
        const input = testUser;
        const result = await userServices.readUserByUsername(input);

        const expectedOutput = {
          username: 'malvarez ',
          firstName: 'María Eugenia',
          lastName: 'Álvarez',
          email: 'mariaeugeniaalvarezb@gmail.com',
          password: bcrypt.hashSync('Dry0607.*', config.saltRounds)
        }

        expect(result.username).toEqual(expectedOutput.username);
        expect(result.firstName).toEqual(expectedOutput.firstName);
        expect(result.lastName).toEqual(expectedOutput.lastName);
        expect(result.email).toEqual(expectedOutput.email);
        expect(result.lastName).toEqual(expectedOutput.lastName);
        done();  
      })

      it('5. Update user when all updatable fields were provided.', async (done) => {
        const input = {
          id: testUser.id,
          email: testUser.email,
          username: 'mealvarez',
          firstName: 'María Eu',
          lastName: 'Álvarez Bermúdez',
          password: testUser.password
        };
        const result = await userServices.updateUser(input);

        const expectedOutput = {
          username: 'mealvarez',
          firstName: 'María Eu',
          lastName: 'Álvarez Bermúdez',
          email: 'mariaeugeniaalvarezb@gmail.com',
          password: bcrypt.hashSync('Dry0607.*', config.saltRounds)
        }

        expect(result.username).toEqual(expectedOutput.username);
        expect(result.firstName).toEqual(expectedOutput.firstName);
        expect(result.lastName).toEqual(expectedOutput.lastName);
        expect(result.email).toEqual(expectedOutput.email);
        expect(result.lastName).toEqual(expectedOutput.lastName);
        done();  
      })
  })