const artServices = require("./artServices")
const userControllers = require("../user/userControllers/userControllers")
const adminAuthServices = require("../admin/adminServices/adminAuthServices")
const orderServices = require("../order/orderService")
const Art = require("./artModel")

const createArt = async (req, res) => {
  try {
    if (req.body.tags) {
      req.body.tags = req.body.tags.split(",")
    }
    const createdArt = await artServices.createArt(req.body)
    res.send(createdArt)
  } catch (e) {
    console.log(e)
    res.status(500).send(e)
  }
}

const updateArt = async (req, res) => {
  try {
    const artData = {
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      tags: req.body.tags,
      artType: req.body.artType,
      artLocation: req.body.artLocation,
      exclusive: req.body.exclusive,
      comission: req.body.comission,
    }
    const artResult = await artServices.updateArt(req.params.id, artData)
    data = {
      data: {
        artResult,
        success: true,
      },
    }
    return res.send(artResult)
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

const readAllArts = async (req, res) => {
  try {
    const readedArts = await artServices.readAllArts()
    res.send(readedArts)
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

const readAllArtsv2 = async (req, res) => {
  try {
    const readedArts = await artServices.readAllArtsv2()
    res.send(readedArts)
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

const readLatest = async (req, res) => {
  try {
    const readedArts = await artServices.readLatest()
    res.send(readedArts)
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

const readByQuery = async (req, res) => {
  try {
    const query = {
      text: req.query.text,
    }
    // MODIFIER
    if (query.text === "addOwner") {
      const arts = await Art.find({})
      const updated = arts.map((art) => {
        art.owner = art.prixerUsername
        art.save()
        return art
      })

      res.send({ arts: updated, info: "Artes actualizados" })
    } else {
      const readedArts = await artServices.readByQuery(query)
      res.send(readedArts)
    }
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

const readByCategory = async (req, res) => {
  try {
    const category = {
      category: req.query.category,
    }
    const readedArts = await artServices.readByCategory(category)
    res.send(readedArts)
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

const readByQueryAndCategory = async (req, res) => {
  try {
    const query = {
      text: req.query.text,
      category: req.query.category,
    }
    const readedArts = await artServices.readByQueryAndCategory(query)
    res.send(readedArts)
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

const readByUsernameQueryAndCategory = async (req, res) => {
  try {
    const user = req.query.username
    const query = {
      text: req.query.text,
      category: req.query.category,
    }
    const readedArts = await artServices.readByUserIdQueryAndCategory(
      user,
      query
    )
    res.send(readedArts)
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}
const readByUsernameAndCategory = async (req, res) => {
  try {
    const user = req.query.username
    const query = req.query.category
    const readedArts = await artServices.readByUserIdAndCategory(user, query)
    res.send(readedArts)
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}
const readByUsernameAndQuery = async (req, res) => {
  try {
    const user = req.query.username
    const query = req.query.text
    const readedArts = await artServices.readByUserIdByQuery(user, query)
    res.send(readedArts)
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

const randomArts = async (req, res) => {
  try {
    const randomArts = await artServices.randomArts()
    res.send(randomArts)
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

const readAllByPrixerId = async (req, res) => {
  try {
    const readedArts = await artServices.readAllByUserId(req.body.userId)
    res.send(readedArts)
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

const readAllByUsername = async (req, res) => {
  try {
    const user = await userControllers.readUserByUsername(req.body.username)
    if (user) {
      const readedArts = await artServices.readAllByUserId(user._id)
      res.send(readedArts)
    }
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

const getOneById = async (req, res) => {
  try {
    const user = await userControllers.readUserByUsername(req)
    const readedArts = await artServices.getOneById(art.artId)
    res.send(readedArts)
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

const readOneById = async (req, res) => {
  try {
    const readedArt = await artServices.readOneById(req.body._id)
    res.send(readedArt)
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

async function deleteArt(req, res) {
  try {
    const artResult = await artServices.deleteArt(req.params.id)
    data = {
      artResult,
      success: true,
    }
    return res.send(data)
  } catch (error) {
    console.log(err)
    res.status(500).send(err)
  }
}

const disableArt = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    )
    if (checkPermissions.role.artBan) {
      const artResult = await artServices.disableArt(req.params.id, req.body)
      data = {
        data: {
          artResult,
          success: true,
        },
      }
      return res.send(artResult)
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      })
    }
  } catch (err) {
    res.status(500).send(err)
    console.log(err)
  }
}

const rankArt = async (req, res) => {
  try {
    const artRankResult = await artServices.rankArt(req.params.id, req.body)
    data = {
      artRankResult,
      succes: true,
    }
    return res.send(artRankResult)
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

const readBestSellers = async (req, res) => {
  try {
    const allOrders = await orderServices.readAllOrders()
    const getBestSellers = await artServices.getBestSellers(allOrders)
    res.send(getBestSellers)
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}
const readUrl = async (req, res) => {
  try {
    const readedImg = await artServices.searchUrl(req.params.imageId)
    if (readedImg) {
      res.setHeader("Content-Type", "image/jpeg")
      res.send(readedImg)
    } else {
      res.status(404).send("Imagen no encontrada")
    }
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

module.exports = {
  createArt,
  deleteArt,
  disableArt,
  getOneById,
  randomArts,
  rankArt,
  readAllArts,
  readAllArtsv2,
  readAllByPrixerId,
  readAllByUsername,
  readBestSellers,
  readByCategory,
  readByQuery,
  readByQueryAndCategory,
  readByUsernameAndCategory,
  readByUsernameAndQuery,
  readByUsernameQueryAndCategory,
  readLatest,
  readOneById,
  readUrl,
  updateArt,
}

// //CRUD END
