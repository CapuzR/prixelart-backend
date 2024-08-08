const multer = require("multer");
const multerS3 = require("multer-s3-transform");
const dotenv = require("dotenv");
const sharp = require("sharp");
const aws = require("aws-sdk");
const { nanoid } = require("nanoid");
const prixerServices = require("./prixerServices");
const artServices = require("../art/artServices");
const userControllers = require("../user/userControllers/userControllers");
const adminAuthServices = require("../admin/adminServices/adminAuthServices");

const spacesEndpoint = new aws.Endpoint(process.env.PRIVATE_BUCKET_URL);
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_ACCESS_KEY,
  secretAccessKey: process.env.DO_ACCESS_SECRET,
});

//CRUD

const createPrixer = async (req, res) => {
  try {
    const imageAvatar = req.file?.transforms[0]?.location;
    const prixerData = {
      specialtyArt: req.body.specialtyArt,
      instagram: req.body.instagram,
      facebook: req.body.facebook,
      twitter: req.body.twitter,
      dateOfBirth: req.body.dateOfBirth,
      phone: req.body.phone,
      country: req.body.country,
      city: req.body.city,
      description: req.body.description,
      userId: req.user.id,
      avatar: imageAvatar,
      username: req.user.username,
      status: req.body.status,
      termsAgree: req.body.termsAgree,
    };

    res.send(await prixerServices.createPrixer(prixerData));
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

const readPrixer = async (req, res) => {
  try {
    const user = await userControllers.readUserByUsername(req.body.username);
    // if (user !== null) {
    const readedPrixer = await prixerServices.readPrixer(user);
    res.send(readedPrixer);
    // } else return {};
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
};

const getPrixer = async (req, res) => {
  try {
    const user = await userControllers.readUserByUsername(req.params.id);
    const readedPrixer = await prixerServices.readPrixerbyId(user);
    res.send(readedPrixer);
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
};

const getBio = async (req, res) => {
  try {
    const user = await userControllers.readUserByUsername(req.params.id);
    const readedBio = await prixerServices.readBio(user);
    res.send(readedBio);
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
};

const readAllPrixers = async (req, res) => {
  try {
    const readedPrixers = await prixerServices.readAllPrixers({ status: true });
    res.send(readedPrixers);
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
};

const readAllPrixersFull = async (req, res) => {
  try {
    const readedPrixers = await prixerServices.readAllPrixersFull();
    res.send(readedPrixers);
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
};

const readAllPrixersFullv2 = async (req, res) => {
  try {
    const readedPrixers = await prixerServices.readAllPrixersFullv2();
    const prixers = readedPrixers.prixers;
    const promises = prixers.map((prixer) =>
      artServices.readAllByUserIdV2(prixer.username)
    );
    const promiseResult = await Promise.all(promises);
    const prixerFilter = prixers.filter((prixer) =>
      promiseResult.find(
        (group) => prixer.username === group.username && group.arts.length > 0
      )
    );
    readedPrixers.prixers = prixerFilter;

    res.send(readedPrixers);
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
};

const getOwnersAndPrixers = async (req, res) => {
  try {
    const readedPrixers = await prixerServices.getOwnersAndPrixers({
      status: true,
    });
    res.send(readedPrixers);
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
};

const updatePrixer = async (req, res) => {
  try {
    const prixer = {
      specialtyArt: req.body.specialtyArt,
      instagram: req.body.instagram,
      facebook: req.body.facebook,
      twitter: req.body.twitter,
      dateOfBirth: req.body.dateOfBirth,
      phone: req.body.phone,
      country: req.body.country,
      city: req.body.city,
      username: req.body.username,
      avatar: req.file?.transforms[0]?.location || req.body.avatar,
      description: req.body.description,
      status: req.body.status,
      termsAgree: req.body.termsAgree,
    };

    const user = {
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      id: req.user.id,
    };
    const updates = await prixerServices.updatePrixer(prixer, user);
    return res.send(updates);
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
};

const updateVisibility = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.prixerBan) {
      const prixerData = {
        status: req.body.status,
        account: req.body.account,
        id: req.params.id,
      };
      const updates = await prixerServices.updateVisibility(prixerData);
      return res.send(updates);
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const updateBio = async (req, res) => {
  try {
    let img = [];
    if (req.body.bioImages !== undefined) {
      img = [req.body.bioImages];
    }
    let bio = {
      biography: req.body.biography,
      images: img.flat(Infinity),
    };

    const images = [];
    await req.files.map((img, i) => {
      images.push(img.transforms[0].location);
    });

    if (bio.images.length === 0) {
      bio.images = images;
    } else if (req.body.bioImages) {
      const newImgs = bio.images.concat(images);
      bio.images = newImgs;
    }
    const update = await prixerServices.updateBio(req.params.id, bio);
    return res.send(update);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const updateTermsAgreeGeneral = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.modifyTermsAndCo) {
      // const prixerData = {
      //   termsAgree: req.body.termsAgree,
      // };
      const updated = await prixerModel.updateMany({}, { termsAgree: false });
      res.send({ terms: req.body.termsAndConditions, prixers: updated });
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const updateTermsAgree = async (req, res) => {
  try {
    const prixerData = {
      termsAgree: req.body.termsAgree,
    };
    const updates = await prixerServices.updateTermsAgree(
      req.params.id,
      prixerData
    );
    return res.send(updates);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const disablePrixer = async (req, res) => {
  try {
    const disabledUser = await prixerServices.disablePrixer(req.body);
    return res.send(disabledUser);
  } catch (err) {
    res.status(500).send(err);
  }
};

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.PUBLIC_BUCKET_NAME,
    acl: "public-read",
    shouldTransform: function (req, file, cb) {
      cb(null, /^image/i.test(file.mimetype));
    },
    transforms: [
      {
        id: "largeThumb",
        key: function (req, file, cb) {
          cb(null, file.fieldname + "-" + nanoid(7) + "-large.webp");
        },
        transform: function (req, file, cb) {
          cb(null, sharp().resize(600, 600).webp({ quality: 80 }));
        },
      },
    ],
  }),
});

const upload2 = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.PUBLIC_BUCKET_NAME,
    acl: "public-read",
    shouldTransform: function (req, file, cb) {
      cb(null, /^image/i.test(file.mimetype));
    },
    transforms: [
      {
        id: "largeThumb",
        key: function (req, file, cb) {
          cb(null, file.fieldname + "-" + nanoid(7) + "-large.webp");
        },
        transform: function (req, file, cb) {
          cb(null, sharp().webp({ quality: 80 }));
        },
      },
    ],
  }),
});

module.exports = {
  createPrixer,
  readAllPrixers,
  readPrixer,
  getPrixer,
  getBio,
  updatePrixer,
  updateVisibility,
  updateBio,
  updateTermsAgree,
  updateTermsAgreeGeneral,
  disablePrixer,
  readAllPrixersFull,
  readAllPrixersFullv2,
  getOwnersAndPrixers,
  upload,
  upload2
};

//CRUD END
