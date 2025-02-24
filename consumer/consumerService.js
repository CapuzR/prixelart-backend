const Consumer = require("./consumerModel");
const dotenv = require("dotenv");
dotenv.config();

const createConsumer = async (consumerData) => {
  try {
    const readedConsumer = await readConsumerById(consumerData._id);
    if (readedConsumer) {
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
  const readedConsumer = await Consumer.findOne({ email: consumerData })
    .select("-_id")
    .exec();
  if (readedConsumer) {
    return { success: true, consumer: readedConsumer };
  } else {
    return { success: false };
  }
};

const readConsumerById = async (id) => {
  const readedConsumer = await Consumer.findOne({ _id: id }).exec();
  if (readedConsumer) {
    return readedConsumer;
  } else return false;
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
  let Cv2 = readedConsumer.sort(function (a, b) {
    if (a.firstname.toLowerCase() > b.firstname.toLowerCase()) {
      return 1;
    }
    if (a.firstname.toLowerCase() < b.firstname.toLowerCase()) {
      return -1;
    }
    return 0;
  });
  if (readedConsumer) {
    return Cv2;
  }
  return false;
};

const readConsumersPrixers = async () => {
  let readedConsumer = await Consumer.find({ consumerType: "Prixer" }).exec();
  let Cv2 = readedConsumer.sort(function (a, b) {
    if (a.firstname.toLowerCase() > b.firstname.toLowerCase()) {
      return 1;
    }
    if (a.firstname.toLowerCase() < b.firstname.toLowerCase()) {
      return -1;
    }
    return 0;
  });
  if (readedConsumer) {
    return Cv2;
  }
  return false;
};

const updateConsumer = async (consumerData) => {
  try {
    const toUpdateConsumer = await Consumer.findOne({
      _id: consumerData._id,
    });
    await toUpdateConsumer.set(consumerData);
    const updatedConsumer = await toUpdateConsumer.save();
    if (!updatedConsumer) {
      return console.log("Consumer update error: " + err);
    }

    return updatedConsumer;
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message:
        e +
        " .Disculpa. No se pudo actualizar este consumidor, inténtalo de nuevo por favor.",
    };
  }
};

const deleteConsumer = async (consumer) => {
  try {
    // if (consumer._id && consumer._id.length < 9) {
      await Consumer.findOneAndDelete({ _id: consumer });
    // } else {
    //   await Consumer.deleteOne({ phone: consumer.phone });
    // }
    return "Cliente eliminado exitosamente";
  } catch (error) {
    console.log(error);
    return error;
  }
};
module.exports = {
  createConsumer,
  readConsumerById,
  readConsumerByEmail,
  readConsumerByQuery,
  readConsumerByUsername,
  readAllConsumers,
  readConsumersPrixers,
  updateConsumer,
  deleteConsumer,
};
