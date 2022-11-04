const artServices = require("./artServices");
const userControllers = require("../user/userControllers/userControllers");

//CRUD

const createArt = async (req, res, next) => {
  try {
    if (req.body.tags) req.body.tags = req.body.tags.split(",");
    res.send(await artServices.createArt(req.body));
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

const updateArt = async (req, res) => {
  try {
    const artData = {
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      tags: req.body.tags,
      artType: req.body.artType,
      artLocation: req.body.artLocation,
    };
    const artResult = await artServices.updateArt(req.params.id, artData);
    data = {
      data: {
        artResult,
        success: true,
      },
    };
    return res.send(artResult);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
    console.log(err);
  }
};
// const updateArt = async (req, res) => {
//   try {
//     const artData = {
//       artId: req.body.type,
//       title: req.body.title,
//       category: req.body.category,
//       description: req.body.description,
//       tags: req.body.tags,
//       imageUrl: req.body.imageUrl,
//       thumbnailUrl: req.body.thumbnailUrl,
//       largeThumbUrl: req.body.largeThumbUrl,
//       mediumThumbUrl: req.body.mediumThumbUrl,
//       smallThumbUrl: req.body.smallThumbUrl,
//       squareThumbUrl: req.body.squareThumbUrl,
//       userId: req.body.userId,
//       prixerUsername: req.body.prixerUsername,
//       status: req.body.status,
//       publicId: req.body.publicId,
//       artType: req.body.artType,
//       originalPhotoWidth: req.body.originalPhotoWidth,
//       originalPhotoHeight: req.body.originalPhotoHeight,
//       originalPhotoIso: req.body.originalPhotoIso,
//       originalPhotoPpi: req.body.originalPhotoPpi,
//       artLocation: req.body.artLocation,
//       crops: req.body.crops,
//     };
//     const updates = await artServices.updateArt(req.params.id, artData);
//     return res.send(updates);
//   } catch (err) {
//     console.log(err);
//     res.status(500).send(err);
//   }
// };

const readAllArts = async (req, res) => {
  try {
    const readedArts = await artServices.readAllArts();
    res.send(readedArts);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const readByQuery = async (req, res) => {
  try {
    const query = {
      text: req.query.text,
    };
    const readedArts = await artServices.readByQuery(query);
    res.send(readedArts);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const readByUsernameByQuery = async (req, res) => {
  try {
    req.body.username = req.query.username;
    const user = await userControllers.readUserByUsername(req);
    const query = {
      text: req.query.text,
    };
    const readedArts = await artServices.readByUserIdByQuery(user._id, query);
    res.send(readedArts);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const randomArts = async (req, res) => {
  try {
    const randomArts = await artServices.randomArts();
    res.send(randomArts);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const readAllByPrixerId = async (req, res) => {
  try {
    const readedArts = await artServices.readAllByUserId(req.body.userId);
    res.send(readedArts);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const readAllByUsername = async (req, res) => {
  try {
    const user = await userControllers.readUserByUsername(req);
    const readedArts = await artServices.readAllByUserId(user._id);
    res.send(readedArts);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const getOneById = async (req, res) => {
  try {
    const user = await userControllers.readUserByUsername(req);
    const readedArts = await artServices.getOneById(art.artId);
    res.send(readedArts);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const readOneById = async (req, res) => {
  try {
    const readedArt = await artServices.readOneById(req.body.id);
    res.send(readedArt);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

async function deleteArt(req, res) {
  try {
    const artResult = await artServices.deleteArt(req.params.id);
    data = {
      artResult,
      success: true,
    };
    return res.send(data);
  } catch (error) {
    console.log(err);
    res.status(500).send(err);
  }
}

const disableArt = async (req, res) => {
  try {
    const artResult = await artServices.disableArt(req.params.id, req.body);
    data = {
      data: {
        artResult,
        success: true,
      },
    };
    return res.send(artResult);
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
};

const rankArt = async (req, res) => {
  try {
    const artRankResult = await artServices.rankArt(req.params.id, req.body);
    data = {
      artRankResult,
      succes: true,
    };
    return res.send(artRankResult);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

module.exports = {
  createArt,
  readAllArts,
  readByUsernameByQuery,
  readByQuery,
  randomArts,
  updateArt,
  readAllByPrixerId,
  readAllByUsername,
  getOneById,
  readOneById,
  deleteArt,
  disableArt,
  rankArt,
};

// //CRUD END
