const consumerServices = require("./consumerService");
const adminAuthServices = require("../admin/adminServices/adminAuthServices");

const createConsumer = async (req, res) => {
  try {
    const result = await consumerServices.createConsumer(req.body);
    //   if(result.res.success) {
    // const consumerToken = consumerServices.generateToken(result.newConsumer);
    // if(consumerToken){
    //   result.consumerToken = consumerToken;
    //   res
    //   .cookie('consumerToken', consumerToken, {httpOnly: true})
    //   .send({success: true});
    // }
    //   } else {
    res.send(result);
    //   }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const readConsumer = async (req, res) => {
  try {
    const readedConsumer = await consumerServices.readConsumerByEmail(req.body);
    res.send(readedConsumer);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const readConsumerByQuery = async (req, res) => {
  try {
    // console.log('kdjfnvkijudfniodfnoi');
    // console.log(req.body);
    const readedConsumer = await consumerServices.readConsumerByQuery(req.body);
    // console.log(readedConsumer);
    res.send(readedConsumer);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const readAllConsumers = async (req, res) => {
  try {
    const readedConsumers = await consumerServices.readAllConsumers();
    res.send(readedConsumers);
  } catch (err) {
    console.log(err);

    res.status(500).send(err);
  }
};

const updateConsumer = async (req, res) => {
  try {
    const updatedConsumer = await consumerServices.updateConsumer(req.body);
    return res.send(updatedConsumer);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const deleteConsumer = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.deleteConsumer) {
      const deleteConsumer = await consumerServices.deleteConsumer(
        req.params.id
      );
      return res.send(deleteConsumer);
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
module.exports = {
  createConsumer,
  readConsumer,
  readConsumerByQuery,
  readAllConsumers,
  updateConsumer,
  deleteConsumer,
};
