const Admin = require("../adminModel");
const adminRole = require("../adminRoleModel");

// Admin CRUD

const readAdminById = async (adminData) => {
  let readedAdmin = await Admin.findOne({ _id: adminData.id }).exec();
  if (readedAdmin) {
    return readedAdmin;
  }
  return false;
};

const readSellers = async () => {
  let readedSellers = await Admin.find({ isSeller: true })
    .select("firstname lastname")
    .exec();
    readedSellers = readedSellers.map(seller => `${seller.firstname} ${seller.lastname}`);
  if (readedSellers) {
    return readedSellers;
  }
  return false;
};

const readAllAdmins = async () => {
  let readedAdmin = await Admin.find({}).select("-_id, -password").exec();
  if (readedAdmin) {
    return readedAdmin;
  }
  return false;
};

const readFullAdminByEmail = async (adminData) => {
  return await Admin.findOne({ email: adminData.email }).exec();
};
const readAdminByEmail = async (adminData) => {
  return await Admin.findOne({ email: adminData.email })
    .select("-_id, -password")
    .exec();
};
const readAdminByUsername = async (username) => {
  return await Admin.findOne({ username: username }).exec();
};

const updateAdmin = async (id, adminData) => {
  try {
    const toUpdateAdmin = await Admin.findByIdAndUpdate(id, adminData);
    // toUpdateAdmin.set(adminData);
    // const updatedAdmin = await toUpdateAdmin.save();
    if (!toUpdateAdmin) {
      return console.log("Admin update error: " + err);
    }

    return toUpdateAdmin;
  } catch (e) {
    return {
      success: false,
      message:
        e +
        "Disculpa. No se pudo actualizar este administrador, inténtalo de nuevo por favor.",
    };
  }
};

const deleteAdmin = async (adminUsername) => {
  try {
    const toDeleteAdmin = await Admin.findOneAndDelete({
      username: adminUsername,
    });
    return toDeleteAdmin;
  } catch (e) {
    return {
      success: false,
      message: e,
    };
  }
};
//Admin roles CRUD

const createAdminRole = async (role) => {
  try {
    const newRole = await new adminRole(role).save();
    return {
      res: { success: true, newRole: newRole },
    };
  } catch (e) {
    console.log(e);
    return "Incapaz de crear el rol, intenta de nuevo o consulta a soporte.";
  }
};

const readAdminRoles = async () => {
  let readedAdminRoles = await adminRole.find({});
  if (readedAdminRoles) {
    return readedAdminRoles;
  } else {
    return false;
  }
};

const updateAdminRole = async (id, role) => {
  try {
    const toUpdate = await adminRole.findOne({ _id: id });
    toUpdate.set(role);
    const updatedAdminRole = await toUpdate.save();
    if (!updatedAdminRole) {
      return console.log("AdminRole update error: " + err);
    }
    return {
      message: "Rol de administrador actualizado con éxito.",
      role: updatedAdminRole,
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

const deleteAdminRole = async (id) => {
  try {
    const toDeleteAdminRole = await adminRole.findOneAndDelete({ _id: id });
    return toDeleteAdminRole;
  } catch (e) {
    return {
      success: false,
      message: e,
    };
  }
};

module.exports = {
  readAdminById,
  readAllAdmins,
  readSellers,
  updateAdmin,
  readAdminByEmail,
  readAdminByUsername,
  readFullAdminByEmail,
  deleteAdmin,
  createAdminRole,
  readAdminRoles,
  updateAdminRole,
  deleteAdminRole,
};
