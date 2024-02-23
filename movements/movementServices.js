const Movement = require("./movementModel");
const jwt = require("jsonwebtoken");
const Account = require("../account/accountModel");
const User = require("../user/userModel");

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
      let balance = Number(account.balance) - Number(movement.value);
      account.balance = balance;
      const updatedAccount = account.save();
      return updatedAccount;
    }
    return { success: true };
  } catch (error) {
    console.log(error);
    return error;
  }
};

const readByAccount = async (account) => {
  try {
    if (typeof account === "string" && account.length === 24) {
      const readedMovements = await Movement.find({ destinatary: account })
        .select("-createdBy")
        .exec();
      if (readedMovements) {
        const data = {
          info: "Todos los movimientos disponibles",
          movements: readedMovements,
        };
        return data;
      } else {
        const data = {
          info: "No hay movimientos registrados",
          movements: [],
        };
        return data;
      }
    } else {
      const data = {
        info: "No tienes una cuenta asignada aún.",
        movements: [],
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const readAllMovements = async () => {
  try {
    const readedMovements = await Movement.find();
    let d = [];
    if (readedMovements) {
      d = await Promise.all(
        readedMovements.map(async (mov) => {
          let name = await User.findOne({ account: mov.destinatary });
          if (mov.destinatary) {
            mov.destinatary = `${name?.firstName} ${name?.lastName}`;
            return mov;
          } else {
            mov.destinatary = undefined;
          }
          name = undefined;
        })
      );
      const data = {
        info: "Todos los movimientos disponibles",
        movements: readedMovements,
      };
      return data;
    } else {
      const data = {
        info: "No hay movimientos registrados",
        arts: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const readByOrderId = async (orderId) => {
  try {
    const readedMovements = await Movement.find();
    const readedMovement = readedMovements.find((mov) =>
      mov.description.includes(orderId)
    );
    return readedMovement;
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = {
  createMovement,
  updateBalance,
  readByAccount,
  readAllMovements,
  readByOrderId,
};
