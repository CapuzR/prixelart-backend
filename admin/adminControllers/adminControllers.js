const adminServices = require("../adminServices/adminServices");

//Admin CRUD

const readAdmin = async (req, res) => {
  try {
    const readedAdmin = await adminServices.readAdminByEmail(req.body);
    res.send(readedAdmin);
  } catch (err) {
    res.status(500).send(err);
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
    const adminData = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      phone: req.body.phone,
      area: req.body.area,
      username: req.body.username,
      email: req.body.email,
    };

    const updatedAdmin = await adminServices.updateAdmin(
      req.params.id,
      adminData
    );
    return res.send(updatedAdmin);
  } catch (err) {
    res.status(500).send(err);
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const deletedAdmin = await adminServices.deleteAdmin(req.params.username);
    res.send(deletedAdmin);
  } catch (err) {
    res.status(500).send(err);
  }
};

// Admin Role CRUD
const createAdminRole = async (req, res) => {
  try {
    const createdAdminRole = await adminServices.createAdminRole(req.body);
    res.send(createdAdminRole);
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
    const idToUpdate = req.params.id;
    const updateRole = {
      area: req.body.area,
      detailOrder: req.body.detailOrder,
      detailPay: req.body.detailPay,
      orderStatus: req.body.orderStatus,
      createOrder: req.body.createOrder,
      createProduct: req.body.createProduct,
      deleteProduct: req.body.deleteProduct,
      modifyBanners: req.body.modifyBanners,
      modifyTermsAndCo: req.body.modifyTermsAndCo,
      createPaymentMethod: req.body.createPaymentMethod,
      deletePaymentMethod: req.body.deletePaymentMethod,
      createShippingMethod: req.body.createShippingMethod,
      deleteShippingMethod: req.body.deleteShippingMethod,
    };
    const updatedAdminRole = await adminServices.updateAdminRole(
      idToUpdate,
      updateRole
    );
    return res.send(updatedAdminRole);
  } catch (err) {
    res.status(500).send(err);
  }
};
const deleteAdminRole = async (req, res) => {
  try {
    const deletedAdminRole = await adminServices.deleteAdminRole(req.params.id);
    res.send(deletedAdminRole);
  } catch (err) {
    res.status(500).send(err);
  }
};

module.exports = {
  readAdmin,
  readAllAdmins,
  updateAdmin,
  deleteAdmin,
  createAdminRole,
  readAdminRoles,
  updateAdminRole,
  deleteAdminRole,
};

//CRUD END
