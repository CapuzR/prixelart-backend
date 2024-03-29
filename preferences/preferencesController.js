const multer = require("multer");
const multerS3 = require("multer-s3-transform");
const dotenv = require("dotenv");
const sharp = require("sharp");
const aws = require("aws-sdk");
const { nanoid } = require("nanoid");
const { Carousel, dollarValue } = require("./preferencesModel");
const { termsAndConditions } = require("./preferencesModel");
const prixerModel = require("../prixer/prixerModel");
const preferenceService = require("./preferencesService");
const adminAuthServices = require("../admin/adminServices/adminAuthServices");
const productModel = require("../product/productModel");
const artModel = require("../art/artModel");

dotenv.config();

const spacesEndpoint = new aws.Endpoint(process.env.PRIVATE_BUCKET_URL);
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_ACCESS_KEY,
  secretAccessKey: process.env.DO_ACCESS_SECRET,
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.PUBLIC_BUCKET_NAME,
    acl: "public-read",
    shouldTransform: function (req, file, cb) {
      req.body.Id = nanoid(7);
      cb(null, /^image/i.test(file.mimetype));
    },
    transforms: [
      {
        id: "desktopThumb",
        key: function (req, file, cb) {
          cb(null, file.fieldname + "-" + req.body.Id + "-large.webp");
        },
        transform: function (req, file, cb) {
          cb(null, sharp().resize(1300, null).webp({ quality: 80 }));
        },
      },
    ],
  }),
});

const readAllImagesCarousel = async (req, res) => {
  try {
    const imagesCarousels = await Carousel.find();
    res.json({ imagesCarousels });
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
};

const readImageCarousel = async (req, res) => {
  const imageCarousel = await Carousel.findById(req.params.id);
  res.json({ imageCarousel });
};

const createImageCarousel = async (req, res) => {
  try {
    if (req.files["bannerImagesDesktop"]) {
      const imagesCarousel = new Carousel({
        images: {
          type: "desktop",
          url: req.files["bannerImagesDesktop"][0].transforms[0].location,
        },
      });
      await imagesCarousel.save();
      res.json({
        status: "Process sucessfull",
        body: req.body,
      });
    } else if (req.files["bannerImagesMobile"]) {
      const imagesCarousel = new Carousel({
        images: {
          type: "mobile",
          url: req.files["bannerImagesMobile"][0].transforms[0].location,
        },
      });
      await imagesCarousel.save();
      res.json({
        status: "Process sucessfull",
        body: req.body,
      });
    } else {
      res.json({ status: "must send a file" });
    }
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
};

const updateImageCarousel = async (req, res) => {
  try {
    if (req?.files["bannerImagesDesktop"]) {
      await Carousel.findByIdAndUpdate(req.params.id, {
        images: {
          type: "desktop",
          url: req.files["bannerImagesDesktop"][0].transforms[0].location,
        },
      });
      res.json({
        status: "Image updated",
        body: req.body,
      });
    } else if (req.files["bannerImagesMobile"]) {
      await Carousel.findByIdAndUpdate(req.params.id, {
        images: {
          type: "mobile",
          url: req.files["bannerImagesMobile"][0].transforms[0].location,
        },
      });
      res.json({
        status: "Image updated",
        body: req.body,
      });
    } else {
      res.json({ status: "must send a file" });
    }
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
};

const deleteImageCarousel = async (req, res) => {
  await Carousel.findByIdAndDelete(req.params.id);
  res.json({ status: "Image deleted" });
};

const readTermsAndConditions = async (req, res) => {
  try {
    const result = await termsAndConditions.find();
    res.send({ terms: result[0] });
  } catch (error) {
    console.log(error);
    res.send({ message: 505 });
  }
};

const updateTermsAndConditions = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.modifyTermsAndCo) {
      const result = await termsAndConditions.find();

      if (result[0] === undefined) {
        const newTerms = {
          termsAndConditions: req.body.termsAndConditions,
        };
        const terms = await termsAndConditions(newTerms).save();
        if (terms) {
          const updated = await prixerModel.updateMany(
            {},
            { termsAgree: false }
          );
          res.send({ terms: req.body.termsAndConditions, prixers: updated });
        }
      } else {
        const updating = await termsAndConditions.findOne({
          _id: result[0]._id,
        });

        updating.termsAndConditions = req.body.termsAndConditions;
        await updating.save();
        const updated = await prixerModel.updateMany({}, { termsAgree: false });
        res.send({ terms: updating, prixers: updated });
      }
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      });
    }
  } catch (error) {
    console.log(error);
    res.send({ message: "Error en la actualización", error: error });
  }
};

const readDollarValue = async (req, res) => {
  try {
    const result = await dollarValue.find();
    res.send({ dollarValue: result[0].dollarValue });
  } catch (error) {
    console.log(error);
    res.send({ message: 505 });
  }
};
const updateDollarValue = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.modifyDollar) {
      const result = await preferenceService.updateDollarValue(
        req.body.dollarValue
      );
      res.send(result);
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

const getBestSellers = async (req, res) => {
  try {
    let products = await productModel.find();
    if (products) {
      let productsv2 = products.filter((prod) => prod.bestSeller === true);
      const data = {
        products: productsv2,
      };
      return res.send(data);
    } else {
      const data = {
        info: "No hay productos registrados",
        products: null,
      };
      return res.send(data);
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

const getArtBestSellers = async (req, res) => {
  try {
    let arts = await artModel.find();
    if (arts) {
      let artsv2 = arts.filter((art) => art.bestSeller === true);
      const data = {
        arts: artsv2,
      };
      return res.send(data);
    } else {
      const data = {
        info: "No hay artes registrados",
        arts: null,
      };
      return res.send(data);
    }
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
};

const updateBestSellers = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.modifyBestSellers) {
      const update = await preferenceService.updateBestSellers(req.body.data);
      res.send(update);
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

const updateArtBestSellers = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.modifyArtBestSellers) {
      const update = await preferenceService.updateArtBestSellers(
        req.body.data
      );
      res.send(update);
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};
module.exports = {
  createImageCarousel,
  upload,
  readAllImagesCarousel,
  readImageCarousel,
  updateImageCarousel,
  deleteImageCarousel,
  readTermsAndConditions,
  updateTermsAndConditions,
  readDollarValue,
  updateDollarValue,
  getBestSellers,
  updateBestSellers,
  updateArtBestSellers,
  getArtBestSellers,
};
