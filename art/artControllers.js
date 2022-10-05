const artServices = require("./artServices");
const userControllers = require("../user/userControllers/userControllers");

//CRUD

const createArt = async (req, res, next) => {
  try {
    res.send(await artServices.createArt(req.body));
  } catch (e) {
    res.status(500).send(e);
  }
};

const updateArt = async (req, res) => {
  try {
    const artData = {
      artId: req.body.type,
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      tags: req.body.tags,
      imageUrl: req.body.imageUrl,
      thumbnailUrl: req.body.thumbnailUrl,
      largeThumbUrl: req.body.largeThumbUrl,
      mediumThumbUrl: req.body.mediumThumbUrl,
      smallThumbUrl: req.body.smallThumbUrl,
      squareThumbUrl: req.body.squareThumbUrl,
      userId: req.body.userId,
      prixerUsername: req.body.prixerUsername,
      status: req.body.status,
      publicId: req.body.publicId,
      artType: req.body.artType,
      originalPhotoWidth: req.body.originalPhotoWidth,
      originalPhotoHeight: req.body.originalPhotoHeight,
      originalPhotoIso: req.body.originalPhotoIso,
      originalPhotoPpi: req.body.originalPhotoPpi,
      artLocation: req.body.artLocation,
      crops: req.body.crops,
    };
    const updates = await artServices.updateArt(req.params.id, artData);
    return res.send(updates);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const readAllArts = async (req, res) => {
  try {
    const readedArts = await artServices.readAllArts();
    res.send(readedArts);
  } catch (err) {
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
    res.status(500).send(err);
  }
};

const randomArts = async (req, res) => {
  try {
    const randomArts = await artServices.randomArts();
    res.send(randomArts);
  } catch (err) {
    res.status(500).send(err);
  }
};

const readAllByPrixerId = async (req, res) => {
  try {
    const readedArts = await artServices.readAllByUserId(req.body.userId);
    res.send(readedArts);
  } catch (err) {
    res.status(500).send(err);
  }
};

const readAllByUsername = async (req, res) => {
  try {
    const user = await userControllers.readUserByUsername(req);
    const readedArts = await artServices.readAllByUserId(user._id);
    res.send(readedArts);
  } catch (err) {
    res.status(500).send(err);
  }
};

const getOneById = async (req, res) => {
  try {
    const user = await userControllers.readUserByUsername(req);
    const readedArts = await artServices.getOneById(art.artId);
    res.send(readedArts);
  } catch (err) {
    res.status(500).send(err);
  }
};

const readOneById = async (req, res) => {
  try {
    const readedArt = await artServices.readOneById(req.body.id);
    res.send(readedArt);
  } catch (err) {
    res.status(500).send(err);
  }
};

// const deleteArt = async (req, res) => {
//   try {
//     const readedArt = await artServices.deleteArt(req.artId);
//     res.send(readedArt);
//   } catch (error) {
//     res.status(500).send(err);
//   }
// };

async function deleteArt(req, res) {
  try {
    const artResult = await artServices.deleteArt(req.params.id);
    data = {
      artResult,
      success: true,
    };
    return res.send(data);
  } catch (error) {
    res.status(500).send(err);
  }
}

// const deleteArt = async (req, res) => {
//   try {
//     const artResult = await artServices.deleteArt(req.params.id);
//     data = {
//       artResult,
//       success: true,
//     };
//   } catch (error) {
//     res.status(500).send(err);
//   }

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
};

// //CRUD END
