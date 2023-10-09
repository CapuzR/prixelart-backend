const adminAuthServices = require("../adminServices/adminAuthServices");

const createAdmin = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.modifyAdmins) {
      const result = await adminAuthServices.createAdmin(req.body);
      if (result.res.success) {
        const adminToken = adminAuthServices.generateToken(result.newAdmin);
        if (adminToken) {
          result.adminToken = adminToken;
          res
            .cookie("adminToken", adminToken, { httpOnly: true })
            .send({ success: true });
        }
      } else {
        res.send(result);
      }
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

const adminLogin = async (req, res) => {
  try {
    const auth = await adminAuthServices.authenticate(req.body);
    if (auth.error_info) {
      return res.send(auth);
    }

    if (auth.adminToken) {
      res.cookie("adminToken", auth.adminToken, { httpOnly: true }).send(auth);
    } else {
      console.log(
        "Falló, error inesperado. Inténtalo de nuevo o contáctanos: rcapuz@prixelart.com"
      );
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

module.exports = { createAdmin, adminLogin };
