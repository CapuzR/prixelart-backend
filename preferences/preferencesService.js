const { dollarValue } = require("./preferencesModel");
const Product = require("../product/productModel");
const Art = require("../art/artModel");
const updateDollarValue = async (dollar) => {
  try {
    const result = await dollarValue.find();
    const updating = await dollarValue.findOne({ _id: result[0]._id });
    updating.dollarValue = dollar;
    await updating.save();
    return {
      success: true,
      newDollar: updating,
    };
  } catch (e) {
    console.log(e);
    return "Error al actualizar el valor.";
  }
};

const updateBestSellers = async (bestSellers) => {
  try {
    let productsApplied = [];
    await Product.updateMany({ bestSeller: false });
    await bestSellers.map(async (prod) => {
      const prodv2 = await Product.findByIdAndUpdate(prod, {
        bestSeller: true,
      });
      productsApplied.push(prodv2);
    });
    return {
      products: productsApplied,
      success: true,
      message: "Productos actualizados exitosamente.",
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

const updateArtBestSellers = async (bestSellers) => {
  try {
    let artApplied = [];
    await Art.updateMany({ bestSeller: false });
    await bestSellers.map(async (art) => {
      const artv2 = await Art.findByIdAndUpdate(art, { bestSeller: true });
      artApplied.push(artv2);
    });
    return {
      arts: artApplied,
      success: true,
      message: "Artes actualizados exitosamente.",
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};
module.exports = {
  updateDollarValue,
  updateBestSellers,
  updateArtBestSellers,
};
