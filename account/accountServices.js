const Account = require("./accountModel");
const User = require("../user/userModel");

const createAccount = (account) => {
  try {
    const newAccount = new Account(account).save();
    if (newAccount) {
      return {
        success: true,
        newAccount: account,
      };
    } else {
      return { success: false };
    }
  } catch (e) {
    console.log(e);
  }
};

const addAccount = async (email, id) => {
  try {
    const userToUpdate = await User.findOneAndUpdate(
      { email: email },
      { account: id }
    ).exec();
    // userToUpdate.account = id;
    // const userUpdated = userToUpdate.save();
    if (userToUpdate) {
      return userToUpdate;
    } else {
      console.log(err);
    }
  } catch (e) {
    console.log(e);
  }
};

const checkBalance = async (id) => {
  try {
    const account = await Account.findOne({ _id: id });
    return { balance: account.balance };
  } catch (error) {
    console.log(error);
  }
};

const readAll = async () => {
  try {
    const accountList = await Account.find();
    return { accounts: accountList };
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  createAccount,
  addAccount,
  checkBalance,
  readAll,
};
