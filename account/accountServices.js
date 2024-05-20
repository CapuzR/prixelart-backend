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
    return e;
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
    return e;
  }
};

const checkBalance = async (id) => {
  try {
    const account = await Account.findOne({ _id: id });
    if (account) {
      return { balance: account.balance };
    } else {
      return {
        balance: 0,
        success: false,
        message: "Cartera no encontrada, inténtalo de nuevo.",
      };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const readAll = async () => {
  try {
    const accountList = await Account.find();
    return { accounts: accountList };
  } catch (error) {
    console.log(error);
    return error;
  }
};

const deleteAccount = async (id) => {
  try {
    const del = await Account.findByIdAndDelete(id);
    return del;
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = {
  createAccount,
  addAccount,
  checkBalance,
  readAll,
  deleteAccount,
};
