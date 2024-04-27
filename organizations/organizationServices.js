const Org = require("./organizationModel");
const Prixer = require("../prixer/prixerModel");
const User = require("../user/userModel");
const prixerServices = require("../prixer/prixerServices");
const userService = require("../user/userServices/userServices");

const turnPrixerToOrg = async (username) => {
  const findUser = await User.findOneAndUpdate(
    { username: username },
    { role: "Organization" }
  );
  if (findUser) {
    const findPrixer = await Prixer.findOneAndUpdate(
      { username: findUser.username },
      { status: false }
    );
    const findOrg = await Org.findOne({ username: username });
    let saveOrg;
    if (findOrg) {
      findOrg.status = true;
      saveOrg = findOrg.save();
    } else {
      const newOrg = {
        specialtyArt: findPrixer.specialtyArt,
        instagram: findPrixer.instagram,
        facebook: findPrixer.facebook,
        twitter: findPrixer.twitter,
        dateOfBirth: findPrixer.dateOfBirth,
        phone: findPrixer.phone,
        country: findPrixer.country,
        city: findPrixer.city,
        description: findPrixer.description,
        status: true,
        termsAgree: findPrixer.termsAgree,
        bio: findPrixer.bio,
        userId: findPrixer.userId,
        username: findPrixer.username,
        avatar: findPrixer.avatar,
      };

      saveOrg = await Org(newOrg).save();
    }

    return {
      success: true,
      user: findUser,
      prixer: findPrixer,
      organization: saveOrg,
    };
  } else {
    return {
      success: false,
      message: "Usuario no encontrado.",
    };
  }
};

const turnOrgToPrixer = async (username) => {
  const findUser = await User.findOneAndUpdate(
    { username: username },
    { role: "Prixer" }
  );
  if (findUser) {
    const findPrixer = await Prixer.findOneAndUpdate(
      { username: findUser.username },
      { status: true }
    );
    const findOrg = await Org.findOneAndUpdate(
      { username: username },
      { status: false }
    );

    return {
      success: true,
      user: findUser,
      prixer: findPrixer,
      organization: findOrg,
    };
  } else {
    return {
      success: false,
      message: "Usuario no encontrado.",
    };
  }
};
const mergeOrgAndUser = (org, readedUser) => {
  let organization = {};

  organization["orgId"] = org.id;
  organization["username"] = readedUser.username;
  organization["firstName"] = readedUser.firstName;
  organization["lastName"] = readedUser.lastName;
  organization["email"] = readedUser?.email;
  organization["specialtyArt"] = org?.specialtyArt;
  organization["description"] = org?.description;
  organization["instagram"] = org?.instagram;
  organization["facebook"] = org?.facebook;
  organization["twitter"] = org?.twitter;
  organization["dateOfBirth"] = org?.dateOfBirth;
  organization["phone"] = org?.phone;
  organization["country"] = org?.country;
  organization["city"] = org?.city;
  organization["avatar"] = org?.avatar;
  organization["status"] = org?.status;
  organization["termsAgree"] = org?.termsAgree;
  organization["account"] = readedUser?.account;
  organization["role"] = readedUser?.role;
  organization["comission"] = org?.comission;
  organization["appliedProducts"] = org?.appliedProducts;

  return organization;
};

const readAllOrgFull = async () => {
  try {
    // await Org.updateMany({}, { $set: { comission: 10, appliedProducts: [] } });
    const readedOrg = await Org.find({}).exec();
    let data = [];
    if (readedOrg) {
      data = await Promise.all(
        readedOrg.map(async (org) => {
          const readedUser = await userService.readUserById({
            id: org.userId,
          });
          if (readedUser && readedUser.role === "Organization") {
            const organization = mergeOrgAndUser(org, readedUser);
            return organization;
          } else {
            return;
          }
        })
      );

      const filteredOrg = data.filter((e) => e !== null && e !== undefined);
      const organizations = {
        info: "organizaciones disponibles",
        organizations: filteredOrg,
      };
      return organizations;
    } else {
      const data = {
        info: "No hay organizaciones registrados",
        organizations: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const readBio = async (user) => {
  let readedOrg = await Org.findOne({ userId: user._id }).exec();
  if (readedOrg) {
    const data = readedOrg.bio;
    return { data: data, success: true };
  }
};

const updateComission = async (orgId, orgData) => {
  try {
    const toUpdateOrg = await Org.findOne({ _id: orgId });
    toUpdateOrg.comission = orgData.comission;
    toUpdateOrg.appliedProducts = orgData.appliedProducts;
    const updatedOrg = await toUpdateOrg.save();
    if (!updatedOrg) {
      return console.log("Org update error: " + err);
    } else {
      return { success: true, message: "Actualización realizada con éxito." };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = {
  turnPrixerToOrg,
  turnOrgToPrixer,
  readAllOrgFull,
  mergeOrgAndUser,
  readBio,
  updateComission,
};
