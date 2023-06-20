const accountServices = require("./accountServices");

const createAccount = async (req, res) => {
  try {
    const account = {
      _id: req.body._id,
      balance: req.body.balance,
    };
    const createAccount = await accountServices.createAccount(account);
    console.log(createAccount, "creación");

    const addAccount = accountServices.addAccount(req.body.email, account._id);
    console.log(addAccount, "inclusión en user");
    res.send(createAccount);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

module.exports = {
  createAccount,
};
