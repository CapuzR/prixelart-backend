const Users = require("../userModel")
const Admin = require("../../admin/adminModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const userServices = require("./userServices")
const prixerServices = require("../../prixer/prixerServices")
const orgServices = require("../../organizations/organizationServices")
const emailSender = require("../../utils/emailSender")
const dotenv = require("dotenv")

dotenv.config()

const authenticate = async (userData) => {
  const user = await userServices.readUserByEmail({
    email: userData.email,
  })
  let org, prixer
  if (user?.role === "Organization") {
    org = await orgServices.readOrgbyId({ _id: user._id })
  } else {
    prixer = await prixerServices.readPrixerbyId({ _id: user._id })
  }
  if (user && (prixer || org)) {
    if (!bcrypt.compareSync(userData.password, user.password)) {
      return {
        success: false,
        token: null,
        userId: null,
        error_info: "error_pw",
        error_message: "Inténtalo de nuevo, contraseña incorrecta.",
      }
    } else {
      const payload = {
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        id: user.id,
        account: user.account,
        role: user.role,
        time: new Date(),
      }

      if (user.role === "Organization") {
        payload.orgId = org?.orgId
      } else {
        payload.prixerId = prixer?.prixerId
      }

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.TOKEN_EXPIRE_TIME,
      })

      return {
        success: true,
        token: token,
        username: user.username,
        userId: user.id,
        error_info: null,
        error_message: null,
      }
    }
  } else {
    return {
      success: false,
      token: null,
      userId: null,
      error_info: "error_email",
      error_message:
        "No se encuentra el email, por favor regístrate para formar parte de la #ExperienciaPrixelart",
    }
  }
}

const generateToken = (user) => {
  try {
    const payload = {
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: user.password,
      id: user.id,
      time: new Date(),
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.TOKEN_EXPIRE_TIME,
    })

    return token
  } catch (err) {
    resizeBy.status(400).json({ error: err })
  }
}

const forgotPassword = async (email) => {
  try {
    const user = await userServices.readUserByEmailNotExec({ email: email })
    if (!user) {
      return {
        error: "Este usuario no existe, inténtalo de nuevo.",
      }
    }

    const token = jwt.sign({ _id: user._id }, process.env.RESET_PASSWORD_KEY, {
      expiresIn: "15m",
    })

    const templates = {
      "forgot-password": "d-319b1f51b2424604b5e4951473205496",
    }
    const message = {
      to: user.email,
      from: {
        email: "prixers@prixelart.com",
        name: "Prixelart",
      },
      templateId: templates["forgot-password"],
      dynamic_template_data: {
        recoveryUrl: process.env.FRONT_END_URL + "/recuperar/" + token,
      },
    }

    user.token = token

    const result = await userServices.simpleUserUpdate(user)
    if (!result.success) {
      return {
        success: false,
        info: "No se pudo enviar el correo de recuperación, por favor refresca e inténtalo de nuevo.",
      }
    }

    const mail = await emailSender.sendEmail(message)
    if (mail.success === false) {
      return await emailSender.sendEmail(message)
    } else return mail
  } catch (e) {
    console.log(e)
    res.status(500).send(e)
  }
}

const resetPassword = async (token, newPassword) => {
  try {
    const user = await userServices.readUserByResetToken({ token: token })

    if (!user) {
      return {
        success: false,
        info: "Token inválido, por favor cambia tu contraseña en prixelart.com/olvido-contraseña",
      }
    }

    user.token = ""

    const result = await userServices.resetPassword(newPassword, user)
    return result
  } catch (e) {
    res.status(500).send(e)
  }
}

const resetByAdmin = async (id, newPassword) => {
  try {
    const admin = await Admin.findOne({ _id: id })
    const salt = await bcrypt.genSalt(2)
    const hash = await bcrypt.hash(newPassword, salt)
    admin.password = hash
    const updatedAdmin = await admin.save()
    if (updatedAdmin) {
      return {
        success: true,
        info: "Contraseña modificada correctamente.",
      }
    } else {
      return {
        success: false,
        info: "No pudimos actualizar tu contraseña, por favor inténtalo de nuevo.",
      }
    }
  } catch (error) {
    res.status(500).send(error)
    console.log(error)
  }
}

const checkPasswordToken = async (token) => {
  try {
    return jwt.verify(
      token,
      process.env.RESET_PASSWORD_KEY,
      (err, verifiedToken) => {
        if (!verifiedToken) {
          return {
            success: false,
            info: "Token inválido, por favor cambia tu contraseña en prixelart.com/olvido-contraseña",
          }
        } else {
          return {
            success: true,
            info: "Token válido.",
          }
        }
      }
    )
  } catch (e) {
    res.status(500).send(e)
  }
}

module.exports = {
  authenticate,
  generateToken,
  forgotPassword,
  checkPasswordToken,
  resetPassword,
  resetByAdmin,
}
