const userService = require("../userServices/userServices")

//Es importante modificar userService por userServices.

//CRUD
//Create: /user/userAuthControllers.js

async function readUserById(req, res) {
  try {
    const readedUser = await userService.readUserById(req.user)
    return res.send(readedUser)
  } catch (err) {
    res.status(500).send(err)
  }
}

async function readUserByUsername(req, res) {
  try {
    return await userService.readUserByUsername(req)
  } catch (err) {
    res.status(500).send(err)
  }
}

async function updateUser(req, res) {
  try {
    const user = {
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      login_count: req.login_count,
    }
    const updatedUser = await userService.updateUser(user)
    return res.send(updatedUser)
  } catch (err) {
    res.status(500).send(err)
  }
}

const readUserByAccount = async (req, res) => {
  try {
    const account = req.body.account
    const getUser = await userService.readUserByAccount(account)
    return res.send(getUser)
  } catch (error) {
    res.status(500).send(error)
  }
}

async function disableUser(req, res) {
  try {
    const disabledUser = await userService.disableUser(req.body)
    return res.send(disabledUser)
  } catch (err) {
    res.status(500).send(err)
  }
}

module.exports = {
  readUserById,
  readUserByUsername,
  readUserByAccount,
  updateUser,
  disableUser,
}

//CRUD END
