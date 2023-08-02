// const { nanoid } = require("nanoid");
const jwt = require("jsonwebtoken");
const movementModel = require("./movementModel");
const movementServices = require("./movementServices");

//CRUD

const createMovement = async (req, res, next) => {
  try {
    const movement = {
      _id: req.body._id,
      createdOn: req.body.createdOn,
      createdBy: req.body.createdBy,
      destinatary: req.body.destinatary,
      description: req.body.description,
      type: req.body.type,
      value: req.body.value,
    };
    const newMovement = await movementServices.createMovement(movement);

    const updateBalance = await movementServices.updateBalance(movement);
    res.send({ newMovement, updateBalance });
  } catch (err) {
    res.status(500).send(err);
  }
};

const readByAccount = async (req, res) => {
  try {
    const readedMovements = await movementServices.readByAccount(req.body._id);
    res.send(readedMovements);
  } catch (err) {
    res.status(500).send(err);
  }
};

const readAllMovements = async (req, res) => {
  try {
    const readedMovements = await movementServices.readAllMovements();
    res.send(readedMovements);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

module.exports = {
  createMovement,
  readByAccount,
  readAllMovements,
};
