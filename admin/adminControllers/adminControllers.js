const adminServices = require( "../adminServices/adminServices" );

//CRUD

const readAdmin = async (req, res)=> {
  try {
    const readedAdmin = await adminServices.readAdminByEmail(req.body);
    res.send(readedAdmin);
  } catch (err) {
    res.status(500).send(err);
  }
}

const readAllAdmins = async (req, res)=> {
  try {
    const readedAdmins = await adminServices.readAllAdmins();
    res.send(readedAdmins);
  } catch (err) {
    res.status(500).send(err);
  }
}

const updateAdmin = async (req, res)=> {
  try {
    const adminData = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      phone: req.body.phone,
      username: req.body.username,
      email: req.body.email
    }

    const updatedAdmin = await adminServices.updateAdmin(adminData);
    return res.send(updatedAdmin);
  } catch (err) {
    res.status(500).send(err);
  }
}

module.exports = { readAdmin, readAllAdmins, updateAdmin };

//CRUD END