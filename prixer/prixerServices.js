const Prixer = require("./prixerModel")
const Organizations = require("../organizations/organizationModel")
const User = require("../user/userModel")
const userService = require("../user/userServices/userServices")
const accountServices = require("../account/accountServices")
const artServices = require("../art/artServices")
const serviceServices = require("../serviceOfPrixers/serviceServices")
const Art = require("../art/artModel")
const Service = require("../serviceOfPrixers/serviceModel")
const Consumer = require("../consumer/consumerModel")

//CRUD
const createPrixer = async (prixerData) => {
  prixerData.id = prixerData.userId
  const isPrixer = await readPrixer(prixerData)
  try {
    if (isPrixer) {
      return {
        success: false,
        message: "Disculpa, este usuario ya está asignado a un Prixer",
      }
    } else {
      return {
        success: true,
        prixerData: await new Prixer(prixerData).save(),
      }
    }
  } catch (e) {
    console.log(e)
    return {
      success: false,
      message:
        e +
        "Disculpa. No se pudo cargar tus datos de Prixer, inténtalo de nuevo por favor.",
    }
  }
}

const mergePrixerAndUser = (readedPrixer, readedUser) => {
  let prixer = {}

  prixer["prixerId"] = readedPrixer.id
  prixer["username"] = readedUser.username
  prixer["firstName"] = readedUser.firstName
  prixer["lastName"] = readedUser.lastName
  prixer["email"] = readedUser?.email
  prixer["specialtyArt"] = readedPrixer?.specialtyArt
  prixer["description"] = readedPrixer?.description
  prixer["instagram"] = readedPrixer?.instagram
  prixer["facebook"] = readedPrixer?.facebook
  prixer["twitter"] = readedPrixer?.twitter
  prixer["dateOfBirth"] = readedPrixer?.dateOfBirth
  prixer["phone"] = readedPrixer?.phone
  prixer["country"] = readedPrixer?.country
  prixer["city"] = readedPrixer?.city
  prixer["avatar"] = readedPrixer?.avatar
  prixer["status"] = readedPrixer?.status
  prixer["termsAgree"] = readedPrixer?.termsAgree
  prixer["account"] = readedUser?.account || undefined
  prixer["role"] = readedUser?.role

  return prixer
}

const readPrixer = async (prixerData) => {
  if (prixerData === null) {
    return null
  } else {
    let readedPrixer = await Prixer.findOne({
      username: prixerData.username,
    }).exec()
    if (readedPrixer) {
      const readedUser = await userService.readUserById({ id: prixerData._id })
      const prixer = await mergePrixerAndUser(readedPrixer, readedUser)
      return prixer
    }

    return readedPrixer
  }
}

const readPrixerbyId = async (user) => {
  let readedPrixer = await Prixer.findOne({ userId: user._id }).exec()
  if (readedPrixer) {
    const readedUser = await userService.readUserById({ id: user._id })
    const prixer = await mergePrixerAndUser(readedPrixer, readedUser)
    return prixer
  }

  return readedPrixer
}

const readBio = async (user) => {
  let readedPrixer = await Prixer.findOne({ userId: user._id }).exec()
  if (readedPrixer) {
    const data = readedPrixer.bio
    return { data: data, success: true }
  }
}

