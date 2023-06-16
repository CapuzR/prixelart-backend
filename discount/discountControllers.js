const { nanoid } = require("nanoid");
const jwt = require("jsonwebtoken");
const discountModel = require("./discountModel");
const discountServices = require("./discountServices");
const adminRoleModel = require("../admin/adminRoleModel");

//CRUD

const createDiscount = async (req, res, next) => {
  try {
    // const adminToken = req.body.adminToken;
    // let check;
    // jwt.verify(adminToken, process.env.JWT_SECRET, async (err, decoded) => {
    //   let result = await adminRoleModel.findOne({
    //     area: decoded.area,
    //   });
    //   check = result;
    //   if (err) {
    //     return res.status(500).send({
    //       auth: false,
    //       message: "Falló autenticación de token.",
    //     });
    //   } else if (decoded) {
    // check = result;
    // if (check && check.createProduct) {

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
    // }
    //   } else {
    //     const warning = {
    //       auth: false,
    //       message: "No tienes autorización para realizar esta acción.",
    //     };
    //     return warning;
    //   }
    // });
  } catch (err) {
    res.status(500).send(err);
  }
};

const updateDiscount = async (req, res) => {
  try {
    const updatedDiscount = await discountServices.updateDiscount(
      req.body._id,
      req.body
    );
    res.send(updatedDiscount);
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

const readAllProducts = async (req, res) => {
  try {
    const readedDiscounts = await discountServices.readAllProducts();
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
  const productResult = await discountServices.deleteDiscount(req);
  data = {
    productResult,
    success: true,
  };
  return res.send(data);
}

module.exports = {
  createDiscount,
  //   readById,
  //   readAllProducts,
  readAllDiscountsAdmin,
  updateDiscount,
  //   updateVariants,
  deleteDiscount,
  //   deleteVariant,
};

// //CRUD END
