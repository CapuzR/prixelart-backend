const { dollarValue } = require("./preferencesModel");
const Product = require("../product/productModel");

const updateDollarValue = async (dollar) => {
  try {
    const result = await dollarValue.find();
    // if (result[0] !== undefined) {
    const updating = await dollarValue.findOne({ _id: result[0]._id });
    updating.dollarValue = dollar;
    await updating.save();
    return {
      success: true,
      newDollar: updating,
    };
    // } else {
    // let newDollar = await new dollarValue({
    //   dollarValue: dollar,
    // }).save();
    // return {
    //   res: { success: true, dollarId: newDollar._id },
    // };
    // }
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
module.exports = {
  updateDollarValue,
  updateBestSellers,
};
