const Movement = require("./movementModel");
const jwt = require("jsonwebtoken");
const Account = require("../account/accountModel");
// const Product = require("../product/productModel");

const createMovement = (movementData) => {
  try {
    const newMovement = new Movement(movementData).save();
    return {
      success: true,
      newMovement: newMovement,
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

const updateBalance = async (movement) => {
  try {
    const account = await Account.findOne({ _id: movement.destinatary });
    if (movement.type === "Depósito") {
      let balance = Number(account.balance) + Number(movement.value);
      account.balance = balance;
      const updatedAccount = account.save();
      return updatedAccount;
    } else if (movement.type === "Retiro") {
      let balance = account.balance - movement.value;
      account.balance = balance;
      const updatedAccount = account.save();
      return updatedAccount;
    }
    return prixer;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const appliedProducts = async (products, id) => {
  let productsApplied = [];
  const allProducts = await Product.find();
  allProducts.map(async (product) => {
    if (product.discount === id) {
      const filter = { name: product.name };
      const update = { discount: undefined };
      await Product.findOneAndUpdate(filter, update);
    }
  });
  await products.map(async (product) => {
    const filter = { name: product };
    const update = { discount: id };

    const readedProduct = await Product.findOneAndUpdate(filter, update, {
      returnOriginal: false,
    });
    productsApplied.push(readedProduct);
  });
  return productsApplied;
};

const readByAccount = async (account) => {
  try {
    const readedMovements = await Movement.find({ destinatary: account });
    if (readedMovements) {
      const data = {
        info: "Todos los movimientos disponibles",
        movements: readedMovements,
      };
      return data;
    } else {
      const data = {
        info: "No hay movimientos registrados",
        movements: null,
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

module.exports = {
  createMovement,
  updateBalance,
  readByAccount,
};
