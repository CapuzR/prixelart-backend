const surchargeServices = require("./surchargeServices")
const adminAuthServices = require("../admin/adminServices/adminAuthServices")

const createSurcharge = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.cookies.adminToken
    )
    if (checkPermissions.role.createDiscount) {
      const newSurcharge = {
        surchargeId: req.body.surchargeId,
        name: req.body.name,
        active: req.body.active,
        description: req.body.description,
        type: req.body.type,
        value: req.body.value,
        appliedProducts: req.body.appliedProducts,
        appliedUsers: req.body.appliedUsers,
        appliedPercentage: req.body.appliedPercentage,
        considerations: req.body.considerations,
      }
      res.send(await surchargeServices.createSurcharge(newSurcharge))
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      })
    }
  } catch (err) {
    res.status(500).send(err)
  }
}

const updateSurcharge = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.cookies.adminToken
    )
    if (checkPermissions.role.createDiscount) {
      const updatedSurcharge = await surchargeServices.updateSurcharge(
        req.body._id,
        req.body
      )
      res.send(updatedSurcharge)
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      })
    }
  } catch (err) {
    res.status(500).send(err)
  }
}

const readAllSurcharge = async (req, res) => {
  try {
    const readedSurcharges = await surchargeServices.readAllSurcharge()
    res.send(readedSurcharges)
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

const readActiveSurcharge = async (req, res) => {
  try {
    const readedSurcharges = await surchargeServices.readActiveSurcharge()
    res.send(readedSurcharges)
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

const deleteSurcharge = async (req, res) => {
  let checkPermissions = await adminAuthServices.checkPermissions(
    req.cookies.adminToken
  )
  if (checkPermissions.role.deleteDiscount) {
    const surchargeResult = await surchargeServices.deleteSurcharge(req)
    data = {
      surchargeResult,
      success: true,
    }
    return res.send(data)
  } else {
    return res.send({
      success: false,
      message: "No tienes autorización para realizar esta acción.",
    })
  }
}
module.exports = {
  createSurcharge,
  updateSurcharge,
  readAllSurcharge,
  readActiveSurcharge,
  deleteSurcharge,
}
