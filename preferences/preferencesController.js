const multer = require("multer");
const multerS3 = require("multer-s3-transform");
const dotenv = require("dotenv");
const sharp = require("sharp");
const aws = require("aws-sdk");
const { nanoid } = require("nanoid");
const { Carousel } = require("./preferencesModel");
const { termsAndConditions } = require("./preferencesModel");
const prixerModel = require("../prixer/prixerModel");

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
      req.body.Id = nanoid(7); //=> "5-JDFkc"
      cb(null, /^image/i.test(file.mimetype));
    },
    transforms: [
      {
        id: "largeThumb",
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
  const imagesCarousels = await Carousel.find();
  res.json({ imagesCarousels });
};

const readImageCarousel = async (req, res) => {
  const imageCarousel = await Carousel.findById(req.params.id);
  res.json({ imageCarousel });
};

const createImageCarousel = async (req, res) => {
  if (req.file) {
    const urlImg = req.file.transforms[0].location;
    const imagesCarousel = new Carousel({
      carouselImages: urlImg,
    });
    await imagesCarousel.save();
    res.json({
      status: "Process sucessfull",
      body: req.body,
      file: urlImg,
    });
  } else {
    res.json({ status: "must send a file" });
  }
};

const updateImageCarousel = async (req, res) => {
  const newUrlImage = req.file.transforms[0].location;
  await Carousel.findByIdAndUpdate(req.params.id, {
    carouselImages: newUrlImage,
  });
  res.json({ status: "Image Updated" });
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
    const result = await termsAndConditions.find();
    const updating = await termsAndConditions.findOne({ _id: result[0]._id });
    updating.termsAndConditions = req.body.termsAndConditions;
    await updating.save();
    const changeTerms = await prixerModel.updateMany({}, { termsAgree: false });
    res.send({ terms: updating });
  } catch (error) {
    console.log(error);
    res.send({ message: 505 });
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
};
