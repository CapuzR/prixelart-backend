const User = require("../userModel");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();
const saltRounds = process.env.SALT_ROUNDS;

//CRUD
const createUser = async (userData) => {
  try {
    const readedUserByEmail = await readUserByEmail(userData);
    const readedUserByUsername = await readUserByUsername(userData.username);
    if (readedUserByUsername) {
      return {
        success: false,
        info: "error_username",
        message: "Disculpa, el nombre de usuario ya está registrado.",
      };
    }

    if (readedUserByEmail) {
      return {
        success: false,
        info: "error_email",
        message: "Disculpa, el correo del usuario ya está registrado.",
      };
    }
    const salt = await bcrypt.genSalt(2);
    const hash = await bcrypt.hash(userData.password, salt);

    userData.password = hash;
    let newUser = await new User(userData).save();
    return {
      res: { success: true, userId: newUser.id },
      newUser: newUser,
    };
  } catch (e) {
    return "Unable to create new User.";
  }
};

const validateCurrentPassword = async (currentPassword, dbPassword) => {
  if (!bcrypt.compareSync(currentPassword, dbPassword)) {
    return {
      success: false,
      token: null,
      userId: null,
      error_info: "error_pw",
      error_message: "Inténtalo de nuevo, contraseña incorrecta.",
    };
  } else {
    return {
      success: true,
      token: null,
      userId: null,
      error_info: "",
      error_message: "Contraseñas coinciden.",
    };
  }
};

const changePassword = async (userData) => {
  try {
    const readedUserPassByUsername = await readUserPassByUsername(
      userData.username
    );
    if (!readedUserPassByUsername) {
      return {
        success: false,
        info: "error_username",
        message: "Nombre de usuario incorrecto.",
      };
    }
    const validatedCurrentPassword = await validateCurrentPassword(
      userData.currentPassword,
      readedUserPassByUsername.password
    );

    if (validatedCurrentPassword.success) {
      const salt = await bcrypt.genSalt(2);
      const hash = await bcrypt.hash(userData.newPassword, salt);
      readedUserPassByUsername.password = hash;
      const updatedUser = await readedUserPassByUsername.save();
    }
  } catch (e) {
    return "Unable to change the password.";
  }
};

const resetPassword = async (newPassword, user) => {
  const salt = await bcrypt.genSalt(2);
  const hash = await bcrypt.hash(newPassword, salt);
  user.password = hash;
  const updatedUser = await simpleUserUpdate(user);
  if (updatedUser.success) {
    return {
      success: true,
      info: "Contraseña modificada correctamente. Por favor inicia sesión.",
    };
  } else {
    return {
      success: false,
      info: "No pudimos actualizar tu contraseña, por favor inténtalo de nuevo.",
    };
  }

  return updatedUser;
};

const readUserByResetToken = async (data) => {
  return await User.findOne({ token: data.token });
};
const readUserByEmailNotExec = async (userData) => {
  return await User.findOne({ email: userData.email });
};
const readUserById = async (userData) => {
  return await User.findOne({ _id: userData.id }).exec();
};
const readUserByEmail = async (userData) => {
  return await User.findOne({ email: userData.email }).exec();
};
const readUserByUsername = async (username) => {
  return await User.findOne({ username: username }).exec();
};
const readUserPassByUsername = async (username) => {
  return await User.findOne({ username: username }).exec();
};

const readUserByAccount = async (account) => {
  const finded = await User.findOne({account: account}).exec();
  finded.password = undefined;
  finded.token = undefined;
  finded.email = undefined;
  return finded
}

const updateUser = async (userData) => {
  const toUpdateUser = await User.findOne({ email: userData.email });
  toUpdateUser.username = userData.username;
  toUpdateUser.firstName = userData.firstName;
  toUpdateUser.lastName = userData.lastName;

  const updatedUser = await toUpdateUser.save();
  if (!updatedUser) {
    return console.log("User update error: " + err);
  }
  return updatedUser;
};

const simpleUserUpdate = async (user) => {
  const updatedUser = await user.save();
  if (!updatedUser) {
    console.log("User update error: " + err);
    return { success: false };
  }
  return { success: true };
};

const disableUser = (userData) => {};

const removeUser = async (userData) => {
  const readedUser = await User.findOne({ _id: userData.id });
  const removedUser = readedUser.remove();
  if (removedUser) {
    return "Se eliminaron: " + removedUser;
  } else {
    return removedUser;
  }
};

const removeUsers = async () => {
  const removedUsers = await User.deleteMany({});
  if (removedUsers) {
    return "Se eliminaron: " + removedUsers;
  } else {
    return removedUsers;
  }
};

//CRUD END

module.exports = {
  createUser,
  readUserById,
  readUserByEmailNotExec,
  readUserByEmail,
  simpleUserUpdate,
  readUserByUsername,
  readUserByAccount,
  updateUser,
  disableUser,
  removeUser,
  removeUsers,
  changePassword,
  resetPassword,
  readUserByResetToken,
};
