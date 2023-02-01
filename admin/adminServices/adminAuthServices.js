const Admin = require("../adminModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adminServices = require("./adminServices");
const dotenv = require("dotenv");
dotenv.config();

const createAdmin = async (adminData) => {
  try {
    const readedAdminByEmail = await adminServices.readAdminByEmail(adminData);
    const readedAdminByUsername = await adminServices.readAdminByUsername(
      adminData.username
    );
    if (readedAdminByUsername) {
      return {
        success: false,
        info: "error_username",
        message: "Disculpa, el nombre de usuario ya está registrado.",
      };
    }

    if (readedAdminByEmail) {
      return {
        success: false,
        info: "error_email",
        message: "Disculpa, el correo del usuario ya está registrado.",
      };
    }

    const salt = await bcrypt.genSalt(2);
    const hash = await bcrypt.hash(adminData.password, salt);

    adminData.password = hash;
    let newAdmin = await new Admin(adminData).save();
    return {
      res: { success: true, adminId: newAdmin._id },
      newAdmin: newAdmin,
    };
  } catch (e) {
    return "Incapaz de crear el usuario, intenta de nuevo o consulta a soporte.";
  }
};

const authenticate = async (adminData) => {
  try {
    const admin = await adminServices.readFullAdminByEmail({
      email: adminData.email,
    });

    if (admin) {
      if (!bcrypt.compareSync(adminData.password, admin.password)) {
        return {
          success: false,
          token: null,
          adminId: null,
          error_info: "error_pw",
          error_message: "Inténtalo de nuevo, contraseña incorrecta.",
        };
      } else {
        const payload = {
          username: admin.username,
          firstName: admin.firstName,
          lastName: admin.lastName,
          phone: admin.phone,
          email: admin.email,
          id: admin._id,
          time: new Date(),
        };

        const adminToken = jwt.sign(payload, process.env.ADMIN_JWT_SECRET, {
          expiresIn: process.env.ADMIN_TOKEN_EXPIRE_TIME,
        });

        return {
          success: true,
          adminToken: adminToken,
          username: admin.username,
          adminId: admin._id,
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
          "No se encuentra el email, por favor solicita un usuario con acceso.",
      };
    }
    // }
  } catch (e) {
    console.log(e);
  }
};

const generateToken = (admin) => {
  try {
    const payload = {
      username: admin.username,
      firstName: admin.firstName,
      lastName: admin.lastName,
      password: admin.password,
      id: admin._id,
      time: new Date(),
    };

    const adminToken = jwt.sign(payload, process.env.ADMIN_JWT_SECRET, {
      expiresIn: process.env.ADMIN_TOKEN_EXPIRE_TIME,
    });

    return adminToken;
  } catch (err) {
    resizeBy.status(400).json({ error: err });
  }
};

const ensureAuthenticated = (req, res, next) => {
  try {
    const adminToken = req.cookies.adminToken;
    if (!adminToken) {
      return res.send({
        success: false,
        error_info: "auth error",
        error_message:
          "No has iniciado sesión. Por favor inicia sesión para continuar.",
      });
    } else {
      jwt.verify(adminToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err)
          return res
            .status(500)
            .send({ auth: false, message: "Falló autenticación de token." });
        next();
      });
    }
  } catch (e) {
    res.send({
      success: false,
      error_info: "auth error",
      error_message:
        "No has iniciado sesión. Por favor inicia sesión para continuar.",
    });
  }
};

module.exports = {
  createAdmin,
  authenticate,
  generateToken,
  ensureAuthenticated,
};
