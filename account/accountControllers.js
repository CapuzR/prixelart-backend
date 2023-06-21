const accountServices = require("./accountServices");

const createAccount = (req, res) => {
  try {
    const account = {
      _id: req.body._id,
      balance: req.body.balance,
    };
    const createAccount = accountServices.createAccount(account);

    const addAccount = accountServices.addAccount(req.body.email, account._id);
    res.send({ createAccount, addAccount });
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

module.exports = {
  createAccount,
};
