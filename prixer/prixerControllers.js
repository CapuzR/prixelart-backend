const multer = require("multer");
const multerS3 = require("multer-s3-transform");
const dotenv = require("dotenv");
const sharp = require("sharp");
const aws = require("aws-sdk");
const spacesEndpoint = new aws.Endpoint(process.env.PRIVATE_BUCKET_URL);
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_ACCESS_KEY,
  secretAccessKey: process.env.DO_ACCESS_SECRET,
});

const prixerServices = require("./prixerServices");
const artServices = require("../art/artServices");
const userControllers = require("../user/userControllers/userControllers");

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
    const readedPrixer = await prixerServices.readPrixer(user);
    res.send(readedPrixer);
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
    const readedPrixers = await prixerServices.readAllPrixersFull();
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
      avatar: req.body.avatar,
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
    const prixerData = {
      status: req.body.status,
    };
    const updates = await prixerServices.updateVisibility(
      req.params.id,
      prixerData
    );
    return res.send(updates);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const updateTermsAgreeGeneral = async (req, res) => {
  try {
    const prixerData = {
      termsAgree: req.body.termsAgree,
    };
    const updates = await prixerServices.updateTermsAgreeGeneral(
      req.params.id,
      prixerData
    );
    return res.send(updates);
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
      req.body.Id = nanoid(7); //=> "5-JDFkc"
      // req.body.avatar =
      //   process.env.PUBLIC_BUCKET_URL +
      //   "/" +
      //   file.fieldname +
      //   "-" +
      //   req.body.Id +
      //   "-" +
      //   req.body.Id +
      //   "-large.webp";
      cb(null, /^image/i.test(file.mimetype));
    },
    transforms: [
      {
        id: "largeThumb",
        key: function (req, file, cb) {
          cb(null, file.fieldname + "-" + req.body.Id + "-large.webp");
        },
        transform: function (req, file, cb) {
          cb(null, sharp().resize(320, 320).webp({ quality: 80 }));
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
  updatePrixer,
  updateVisibility,
  updateTermsAgree,
  updateTermsAgreeGeneral,
  disablePrixer,
  readAllPrixersFull,
  readAllPrixersFullv2,
  upload,
};

//CRUD END
