const Discount = require("./discountModel");
const jwt = require("jsonwebtoken");
const adminRoleModel = require("../admin/adminRoleModel");
const Product = require("../product/productModel");

const createDiscount = async (discountData) => {
  try {
    const newDiscount = await new Discount(discountData).save();
    if (newDiscount) {
      const products = discountData.appliedProducts;
      await appliedProducts(products, discountData);
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
    const allProducts = await Product.find();
    allProducts.map(async (product) => {
      if (product.discount === req.params.id) {
        const filter = { name: product.name };
        const update = { discount: undefined };
        await Product.findOneAndUpdate(filter, update);
      }
    });
    await Discount.findByIdAndDelete(req.params.id);
    return "Descuento eliminado exitosamente";
  } catch (error) {
    console.log(error);
    return error;
  }
};

/**
 * Retrieve discounts based on various filters.
 * @param {String} userType - The type of user (e.g., 'admin', 'consumer').
 * @param {String} variantSelected - The selected variant of a product.
 * @param {String} username - The username of the user.
 * @param {String} salesPlatform - The platform where the sale is being made.
 * @param {String} salesAgent - The sales agent involved in the transaction.
 * @param {String} prixerId - The ID of the Prixer (artist) associated with the art.
 * @param {String} artId - The ID of the art being purchased.
 * @returns {Array<Object>} - An array of objects containing `discountType` and `discountValue`.
 */
async function getDiscountsByFilters(userType, variantSelected, username, salesPlatform, salesAgent, prixerId, artId) {
  try {
    // Build the query object based on the provided filters
    const query = {};
    
    if (userType && userType != 'guest') query['applyFor.userType'] = userType;
    if (variantSelected) query['appliedProducts'] = variantSelected.name;
    if (username) query['applyFor.username'] = username;
    if (salesPlatform) query['applyFor.salesPlatform'] = salesPlatform;
    if (salesAgent) query['applyFor.salesAgent'] = salesAgent;
    if (prixerId) query['applyFor.prixerId'] = prixerId;
    if (artId) query['applyFor.artId'] = artId;

    console.log('discount', query);

    // Fetch discounts based on the query
    const discounts = await Discount.find(query).select('type value').lean();

    // Map the results to the desired format
    return discounts.map(discount => ({
      format: discount.type,
      type: 'discount',
      value: discount.value,
      operation: 'subtract',
      priority: 1
    }));
  } catch (error) {
    console.error('Error retrieving discounts:', error);
    throw new Error('Failed to retrieve discounts.');
  }
}

module.exports = {
  createDiscount,
  appliedProducts,
  readById,
  readAllDiscounts,
  readAllDiscountsAdmin,
  updateDiscount,
  deleteDiscount,
  getDiscountsByFilters
};
