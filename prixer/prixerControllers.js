const prixerServices = require("./prixerServices");
const userControllers = require("../user/userControllers/userControllers");

//CRUD

const createPrixer = async (req, res) => {
  try {
    const prixerData = {
      specialtyArt: req.body.specialtyArt,
      instagram: req.body.instagram,
      facebook: req.body.facebook,
      twitter: req.body.twitter,
      dateOfBirth: req.body.dateOfBirth,
      phone: req.body.phone,
      country: req.body.country,
      city: req.body.city,
      description: req.body.description,
      userId: req.user.id,
      avatar: req.body.avatar,
      username: req.user.username,
    };

    console.log(prixerData, "este es el registro");

    res.send(await prixerServices.createPrixer(prixerData));
  } catch (e) {
    res.status(500).send(e);
  }
};

const readPrixer = async (req, res) => {
  try {
    const user = await userControllers.readUserByUsername(req);
    const readedPrixer = await prixerServices.readPrixer(user);
    res.send(readedPrixer);
  } catch (err) {
    res.status(500).send(err);
  }
};

const readAllPrixers = async (req, res) => {
  try {
    const readedPrixers = await prixerServices.readAllPrixers();
    res.send(readedPrixers);
  } catch (err) {
    res.status(500).send(err);
  }
};

const readAllPrixersFull = async (req, res) => {
  try {
    const readedPrixers = await prixerServices.readAllPrixersFull();
    res.send(readedPrixers);
  } catch (err) {
    res.status(500).send(err);
  }
};

const updatePrixer = async (req, res) => {
  try {
    const prixer = {
      specialtyArt: req.body.specialtyArt,
      instagram: req.body.instagram,
      facebook: req.body.facebook,
      twitter: req.body.twitter,
      dateOfBirth: req.body.dateOfBirth,
      phone: req.body.phone,
      country: req.body.country,
      city: req.body.city,
      username: req.body.username,
      avatar: req.body.avatar,
      description: req.body.description,
    };

    const user = {
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      id: req.user.id,
    };
    const updates = await prixerServices.updatePrixer(prixer, user);
    return res.send(updates);
  } catch (err) {
    res.status(500).send(err);
  }
};

const disablePrixer = async (req, res) => {
  try {
    const disabledUser = await prixerServices.disablePrixer(req.body);
    return res.send(disabledUser);
  } catch (err) {
    res.status(500).send(err);
  }
};

module.exports = {
  createPrixer,
  readAllPrixers,
  readPrixer,
  updatePrixer,
  disablePrixer,
  readAllPrixersFull,
};

//CRUD END
