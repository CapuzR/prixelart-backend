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

module.exports = {
  createSurcharge,
  readAllSurcharge,
  readActiveSurcharge,
  updateSurcharge,
  deleteSurcharge,
};
