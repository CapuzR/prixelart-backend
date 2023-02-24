const Consumer = require("./consumerModel");
const dotenv = require("dotenv");
dotenv.config();

const createConsumer = async (consumerData) => {
  try {
    // const readedConsumerByEmail = await readConsumerByEmail(consumerData);
    // const readedConsumerByUsername = await readConsumerByUsername(consumerData.username);
    // if(readedConsumerByUsername) {
    //     return {
    //         success: false,
    //         info: 'error_username',
    //         message: 'Disculpa, el nombre de usuario ya está registrado.'
    //     };
    // }

    // if(readedConsumerByEmail){
    //     return {
    //         success: false,
    //         info: 'error_email',
    //         message: 'Disculpa, el correo del usuario ya está registrado.'
    //     };
    // }
    // const salt = await bcrypt.genSalt(2);
    // const hash = await bcrypt.hash(adminData.password, salt);
    // adminData.password = hash;
    let newConsumer = await new Consumer(consumerData).save();
    return {
      res: { success: true, consumerId: newConsumer._id },
      newConsumer: newConsumer,
    };
  } catch (e) {
    return "Incapaz de crear el usuario, intenta de nuevo o consulta a soporte.";
  }
};

const readConsumerByEmail = async (consumerData) => {
  return await Consumer.findOne({ email: consumerData.email })
    .select("-_id")
    .exec();
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

module.exports = {
  createConsumer,
  readConsumerByEmail,
  readConsumerByQuery,
  readConsumerByUsername,
  readAllConsumers,
  updateConsumer,
};
