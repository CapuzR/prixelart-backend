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

async function updateArt(req, res) {
  try {
    const art = req.body;
    const artResult = await artServices.updateArt(art);
    data = {
      data: {
        artResult,
        success: true,
      },
    };
    return res.send(data);
  } catch (err) {
    res.status(500).send(err);
  }
}

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

const readOneById = async (req, res) => {
  try {
    const readedArt = await artServices.readOneById(req.body._id);
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
  readOneById,
  deleteArt,
};

// //CRUD END
