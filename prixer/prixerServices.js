const Prixer = require("./prixerModel");
const userService = require("../user/userServices/userServices");

//CRUD
const createPrixer = async (prixerData) => {
  prixerData.id = prixerData.userId;
  const isPrixer = await readPrixer(prixerData);
  try {
    if (isPrixer) {
      return {
        success: false,
        message: "Disculpa, este usuario ya está asignado a un Prixer",
      };
    } else {
      return {
        success: true,
        prixerData: await new Prixer(prixerData).save(),
      };
    }
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message:
        e +
        "Disculpa. No se pudo cargar tus datos de Prixer, inténtalo de nuevo por favor.",
    };
  }
};

const mergePrixerAndUser = (readedPrixer, readedUser) => {
  let prixer = {};

  prixer["prixerId"] = readedPrixer.id;
  prixer["username"] = readedUser.username;
  prixer["firstName"] = readedUser.firstName;
  prixer["lastName"] = readedUser.lastName;
  prixer["email"] = readedUser.email;
  prixer["specialtyArt"] = readedPrixer.specialtyArt;
  prixer["description"] = readedPrixer.description;
  prixer["instagram"] = readedPrixer.instagram;
  prixer["facebook"] = readedPrixer.facebook;
  prixer["twitter"] = readedPrixer.twitter;
  prixer["dateOfBirth"] = readedPrixer.dateOfBirth;
  prixer["phone"] = readedPrixer.phone;
  prixer["country"] = readedPrixer.country;
  prixer["city"] = readedPrixer.city;
  prixer["avatar"] = readedPrixer.avatar;
  prixer["status"] = readedPrixer.status;
  prixer["termsAgree"] = readedUser.termsAgree;

  return prixer;
};

const readPrixer = async (prixerData) => {
  //Este prixerData.id debería cambiarse por prixerData.userId. Hay que validar dónde está y cambiarlo (Incluyendo los tests).
  let readedPrixer = await Prixer.findOne({ userId: prixerData.id }).exec();
  if (readedPrixer) {
    const readedUser = await userService.readUserById({ id: prixerData.id });
    const prixer = await mergePrixerAndUser(readedPrixer, readedUser);
    return prixer;
  }

  return readedPrixer;
};

const readAllPrixers = async () => {
  try {
    const readedPrixers = await Prixer.find({ status: true }).exec();
    if (readedPrixers) {
      const data = {
        info: "Todos los Prixers disponibles",
        prixers: readedPrixers,
      };
      return data;
    } else {
      const data = {
        info: "No hay Prixers registrados",
        prixers: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const readAllPrixersFull = async () => {
  try {
    const readedPrixers = await Prixer.find({}).exec();
    let data = [];
    if (readedPrixers) {
      data = await Promise.all(
        readedPrixers.map(async (readedPrixer) => {
          const readedUser = await userService.readUserById({
            id: readedPrixer.userId,
          });
          if (readedUser) {
            const prixer = mergePrixerAndUser(readedPrixer, readedUser);
            return prixer;
          } else {
            return {
              info:
                "El Prixer " +
                readedPrixer.username +
                " no está asignado a un usuario.",
              prixers: null,
            };
          }
        })
      );
      const prixers = {
        info: "Prixers disponibles",
        prixers: data,
      };
      return prixers;
    } else {
      const data = {
        info: "No hay Prixers registrados",
        prixers: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const readAllPrixersFullv2 = async () => {
  try {
    const readedPrixers = await Prixer.find({ status: true }).exec();
    let data = [];
    if (readedPrixers) {
      data = await Promise.all(
        readedPrixers.map(async (readedPrixer) => {
          const readedUser = await userService.readUserById({
            id: readedPrixer.userId,
          });
          if (readedUser) {
            const prixer = mergePrixerAndUser(readedPrixer, readedUser);
            return prixer;
          } else {
            return {
              info:
                "El Prixer " +
                readedPrixer.username +
                " no está asignado a un usuario.",
              prixers: null,
            };
          }
        })
      );
      const prixers = {
        info: "Prixers disponibles",
        prixers: data,
      };
      return prixers;
    } else {
      const data = {
        info: "No hay Prixers registrados",
        prixers: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const updatePrixer = async (prixerData, userData) => {
  try {
    const toUpdatePrixer = await Prixer.findOne({ userId: userData.id });
    toUpdatePrixer.specialtyArt = prixerData.specialtyArt.split(",");
    toUpdatePrixer.facebook = prixerData.facebook;
    toUpdatePrixer.twitter = prixerData.twitter;
    toUpdatePrixer.dateOfBirth = prixerData.dateOfBirth;
    toUpdatePrixer.phone = prixerData.phone;
    toUpdatePrixer.country = prixerData.country;
    toUpdatePrixer.city = prixerData.city;
    toUpdatePrixer.username = prixerData.username;
    toUpdatePrixer.avatar = prixerData.avatar;
    toUpdatePrixer.description = prixerData.description;
    if (prixerData.specialty === "") toUpdatePrixer.specialty = [];
    const updatedPrixer = await toUpdatePrixer.save();
    if (!updatedPrixer) {
      return console.log("Prixer update error: " + err);
    }
    const updatedUser = await userService.updateUser(userData);
    const prixer = await mergePrixerAndUser(updatedPrixer, updatedUser);

    return prixer;
  } catch (e) {
    console.log(e);
    return e;
  }
};

const updateVisibility = async (prixerId, prixerData) => {
  try {
    const toUpdatePrixer = await Prixer.findOne({
      _id: prixerId,
    });
    toUpdatePrixer.status = prixerData.status;

    const updatedPrixer = await toUpdatePrixer.save();
    if (!updatedPrixer) {
      return console.log("Prixer update error: " + err);
    }
    return "Actualización realizada con éxito.";
  } catch (e) {
    console.log(e);
    return e;
  }
};

const disablePrixer = (prixerData) => {};

const removePrixers = async () => {
  const removedPrixers = await Prixer.deleteMany({});
  if (removedPrixers) {
    return "Se eliminaron: " + removedPrixers;
  } else {
    return removedPrixers;
  }
};
//CRUD END

module.exports = {
  createPrixer,
  readAllPrixers,
  readAllPrixersFullv2,
  readPrixer,
  updatePrixer,
  updateVisibility,
  disablePrixer,
  removePrixers,
  readAllPrixersFull,
};
