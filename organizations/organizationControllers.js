const multer = require("multer");
const multerS3 = require("multer-s3-transform");
const dotenv = require("dotenv");
const sharp = require("sharp");
const aws = require("aws-sdk");
const { nanoid } = require("nanoid");
const orgServices = require("./organizationServices");
const artServices = require("../art/artServices");
const userControllers = require("../user/userControllers/userControllers");

const spacesEndpoint = new aws.Endpoint(process.env.PRIVATE_BUCKET_URL);
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_ACCESS_KEY,
  secretAccessKey: process.env.DO_ACCESS_SECRET,
});

const turnToOrg = async (req, res) => {
  try {
    const findUser = await orgServices.turnPrixerToOrg(req.body.username);
    res.send(findUser);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

const turnToPrixer = async (req, res) => {
  try {
    const findUser = await orgServices.turnOrgToPrixer(req.body.username);
    res.send(findUser);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

const readAllOrgFull = async (req, res) => {
  try {
    const readedOrg = await orgServices.readAllOrgFull();
    res.send(readedOrg);
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
};

const readAllOrgFullv2 = async (req, res) => {
  try {
    const readedOrg = await orgServices.readAllOrgFull();
    const organizations = readedOrg.organizations;
    const promises = organizations.map((org) =>
      artServices.readAllByUserIdV2(org.username)
    );
    const promiseResult = await Promise.all(promises);
    const orgFilters = organizations.filter((org) =>
      promiseResult.find(
        (group) => org.username === group.username && group.arts.length > 0
      )
    );
    readedOrg.organizations = orgFilters;

    res.send(readedOrg);
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
};

const getBio = async (req, res) => {
  try {
    const user = await userControllers.readUserByUsername(req.params.id);
    const readedBio = await orgServices.readBio(user);
    res.send(readedBio);
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
};

const updateComission = async (req, res) => {
  try {
    const orgData = {
      appliedProducts: req.body.appliedProducts,
      base: req.body.base,
      comission: req.body.comission,
      considerations: req.body.considerations,
    };
    const update = await orgServices.updateComission(req.params.id, orgData);

    res.send(update);
  } catch (error) {
    res.status(500).send(err);
    console.log(err);
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
    const update = await orgServices.updateBio(req.params.id, bio);
    return res.send(update);
  } catch (err) {
    console.log(err);
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

module.exports = {
  turnToOrg,
  turnToPrixer,
  readAllOrgFull,
  readAllOrgFullv2,
  getBio,
  updateComission,
  updateBio,
  upload,
};
