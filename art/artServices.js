const Art = require("./artModel");
const insensitives = require("../utils/insensitives");
const { organizeArtData } = require("../utils/util");
const ObjectId = require("mongoose").Types.ObjectId;

//CRUD
const createArt = async (artData) => {
  const isArt = false;
  try {
    if (isArt) {
      return {
        success: false,
        message: "Disculpa, este arte ya fue creado.",
      };
    } else {
      const newArt = await new Art(organizeArtData(artData)).save();
      if (newArt) {
        return {
          success: true,
          artData: null,
        };
      } else {
        return {
          success: false,
          message:
            "Disculpa, ocurrió un error desconocido, inténtalo de nuevo.",
        };
      }
    }
  } catch (e) {
    return {
      success: false,
      message:
        e +
        "Disculpa. No se pudo cargar tu arte, inténtalo de nuevo por favor.",
    };
  }
};

const readOneById = async (artSystemId) => {
  try {
    const readedArt = await Art.findOne({ _id: artSystemId })
      .select("-_id -__v -imageUrl")
      .exec();
    if (readedArt) {
      const data = {
        info: "Yei. Enjoy",
        arts: readedArt,
      };

      return data;
    } else {
      const data = {
        info: "Interesante, este arte no existe. Por favor inténtalo de nuevo.",
        arts: null,
      };
      return data;
    }
  } catch (e) {
    console.log(error);
    return error;
  }
};

const randomArts = async () => {
  try {
    const docCount = await Art.estimatedDocumentCount();
    var random = Math.floor(Math.random() * docCount);
    const readedArts = await Art.findOne().skip(random).exec();
    if (readedArts) {
      const data = {
        info: "Sorpresa...",
        arts: readedArts,
      };

      return data;
    } else {
      const data = {
        info: "No hay artes registrados",
        arts: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const readByUserIdByQuery = async (userId, query) => {
  try {
    const text = query.text;
    const readedArts = await Art.find({
      $and: [
        {
          userId: userId,
        },
        {
          $or: [
            { title: { $regex: text, $options: "i" } },
            { description: { $regex: text, $options: "i" } },
            { tags: { $regex: text, $options: "i" } },
          ],
        },
      ],
    })
      .select("-_id -__v -imageUrl -crops -status")
      .exec();
    if (readedArts) {
      const data = {
        info: "Todos los artes del Prixer disponibles",
        arts: readedArts,
      };
      return data;
    } else {
      const data = {
        info: "No hay artes registrados",
        arts: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const readAllArts = async () => {
  try {
    const readedArts = await Art.find({})
      .select("-_id -__v -imageUrl -crops -status")
      .exec();
    if (readedArts) {
      const data = {
        info: "Todos los artes disponibles",
        arts: readedArts,
      };
      return data;
    } else {
      const data = {
        info: "No hay artes registrados",
        arts: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return {
      info: "Transcurrió demasiado tiempo, inténtalo de nuevo",
      arts: null,
    };
  }
};

const readByQuery = async (query) => {
  try {
    const text = query.text;
    const readedArts = await Art.find({
      $or: [
        { title: { $regex: text, $options: "i" } },
        { description: { $regex: text, $options: "i" } },
        { tags: { $regex: text, $options: "i" } },
        { artId: { $regex: text, $options: "i" } },
      ],
    })
      .select("-_id -__v -imageUrl -crops -status")
      .exec();
    if (readedArts) {
      const data = {
        info: "Todos los artes disponibles",
        arts: readedArts,
      };
      return data;
    } else {
      const data = {
        info: "No hay artes registrados",
        arts: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const readAllByUserId = async (userId) => {
  try {
    const readedArts = await Art.find({ userId: userId })
      .select("-_id -__v -imageUrl -crops -status")
      .exec();
    if (readedArts) {
      const data = {
        info: "El Prixer sí tiene artes registrados",
        arts: readedArts,
      };

      return data;
    } else {
      const data = {
        info: "El Prixer no tiene artes registrados",
        arts: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getOneById = async (artId) => {
  try {
    const readedArts = await Art.find({ artId: artId })
      .select("-_id -__v -imageUrl -crops -status")
      .exec();
    if (readedArts) {
      const data = {
        info: "Arte encontrado",
        arts: readedArts,
      };

      return data;
    } else {
      const data = {
        info: "El arte especificado no existe",
        arts: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const updateArt = async (artId, artData) => {
  try {
    const toUpdateArt = await Art.findOne({ artId });
    // toUpdateArt.set(art);
    // const toUpdateArt = await Art.findByIdAndUpdate(artId);
    // toUpdateArt.artId = artData.artId;
    toUpdateArt.title = artData.title;
    toUpdateArt.category = artData.category;
    toUpdateArt.description = artData.description;
    toUpdateArt.tags = artData.tags;
    toUpdateArt.artType = artData.artType;
    toUpdateArt.artLocation = artData.artLocation;
    // toUpdateArt.imageUrl = artData.imageUrl;
    // toUpdateArt.thumbnailUrl = artData.thumbnail;
    // toUpdateArt.largeThumbUrl = artData.largeThumbUrl;
    // toUpdateArt.mediumThumbUrl = artData.mediumThumbUrl;
    // toUpdateArt.smallThumbUrl = artData.smallThumbUrl;
    // toUpdateArt.squareThumbUrl = artData.squareThumbUrl;
    // toUpdateArt.userId = artData.userId;
    // toUpdateArt.prixerUsername = artData.prixerUsername;
    // toUpdateArt.status = artData.status;
    // toUpdateArt.publicId = artData.publicId;
    // toUpdateArt.originalPhotoWidth = originalPhotoWidth;
    // toUpdateArt.originalPhotoHeight = originalPhotoHeight;
    // toUpdateArt.originalPhotoIso = originalPhotoIso;
    // toUpdateArt.originalPhotoPpi = originalPhotoPpi;
    // toUpdateArt.crops = crops;

    const updatedArt = await toUpdateArt.save();
    if (!updatedArt) {
      return console.log("Art update error: " + err);
    }
    return "Actualización realizada con éxito.";
  } catch (error) {
    console.log(error);
    return error;
  }
};

const disableArt = async (artId, artData) => {
  try {
    const toUpdateArt = await Art.findOne({ artId });

    toUpdateArt.disabledReason = artData.disabledReason;
    toUpdateArt.visible = artData.visible;

    const updatedArt = await toUpdateArt.save();
    if (!updatedArt) {
      return console.log("Art update error: " + err);
    }
    return "Actualización realizada con éxito.";
  } catch (error) {
    console.log(error);
    return error;
  }
};

const deleteArt = async (artId) => {
  try {
    await Art.findOneAndDelete({ artId: artId });
    return "Arte eliminado exitosamente";
  } catch (error) {
    console.log(error);
    return error;
  }
};

const removeArt = async () => {
  // const removedPrixers = await Prixer.deleteMany({});
  // if(removedPrixers) {
  //     return 'Se eliminaron: ' + removedPrixers;
  // } else {
  //     return removedPrixers;
  // }
};
//CRUD END

module.exports = {
  createArt,
  readByUserIdByQuery,
  readAllArts,
  readByQuery,
  randomArts,
  readAllByUserId,
  getOneById,
  readOneById,
  updateArt,
  disableArt,
  deleteArt,
  removeArt,
};
