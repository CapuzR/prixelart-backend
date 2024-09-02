const Surcharge = require("./surchargeModel");
const Product = require("../product/productModel");

const createSurcharge = async (surchargeData) => {
  try {
    const newSurcharge = await new Surcharge(surchargeData).save();
    if (newSurcharge) {
      //   const products = surchargeData.appliedProducts;
      //   await appliedProducts(products, surchargeData);
      return {
        success: true,
        surchargeData: newSurcharge,
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

//   const appliedProducts = async (products, data) => {
//     let productsApplied = [];
//     const allProducts = await Product.find();
//     allProducts.map(async (product) => {
//       if (product.discount === data._id) {
//         const filter = { name: product.name };
//         const update = { discount: undefined };
//         await Product.findOneAndUpdate(filter, update);
//       }
//     });
//     if (data.active) {
//       await products.map(async (product) => {
//         const filter = { name: product };
//         const update = { discount: data._id };

//         const readedProduct = await Product.findOneAndUpdate(filter, update, {
//           returnOriginal: false,
//         });
//         productsApplied.push(readedProduct);
//       });
//     }

//     return productsApplied;
//   };

const updateSurcharge = async (id, data) => {
  const updateSurcharge = await Surcharge.findByIdAndUpdate(id, data, {
    new: true,
  });
  if (updateSurcharge) {
    //   const products = data.appliedProducts;
    //   await appliedProducts(products, data);
    return {
      success: true,
      surchargeData: updateSurcharge,
      // products: applied,
    };
  }
};

const readAllSurcharge = async () => {
  try {
    const readedSurcharges = await Surcharge.find();
    if (readedSurcharges) {
      const data = {
        info: "Todos los recargos disponibles",
        surcharges: readedSurcharges,
      };
      return data;
    } else {
      const data = {
        info: "No hay recargos registrados",
        surcharges: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const readActiveSurcharge = async () => {
  try {
    const readedSurcharges = await Surcharge.find({ active: true });
    if (readedSurcharges) {
      const data = {
        info: "Todos los recargos disponibles",
        surcharges: readedSurcharges,
      };
      return data;
    } else {
      const data = {
        info: "No hay recargos registrados",
        surcharges: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const deleteSurcharge = async (req) => {
  try {
    // const allProducts = await Product.find();
    // allProducts.map(async (product) => {
    //   if (product.discount === req.params.id) {
    //     const filter = { name: product.name };
    //     const update = { discount: undefined };
    //     await Product.findOneAndUpdate(filter, update);
    //   }
    // });
    await Surcharge.findByIdAndDelete(req.params.id);
    return "Recargo eliminado exitosamente";
  } catch (error) {
    console.log(error);
    return error;
  }
};

/**
 * Retrieve surcharges based on various filters.
 * @param {String} userType - The type of user (e.g., 'admin', 'consumer').
 * @param {String} variantSelected - The selected variant of a product.
 * @param {String} username - The username of the user.
 * @param {String} salesPlatform - The platform where the sale is being made.
 * @param {String} salesAgent - The sales agent involved in the transaction.
 * @param {String} prixerId - The ID of the Prixer (artist) associated with the art.
 * @param {String} artId - The ID of the art being purchased.
 * @returns {Array<Object>} - An array of objects containing `surchargeType` and `surchargeValue`.
 */
async function getSurchargesByFilters(userType, variantSelected, username, salesPlatform, salesAgent, prixerId, artId) {
  try {
    // Build the query object based on the provided filters
    const query = {};

    if (userType && userType != 'guest') query['appliedUsers.role'] = userType;
    if (variantSelected) query['appliedProducts'] = variantSelected.name;
    if (username) query['appliedUsers.username'] = username;
    if (salesPlatform) query['appliedPlatform._id'] = salesPlatform;
    if (salesAgent) query['appliedSalesAgent._id'] = salesAgent;
    if (prixerId) query['appliedArtist._id'] = prixerId;
    if (artId) query['appliedArt._id'] = artId;

    // Fetch surcharges based on the query
    const surcharges = await Surcharge.find(query).select('type value').lean();

    // Map the results to the desired format
    return surcharges.map(surcharge => ({
      format: surcharge.type,
      type: 'surcharge',
      value: surcharge.value,
      operation: 'add',
      priority: 2
    }));
  } catch (error) {
    console.error('Error retrieving surcharges:', error);
    throw new Error('Failed to retrieve surcharges.');
  }
}


module.exports = {
  createSurcharge,
  readAllSurcharge,
  readActiveSurcharge,
  updateSurcharge,
  deleteSurcharge,
  getSurchargesByFilters
};
