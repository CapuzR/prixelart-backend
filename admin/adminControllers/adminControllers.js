const adminServices = require("../adminServices/adminServices");
const adminAuthServices = require("../adminServices/adminAuthServices");

//Admin CRUD

const readAdmin = async (req, res) => {
  try {
    const readedAdmin = await adminServices.readAdminByEmail(req.body);
    res.send(readedAdmin);
  } catch (err) {
    res.status(500).send(err);
  }
};

const getSellers = async (req, res) => {
  try {
    const readedAdmin = await adminServices.readSellers();
    res.send(readedAdmin);
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
};

const readAllAdmins = async (req, res) => {
  try {
    const readedAdmins = await adminServices.readAllAdmins();
    res.send(readedAdmins);
  } catch (err) {
    res.status(500).send(err);
  }
};

const updateAdmin = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.modifyAdmins) {
      const adminData = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        phone: req.body.phone,
        area: req.body.area,
        username: req.body.username,
        email: req.body.email,
        isSeller: req.body.isSeller,
      };

      const updatedAdmin = await adminServices.updateAdmin(
        req.params.id,
        adminData
      );
      return res.send(updatedAdmin);
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

const deleteAdmin = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.modifyAdmins) {
      const deletedAdmin = await adminServices.deleteAdmin(req.params.username);
      res.send(deletedAdmin);
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

// Admin Role CRUD
const createAdminRole = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.modifyAdmins) {
      const createdAdminRole = await adminServices.createAdminRole(req.body);
      res.send(createdAdminRole);
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

const readAdminRoles = async (req, res) => {
  try {
    const readedAdminRoles = await adminServices.readAdminRoles();
    res.send(readedAdminRoles);
  } catch (err) {
    res.status(500).send(err);
  }
};

const updateAdminRole = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.modifyAdmins) {
      const idToUpdate = req.params.id;
      const updateRole = {
        area: req.body.area,
        createConsumer: req.body.createConsumer,
        createDiscount: req.body.createDiscount,
        createOrder: req.body.createOrder,
        createPaymentMethod: req.body.createPaymentMethod,
        createProduct: req.body.createProduct,
        createShippingMethod: req.body.createShippingMethod,
        createTestimonial: req.body.createTestimonial,
        deleteConsumer: req.body.deleteConsumer,
        deleteDiscount: req.body.deleteDiscount,
        deletePaymentMethod: req.body.deletePaymentMethod,
        deleteProduct: req.body.deleteProduct,
        deleteShippingMethod: req.body.deleteShippingMethod,
        deleteTestimonial: req.body.deleteTestimonial,
        detailOrder: req.body.detailOrder,
        detailPay: req.body.detailPay,
        modifyAdmins: req.body.modifyAdmins,
        modifyBanners: req.body.modifyBanners,
        modifyDollar: req.body.modifyDollar,
        modifyTermsAndCo: req.body.modifyTermsAndCo,
        orderStatus: req.body.orderStatus,
        prixerBan: req.body.prixerBan,
        readConsumers: req.body.readConsumers,
        readMovements: req.body.readMovements,
        setPrixerBalance: req.body.setPrixerBalance,
        artBan: req.body.artBan,
        modifyBestSellers: req.body.modifyBestSellers,
        modifyArtBestSellers: req.body.modifyArtBestSellers,
      };
      const updatedAdminRole = await adminServices.updateAdminRole(
        idToUpdate,
        updateRole
      );
      return res.send(updatedAdminRole);
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
const deleteAdminRole = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.modifyAdmins) {
      const deletedAdminRole = await adminServices.deleteAdminRole(
        req.params.id
      );
      res.send(deletedAdminRole);
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

module.exports = {
  readAdmin,
  getSellers,
  readAllAdmins,
  updateAdmin,
  deleteAdmin,
  createAdminRole,
  readAdminRoles,
  updateAdminRole,
  deleteAdminRole,
};

//CRUD END
