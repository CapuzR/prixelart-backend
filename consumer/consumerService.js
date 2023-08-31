const Consumer = require("./consumerModel");
const dotenv = require("dotenv");
dotenv.config();

const createConsumer = async (consumerData) => {
  try {
    const readedConsumer = await readConsumerById(consumerData._id);
    if (readedConsumer) {
      if (
        readedConsumer.active !== consumerData.active ||
        readedConsumer.consumerType !== consumerData.consumerType ||
        readedConsumer.firstname !== consumerData.firstname ||
        readedConsumer.lastname !== consumerData.lastname ||
        readedConsumer.username !== consumerData.username ||
        readedConsumer.ci !== consumerData.ci ||
        readedConsumer.phone !== consumerData.phone ||
        readedConsumer.email !== consumerData.email ||
        readedConsumer.address !== consumerData.address ||
        readedConsumer.billingAddress !== consumerData.billingAddress ||
        readedConsumer.shippingAddress !== consumerData.shippingAddress ||
        readedConsumer.birthdate !== consumerData.birthdate ||
        readedConsumer.instagram !== consumerData.instagram ||
        readedConsumer.facebook !== consumerData.facebook ||
        readedConsumer.twitter !== consumerData.twitter ||
        readedConsumer.nationalId !== consumerData.nationalId ||
        readedConsumer.gender !== consumerData.gender
      ) {
        await readedConsumer.set(consumerData);
        const updatedConsumer = await readedConsumer.save();

        if (updatedConsumer) {
          return {
            success: true,
            info: "Consumidor actualizado.",
            Consumer: updatedConsumer,
          };
        } else {
          return console.log("Consumer update error.");
        }
      } else
        return {
          success: true,
          Consumer: "Consumidor registrado.",
        };
    } else {
      let newConsumer = await new Consumer(consumerData).save();
      return {
        success: true,
        newConsumer: newConsumer,
      };
    }
  } catch (e) {
    console.log(e);
    return "Incapaz de crear el usuario, intenta de nuevo o consulta a soporte.";
  }
};

const readConsumerByEmail = async (consumerData) => {
  return await Consumer.findOne({ email: consumerData.email })
    .select("-_id")
    .exec();
};

const readConsumerById = async (id) => {
  return await Consumer.findOne({ _id: id }).exec();
};

const readConsumerByQuery = async (data) => {
  const firstname = data.query.split(" ")[0];
  const lastname = data.query.split(" ")[1];

  const result = await Consumer.find({
    $or: [
      { email: { $regex: data.query, $options: "i" } },
      { firstname: { $regex: firstname || data.query, $options: "i" } },
      { lastname: { $regex: lastname || data.query, $options: "i" } },
    ],
  }).exec();

  if (result) {
    return result;
  } else {
    return false;
  }
};
const readConsumerByUsername = async (username) => {
  return await Consumer.findOne({ username: username }).exec();
};

const readAllConsumers = async () => {
  let readedConsumer = await Consumer.find({}).exec();
  if (readedConsumer) {
    return readedConsumer;
  }
  return false;
};

const updateConsumer = async (consumerData) => {
  try {
    const toUpdateConsumer = await Consumer.findOne({
      email: consumerData.email,
    });
    await toUpdateConsumer.set(consumerData);
    const updatedConsumer = await toUpdateConsumer.save();
    if (!updatedConsumer) {
      return console.log("Consumer update error: " + err);
    }

    return updatedConsumer;
  } catch (e) {
    return {
      success: false,
      message:
        e +
        "Disculpa. No se pudo actualizar este consumidor, inténtalo de nuevo por favor.",
    };
  }
};

const deleteConsumer = async (id) => {
  try {
    await Consumer.findByIdAndDelete(id);
    return "Cliente eliminado exitosamente";
  } catch (error) {
    console.log(error);
    return error;
  }
};
module.exports = {
  createConsumer,
  readConsumerByEmail,
  readConsumerByQuery,
  readConsumerByUsername,
  readAllConsumers,
  updateConsumer,
  deleteConsumer,
};
