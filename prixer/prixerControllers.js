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
      status: req.body.status,
      termsAgree: req.body.termsAgree,
    };

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
    const readedPrixers = await prixerServices.readAllPrixers({ status: true });
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

const readAllPrixersFullv2 = async (req, res) => {
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
      status: req.body.status,
      termsAgree: req.body.termsAgree,
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

const updateVisibility = async (req, res) => {
  console.log(req.body);
  try {
    const prixerData = {
      status: req.body.status,
    };
    const updates = await prixerServices.updateVisibility(
      req.params.id,
      prixerData
    );
    return res.send(updates);
  } catch (err) {
    console.log(err);
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
  updateVisibility,
  disablePrixer,
  readAllPrixersFull,
  readAllPrixersFullv2,
};

//CRUD END
