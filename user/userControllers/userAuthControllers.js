const userServices = require("../userServices/userServices");
const authServices = require("../userServices/userAuthServices");

const register = async (req, res) => {
  try {
    const result = await userServices.createUser(req.body);
    if (result.newUser) {
      const token = authServices.generateToken(result.newUser);
      result.token = token;
      res.cookie("token", token, { httpOnly: true }).send(result);
    } else {
      res.send(result);
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

const login = async (req, res) => {
  try {
    const auth = await authServices.authenticate(req.body);
    if (auth.error_info) {
      return res.send(auth);
    }

    if (auth.token) {
      res.cookie("token", auth.token, { httpOnly: true }).send(auth);
    } else {
      console.log(
        "Falló, error inesperado. Inténtalo de nuevo o contáctanos: rcapuz@prixelart.com"
      );
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

const logout = async (req, res) => {
  const response = {
    success: true,
    message: "logout successfully",
  };

  res.cookie("token", null, { httpOnly: true });
  res.send(response);
};

const changePassword = async (req, res) => {
  try {
    const result = await userServices.changePassword(req.body);
    res.send(result);
  } catch (err) {
    res.status(500).send(err);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authServices.forgotPassword(email);

    res.send(result);
  } catch (e) {
    res.status(500).send(e);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const verifiedToken = await authServices.checkPasswordToken(token);
    if (verifiedToken) {
      const result = await authServices.resetPassword(token, newPassword);
      res.send(result);
    } else {
      res.send(verifiedToken);
    }
  } catch (e) {
    res.status(500).send(e);
  }
};

const checkPasswordToken = async (req, res) => {
  try {
    const { token } = req.body;
    const result = await authServices.checkPasswordToken(token);
    res.send(result);
  } catch (e) {
    res.status(500).send(e);
  }
};

module.exports = {
  register,
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  checkPasswordToken,
};
