const Art = require("./artModel");
const { organizeArtData } = require("../utils/util");
const ObjectId = require("mongoose").Types.ObjectId;
const accents = require("remove-accents");
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
      // .sort({ points: -1, visible: -1 })
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
    const readedArts = await Art.findOne()
      .sort({ points: -1, visible: -1 })
      .exec();
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
    const text = accents.remove(query.text).toLowerCase();
    const readedArts = await Art.find({ userId: userId })
      .select("-_id -__v -imageUrl -crops -status")
      .exec();
    const filterArts = readedArts.filter((art, index) => {
      const artTitle = accents.remove(art.title).toLowerCase();
      const artDescription = accents.remove(art.description).toLowerCase();
      const artTags = accents.remove(art.tags).toLowerCase();
      const artCategory = accents.remove(art.category).toLowerCase();
      return (
        artTitle.includes(text) ||
        artDescription.includes(text) ||
        artCategory.includes(text) ||
        artTags.includes(text)
      );
    });
    if (filterArts) {
      const data = {
        info: "Todos los artes del Prixer disponibles",
        arts: filterArts,
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
      .sort({ points: -1, visible: -1 })
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

const readByQueryAndCategory = async (query) => {
  try {
    const text = accents.remove(query.text).toLowerCase();
    const category = query.category;
    const readedArts = await Art.find({ category: category })
      .select("-_id -__v -imageUrl -crops -status")
      .exec();
    const filterArts = readedArts.filter((art, index) => {
      const artTitle = accents.remove(art.title).toLowerCase();
      const artDescription = accents.remove(art.description).toLowerCase();
      const artCategory = accents.remove(art.category).toLowerCase();
      return (
        artTitle.includes(text) ||
        artDescription.includes(text) ||
        artCategory.includes(text)
      );
    });

    if (filterArts) {
      const data = {
        info: "Todos los artes disponibles",
        arts: filterArts,
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

const readByQuery = async (query) => {
  try {
    const text = accents.remove(query.text).toLowerCase();
    const readedArts = await Art.find({})
      .select("-_id -__v -imageUrl -crops -status")
      .exec();
    const filterArts = readedArts.filter((art, index) => {
      const artTitle = accents.remove(art.title).toLowerCase();
      const artDescription = accents.remove(art.description).toLowerCase();
      const artCategory = accents.remove(art.category).toLowerCase();
      return (
        artTitle.includes(text) ||
        artDescription.includes(text) ||
        artCategory.includes(text)
      );
    });

    if (filterArts) {
      const data = {
        info: "Todos los artes disponibles",
        arts: filterArts,
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

const readByCategory = async (query) => {
  try {
    const category = query.category;
    const readedArts = await Art.find({ category: category })
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

const readAllByUserIdV2 = async (username) => {
  try {
    const readedArts = await Art.find({ prixerUsername: username })
      .select("-_id -__v -imageUrl -crops -status")
      .exec();
    if (readedArts) {
      const data = {
        info: "El Prixer sí tiene artes registrados",
        arts: readedArts,
        username: username,
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
      // .sort({ points: -1, visible: -1 })
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

const rankArt = async (artId, artData) => {
  try {
    const fromRank = await Art.findOne({ artId });

    fromRank.points = parseInt(artData.points);

    const artRankUpdated = await fromRank.save();

    if (!artRankUpdated) {
      return "Art update error";
    }
    return "Actualización realizada con éxito";
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
  readByQueryAndCategory,
  readByQuery,
  readByCategory,
  randomArts,
  readAllByUserId,
  readAllByUserIdV2,
  getOneById,
  readOneById,
  updateArt,
  disableArt,
  deleteArt,
  removeArt,
  rankArt,
};
