const Users = require("../userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userServices = require("./userServices");
const emailSender = require("../../utils/emailSender");
const dotenv = require("dotenv");
dotenv.config();

const authenticate = async (userData) => {
  const user = await userServices.readUserByEmail({
    email: userData.email,
  });

  if (user) {
    if (!bcrypt.compareSync(userData.password, user.password)) {
      return {
        success: false,
        token: null,
        userId: null,
        error_info: "error_pw",
        error_message: "Inténtalo de nuevo, contraseña incorrecta.",
      };
    } else {
      const payload = {
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        password: user.password,
        id: user.id,
        time: new Date(),
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.TOKEN_EXPIRE_TIME,
      });

      // const token = jwt.sign(payload, config.jwtSecret, {
      //     expiresIn: config.tokenExpireTime
      // });

      return {
        success: true,
        token: token,
        username: user.username,
        // email: user.email,
        userId: user.id,
        error_info: null,
        error_message: null,
      };
    }
  } else {
    return {
      success: false,
      token: null,
      userId: null,
      error_info: "error_email",
      error_message:
        "No se encuentra el email, por favor regístrate para formar parte de la #ExperienciaPrixelart",
    };
  }
};

const generateToken = (user) => {
  try {
    const payload = {
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: user.password,
      id: user.id,
      time: new Date(),
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.TOKEN_EXPIRE_TIME,
    });

    return token;
  } catch (err) {
    resizeBy.status(400).json({ error: err });
  }
};

const forgotPassword = async (email) => {
  try {
    const user = await userServices.readUserByEmailNotExec({ email: email });

    if (!user) {
      return res.status(400).json({
        error: "Este usuario no existe, inténtalo de nuevo.",
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.RESET_PASSWORD_KEY, {
      expiresIn: "15m",
    });

    const templates = {
      "forgot-password": "d-319b1f51b2424604b5e4951473205496",
    };
    const message = {
      to: user.email,
      from: {
        email: "prixers@prixelart.com",
        name: "Prixelart",
      },
      templateId: templates["forgot-password"],
      dynamic_template_data: {
        recoveryUrl: process.env.FRONT_END_URL + "/recuperar/" + token,
      },
    };

    user.token = token;

    const result = await userServices.simpleUserUpdate(user);
    if (!result.success) {
      return {
        success: false,
        info: "No se pudo enviar el correo de recuperación, por favor refresca e inténtalo de nuevo.",
      };
    }

    return emailSender.sendEmail(message);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

const resetPassword = async (token, newPassword) => {
  try {
    const user = await userServices.readUserByResetToken({ token: token });

    if (!user) {
      return {
        success: false,
        info: "Token inválido, por favor cambia tu contraseña en prixelart.com/olvido-contraseña",
      };
    }

    user.token = "";

    const result = await userServices.resetPassword(newPassword, user);
    return result;
  } catch (e) {
    res.status(500).send(e);
  }
};

const checkPasswordToken = async (token) => {
  try {
    return jwt.verify(
      token,
      process.env.RESET_PASSWORD_KEY,
      (err, verifiedToken) => {
        if (!verifiedToken) {
          return {
            success: false,
            info: "Token inválido, por favor cambia tu contraseña en prixelart.com/olvido-contraseña",
          };
        } else {
          return {
            success: true,
            info: "Token válido.",
          };
        }
      }
    );
  } catch (e) {
    res.status(500).send(e);
  }
};

module.exports = {
  authenticate,
  generateToken,
  forgotPassword,
  checkPasswordToken,
  resetPassword,
};
