const Discount = require("./discountModel");
const jwt = require("jsonwebtoken");
const adminRoleModel = require("../admin/adminRoleModel");

const createDiscount = async (discountData) => {
  try {
    const newDiscount = await new Discount(discountData).save();
    if (newDiscount) {
      return {
        success: true,
        discountData: newDiscount,
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

const readAllProducts = async () => {
  try {
    const readedDiscounts = await Discount.find({ active: true });
    if (readedDiscounts) {
      const data = {
        info: "Todos los descuentos disponibles",
        products: readedDiscounts,
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
        arts: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const updateProduct = async (productData, productId) => {
  try {
    const updateProduct = await Discount.findByIdAndUpdate(
      productId,
      productData
    );
    if (!updateProduct) {
      return console.log("Discount update error: " + err);
    }
    return "Actualización realizada con éxito.";
  } catch (error) {
    console.log(error);
    return error;
  }
};

const deleteProduct = async (req) => {
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
          await Discount.findByIdAndDelete(productId);
          return "Producto eliminado exitosamente";
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

const deleteVariant = async (data) => {
  try {
    const selectedProduct = data.id;
    const indexVariant = data.i;

    const productToUpdate = await Discount.findById(selectedProduct);
    productToUpdate.variants.splice(indexVariant, 1);
    // productToUpdate.variants = [];

    const updatedProduct = await Discount.findByIdAndUpdate(
      selectedProduct,
      productToUpdate
    );
    if (!updatedProduct) {
      return console.log("Cannot delete variant:" + err);
    }
    return "Variante eliminada con éxito";
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = {
  createDiscount,
  readById,
  readAllProducts,
  readAllDiscountsAdmin,
  updateProduct,
  deleteProduct,
  deleteVariant,
};
