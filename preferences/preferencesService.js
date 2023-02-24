const { dollarValue } = require("./preferencesModel");

const updateDollarValue = async (dollar) => {
  try {
    // const result = await dollarValue.find();
    // if (result[0] !== undefined) {
    //   const updating = await dollarValue.findOne({ _id: result[0]._id });
    //   updating.dollarValue = dollar;
    //   await updating.save();
    //   return {
    //     success: true,
    //     newDollar: updating,
    //   };
    // } else {
    let newDollar = await new dollarValue({
      dollarValue: dollar,
    }).save();
    return {
      res: { success: true, dollarId: newDollar._id },
    };
    // }
  } catch (e) {
    console.log(e);
    return "Error al actualizar el valor.";
  }
};

module.exports = {
  updateDollarValue,
};
