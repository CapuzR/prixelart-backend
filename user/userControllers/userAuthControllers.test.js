
const bcrypt = require('bcrypt');
const userAuthControllers = require('./userAuthControllers');
const dotenv = require('dotenv');
dotenv.config();

const mocks = {
    mockRequest: () => {
      const req = {}
      req.body = jest.fn().mockReturnValue(req)
      req.params = jest.fn().mockReturnValue(req)
      return req
    }
  }

it('logout user.', async()=> {
    let req = mocks.mockRequest();
    req.cookies = {token: 'tokenTest'}
    let res = {};
    res.status = jest.fn().mockReturnValue(res)
    res.cookie = (tokenDummy, tokenNewValue, httpOnly)=> {
      req.cookies.token = tokenNewValue;
    };
    res.send = (values)=> {
        res.success = values.success,
        res.message = values.message
    };

    await userAuthControllers.logout(req, res);

    expect(res.success).toBe(true);
    expect(res.message).toBe('logout successfully');
});
