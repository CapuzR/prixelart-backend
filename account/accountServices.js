const Account = require("./accountModel");
// const userServices = require("../user/userServices");
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
    const userToUpdate = await User.findOne({ email: email }).exec();
    // userServices.readUserByEmail({ email: email });
    console.log(userToUpdate);
    userToUpdate.account = id;
    const userUpdated = userToUpdate.save();
    if (userUpdated) {
      return userUpdated;
    } else {
      console.log(err);
    }
  } catch (e) {
    console.log(e);
  }
};
module.exports = {
  createAccount,
  addAccount,
};