const readAllPrixers = async () => {
  try {
    const readedPrixers = await Prixer.find({ status: true }).exec()
    if (readedPrixers) {
      const data = {
        info: "Todos los Prixers disponibles",
        prixers: readedPrixers,
      }
      return data
    } else {
      const data = {
        info: "No hay Prixers registrados",
        prixers: null,
      }
      return data
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

const readAllPrixersFull = async () => {
  try {
    const readedPrixers = await Prixer.find({}).exec()
    let data = []
    if (readedPrixers) {
      data = await Promise.all(
        readedPrixers.map(async (readedPrixer) => {
          const readedUser = await userService.readUserById({
            id: readedPrixer.userId,
          })
          if (
            readedUser &&
            (readedUser.role === "Prixer" || readedUser.role === undefined)
          ) {
            const prixer = mergePrixerAndUser(readedPrixer, readedUser)
            return prixer
          }
        })
      )
      const filteredData = data.filter((element) => element !== undefined)
      const prixers = {
        info: "Prixers disponibles",
        prixers: filteredData,
      }
      return prixers
    } else {
      const data = {
        info: "No hay Prixers registrados",
        prixers: null,
      }
      return data
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

const readAllPrixersFullv2 = async () => {
  try {
    const readedPrixers = await Prixer.find({ status: true }).exec()
    let data = []
    if (readedPrixers) {
      data = await Promise.all(
        readedPrixers.map(async (readedPrixer) => {
          const readedUser = await userService.readUserById({
            id: readedPrixer.userId,
          })
          if (readedUser) {
            const prixer = mergePrixerAndUser(readedPrixer, readedUser)
            return prixer
          } else {
            return {
              info:
                "El Prixer " +
                readedPrixer.username +
                " no está asignado a un usuario.",
              prixers: null,
            }
          }
        })
      )
      const prixers = {
        info: "Prixers disponibles",
        prixers: data,
      }

      return prixers
    } else {
      const data = {
        info: "No hay Prixers registrados",
        prixers: null,
      }
      return data
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

const getOwnersAndPrixers = async () => {
  try {
    const readedOrgs = await Organizations.find({ status: true })
    const readedPrixers = await Prixer.find({ status: true })
    let users = []
    readedOrgs.map((org) => {
      users.push(org.username)
    })
    readedPrixers.map((prixer) => {
      users.push(prixer.username)
    })
    if (readedPrixers) {
      const data = {
        info: "Todos los Usuarios activos",
        users: users,
      }
      return data
    } else {
      const data = {
        info: "No hay Prixers registrados",
        prixers: null,
      }
      return data
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

const updatePrixer = async (prixerData, userData) => {
  try {
    const toUpdatePrixer = await Prixer.findOne({ userId: userData.id })
    toUpdatePrixer.specialtyArt = prixerData.specialtyArt.split(",")
    toUpdatePrixer.instagram = prixerData.instagram
    toUpdatePrixer.facebook = prixerData.facebook
    toUpdatePrixer.twitter = prixerData.twitter
    toUpdatePrixer.dateOfBirth = prixerData.dateOfBirth
    toUpdatePrixer.phone = prixerData.phone
    toUpdatePrixer.country = prixerData.country
    toUpdatePrixer.city = prixerData.city
    toUpdatePrixer.username = prixerData.username
    toUpdatePrixer.avatar = prixerData.avatar
    toUpdatePrixer.description = prixerData.description
    if (prixerData.specialty === "") toUpdatePrixer.specialty = []
    const updatedPrixer = await toUpdatePrixer.save()
    if (!updatedPrixer) {
      return console.log("Prixer update error: " + err)
    }
    const updatedUser = await userService.updateUser(userData)
    const prixer = mergePrixerAndUser(updatedPrixer, updatedUser)

    return prixer
  } catch (e) {
    console.log(e)
    return e
  }
}

const updateVisibility = async (prixerData) => {
  try {
    const toUpdatePrixer = await Prixer.findOne({
      _id: prixerData.id,
    })
    let unableArts, unableServices
    // if (prixerData.status === false && typeof prixerData.account === "string") {
    toUpdatePrixer.status = prixerData.status
    if (prixerData.status === false) {
      unableArts = await artServices.unableArts(toUpdatePrixer.username)

      unableServices = await serviceServices.unableServices(toUpdatePrixer.id)
    }
    // const deleteAccount = await accountServices.deleteAccount(
    //   prixerData.account
    // );
    // const updateUser = await User.findById(toUpdatePrixer.userId, {
    //   account: undefined,
    // });
    // const updatedPrixer = await toUpdatePrixer.save();
    // } else {
    const updatedPrixer = await toUpdatePrixer.save()
    return { updatedPrixer, unableArts, unableServices }
    // }
  } catch (e) {
    console.log(e)
    return e
  }
}

const updateBio = async (prixerId, prixerData) => {
  try {
    const toUpdatePrixer = await Prixer.findByIdAndUpdate(prixerId, {
      bio: prixerData,
    })
    if (!toUpdatePrixer) {
      return console.log("Prixer update error: " + err)
    } else
      return { success: true, message: "Actualización realizada con éxito." }
  } catch (e) {
    console.log(e)
    return e
  }
}

const updateTermsAgreeGeneral = async (prixerId, prixerData) => {
  try {
    const toUpdatePrixer = await Prixer.find({
      _id: prixerId,
    })
    toUpdatePrixer.termsAgree = prixerData

    const updatedPrixer = await toUpdatePrixer.save()
    if (!updatedPrixer) {
      return console.log("Prixer update error: " + err)
    }
    return "Actualización realizada con éxito."
  } catch (e) {
    console.log(e)
    return e
  }
}

const updateTermsAgree = async (prixerId, prixerData) => {
  try {
    const toUpdatePrixer = await Prixer.findOne({
      username: prixerId,
    })

    toUpdatePrixer.termsAgree = prixerData.termsAgree
    const updatedPrixer = await toUpdatePrixer.save()
    if (!updatedPrixer) {
      return console.log("Prixer update error: " + err)
    } else {
      return { success: true, message: "Actualización realizada con éxito." }
    }
  } catch (e) {
    console.log(e)
    return e
  }
}

const addRole = async (req, res) => {
  try {
    const updated = await User.updateMany({}, { role: "Prixer" })
    res.send({ role: "Prixer", prixers: updated })
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

const disablePrixer = (prixerData) => {}

const removePrixers = async () => {
  const removedPrixers = await Prixer.deleteMany({})
  if (removedPrixers) {
    return "Se eliminaron: " + removedPrixers
  } else {
    return removedPrixers
  }
}

const destroyPrixer = async (prixerId, username) => {
  const destroyUser = await User.findOneAndDelete({ username: username })
  const destroyPrixer = await Prixer.findOneAndDelete({ _id: prixerId })
  const destroyArts = await Art.deleteMany({ prixerUsername: username })
  const destroyServices = await Service.deleteMany({ prixerUsername: username })
  const destroyConsumer = await Consumer.deleteMany({ prixerId: prixerId })

  if (destroyPrixer && destroyUser) {
    return {
      message: `Prixer eliminado. Usuario eliminado. ${destroyArts.deletedCount} Artes eliminados. ${destroyServices.deletedCount} Servicios eliminados. Clientes con el prixerID eliminado`,
      user: destroyUser,
      prixer: destroyPrixer,
      arts: destroyArts,
      services: destroyServices,
      consumer: destroyConsumer
    }
  } else {
    return {
      message: "Algo salió mal, revisa los detalles.",
      user: destroyUser,
      prixer: destroyPrixer,
      arts: destroyArts,
      services: destroyServices,
      consumer: destroyConsumer
    }
  }
}

//CRUD END

module.exports = {
  createPrixer,
  readAllPrixers,
  readAllPrixersFullv2,
  readPrixer,
  readPrixerbyId,
  getOwnersAndPrixers,
  readBio,
  updatePrixer,
  updateBio,
  updateVisibility,
  updateTermsAgreeGeneral,
  updateTermsAgree,
  disablePrixer,
  removePrixers,
  destroyPrixer,
  readAllPrixersFull,
  addRole,
}
