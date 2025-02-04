const FormData = require("form-data"); // form-data v4.0.1
const Mailgun = require("mailgun.js");
const userService = require("../userServices/userServices");


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

async function testEmails() {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY|| "API_KEY",
    // When you have an EU-domain, you must specify the endpoint:
    // url: "https://api.eu.mailgun.net/v3"
  });
  try {
    const data = await mg.messages.create("sandbox2e58b581f9484b3ab04e21a4b110a37f.mailgun.org", {
      from: "Mailgun Sandbox <postmaster@sandbox2e58b581f9484b3ab04e21a4b110a37f.mailgun.org>",
      to: ["Edward <iamwar2070@gmail.com>"],
      subject: "Hello Edward",
      text: "Congratulations Edward, you just sent an email with Mailgun! You are truly awesome!",
    });

    console.log(data); // logs response data
  } catch (error) {
    console.log(error); //logs any error
  }
}
module.exports = {
  readUserById,
  readUserByUsername,
  readUserByAccount,
  updateUser,
  disableUser,
  testEmails
}

//CRUD END
