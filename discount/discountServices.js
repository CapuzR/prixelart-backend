const Discount = require("./discountModel");
const jwt = require("jsonwebtoken");
const adminRoleModel = require("../admin/adminRoleModel");
const Product = require("../product/productModel");

const createDiscount = async (discountData) => {
  try {
    const newDiscount = await new Discount(discountData).save();
    if (newDiscount) {
      const products = discountData.appliedProducts;
      await appliedProducts(products, discountData._id);
      return {
        success: true,
        discountData: newDiscount,
        // products: applied,
      };
    } else {
      return {
        success: false,
        message: "Disculpa, ocurrió un error desconocido, inténtalo de nuevo.",
      };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const appliedProducts = async (products, data) => {
  let productsApplied = [];
  const allProducts = await Product.find();
  allProducts.map(async (product) => {
    if (product.discount === data._id) {
      const filter = { name: product.name };
      const update = { discount: undefined };
      await Product.findOneAndUpdate(filter, update);
    }
  });
  if (data.active) {
    await products.map(async (product) => {
      const filter = { name: product };
      const update = { discount: data._id };

      const readedProduct = await Product.findOneAndUpdate(filter, update, {
        returnOriginal: false,
      });
      productsApplied.push(readedProduct);
    });
  }

  return productsApplied;
};

const updateDiscount = async (id, data) => {
  const updateDiscount = await Discount.findByIdAndUpdate(id, data);
  if (updateDiscount) {
    const products = data.appliedProducts;
    await appliedProducts(products, data);
    return {
      success: true,
      discountData: updateDiscount,
      // products: applied,
    };
  }
};

const readById = async (Discount) => {
  try {
    const readedProduct = await Discount.find({ _id: Discount._id });
    if (readedProduct) {
      const data = {
        info: "Todos los descuentos disponibles",
        products: readedProduct,
      };
      return data;
    } else {
      const data = {
        info: "No hay descuentos registrados",
        arts: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const readAllDiscounts = async () => {
  try {
    const readedDiscounts = await Discount.find({ active: true });
    if (readedDiscounts) {
      const data = {
        info: "Todos los descuentos disponibles",
        discounts: readedDiscounts,
      };
      return data;
    } else {
      const data = {
        info: "No hay descuentos registrados",
        discounts: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};
const readAllDiscountsAdmin = async () => {
  try {
    const readedDiscounts = await Discount.find();
    if (readedDiscounts) {
      const data = {
        info: "Todos los descuentos disponibles",
        discounts: readedDiscounts,
      };
      return data;
    } else {
      const data = {
        info: "No hay descuentos registrados",
        discounts: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const deleteDiscount = async (req) => {
  try {
    const adminToken = req.body.adminToken;
    const productId = req.params.id;
    let check;
    jwt.verify(adminToken, process.env.JWT_SECRET, async (err, decoded) => {
      let result = await adminRoleModel.findOne({
        area: decoded.area,
      });
      check = result;
      if (err) {
        return res.status(500).send({
          auth: false,
          message: "Falló autenticación de token.",
        });
      } else if (decoded) {
        check = result;
        if (check && check.deleteProduct) {
          const allProducts = await Product.find();
          allProducts.map(async (product) => {
            if (product.discount === req.params.id) {
              const filter = { name: product.name };
              const update = { discount: undefined };
              await Product.findOneAndUpdate(filter, update);
            }
          });
          await Discount.findByIdAndDelete(productId);
          return "Descuento eliminado exitosamente";
        } else {
          const warning = {
            auth: false,
            message: "No tienes autorización para realizar esta acción.",
          };
          return warning;
        }
      }
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = {
  createDiscount,
  appliedProducts,
  readById,
  readAllDiscounts,
  readAllDiscountsAdmin,
  updateDiscount,
  deleteDiscount,
};
