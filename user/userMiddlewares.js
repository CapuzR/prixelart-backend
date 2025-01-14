"use strict";
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const ensureAuthenticated = (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("isAUTH - token", token);
    if (!token) {
      return res.send({
        success: false,
        error_info: "auth error",
        error_message:
          "No has iniciado sesión. Por favor inicia sesión para seguir mostrando tus mejores trabajos.",
      });
    } else {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err)
          return res
            .status(500)
            .send({ auth: false, message: "Failed to authenticate token." });
        req.user = {
          username: decoded.username,
          email: decoded.email,
          firstName: decoded.firstName,
          lastName: decoded.lastName,
          id: decoded.id,
        };
        next();
      });
    }
  } catch (e) {
    res.send({
      success: false,
      error_info: "auth error",
      error_message:
        "No has iniciado sesión. Por favor inicia sesión para seguir mostrando tus mejores trabajos.",
    });
  }
};

const isAuth = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      next();
    } else {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (!err) {
          req.user = {
            username: decoded.username,
            email: decoded.email,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            id: decoded.id,
          };
        }
        next();
      });
    }
  } catch (e) {
    res.send({
      success: false,
      error_info: "auth error",
      error_message:
        "Fatal error, try again.",
    });
  }
};
module.exports = { ensureAuthenticated, isAuth };
