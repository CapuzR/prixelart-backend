const discountServices = require("./discountServices");
const adminAuthServices = require("../admin/adminServices/adminAuthServices");

//CRUD

const createDiscount = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.createDiscount) {
      const newDiscount = {
        _id: req.body._id,
        name: req.body.name,
        active: req.body.active,
        description: req.body.description,
        type: req.body.type,
        value: req.body.value,
        appliedProducts: req.body.appliedProducts,
      };
      res.send(await discountServices.createDiscount(newDiscount));
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

const updateDiscount = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.createDiscount) {
      const updatedDiscount = await discountServices.updateDiscount(
        req.body._id,
        req.body
      );
      res.send(updatedDiscount);
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

const readById = async (req, res) => {
  try {
    const readedProduct = await discountServices.readById(req.body);
    res.send(readedProduct);
  } catch (err) {
    res.status(500).send(err);
  }
};

const readAllDiscounts = async (req, res) => {
  try {
    const readedDiscounts = await discountServices.readAllDiscounts();
    res.send(readedDiscounts);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const readAllDiscountsAdmin = async (req, res) => {
  try {
    const readedDiscounts = await discountServices.readAllDiscountsAdmin();
    res.send(readedDiscounts);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

async function deleteDiscount(req, res) {
  let checkPermissions = await adminAuthServices.checkPermissions(
    req.body.adminToken
  );
  if (checkPermissions.role.deleteDiscount) {
    const productResult = await discountServices.deleteDiscount(req);
    data = {
      productResult,
      success: true,
    };
    return res.send(data);
  } else {
    return res.send({
      success: false,
      message: "No tienes autorización para realizar esta acción.",
    });
  }
}

module.exports = {
  createDiscount,
  //   readById,
  readAllDiscounts,
  readAllDiscountsAdmin,
  updateDiscount,
  deleteDiscount,
};
