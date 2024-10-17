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

const readDiscountByFilter = async (productName = null, userId = null) => {
  try {
    
    const filter = { $and: [{$or : []}, {active: true}] };

    if (productName) {
      filter.$and[0].$or.push({ appliedProducts : { $in: [productName] } }); 
    }
    
    if (userId) {
      filter.$and[0].$or.push({ applyBy : userId });
    }

    const discounts = await Discount.find(filter);

    if (discounts && discounts.length > 0) {      
      return {
        success: true,
        message: "Discounts found",
        discounts,
      };
    } else {
      return {
        success: false,
        message: "No discounts found with the given filters",
        discounts: [],
      };
    }
  } catch (error) {
    console.error("Error reading discounts by filter:", error);
    return {
      success: false,
      message: "An error occurred while retrieving discounts.",
      error,
    };
  }
};

const applyDiscounts = async (values = [], productName = null, userId = null) => {
  try {
    const discountResponse = await readDiscountByFilter(productName, userId);

    if (discountResponse.success && discountResponse.discounts.length > 0) {
      const discountedValues = values.map((value) => {
        let discountedValue = value;

        discountResponse.discounts.forEach((discount) => {
          if (discount.type === 'Porcentaje') {
            discountedValue -= (discount.value / 100) * discountedValue;
          } else if (discount.type === 'Monto') {
            discountedValue -= discount.value;
          }
        });
        return Math.max(0, discountedValue);
      });

      return discountedValues;
    } else {
      return values;
    }
  } catch (error) {
    console.error("Error applying discounts:", error);
    return values;
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
  readDiscountByFilter,
  applyDiscounts
};
