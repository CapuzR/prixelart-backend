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
const testimonialServices = require("./testimonialServices");

//CRUD

const createTestimonial = async (req, res) => {
  try {
    const imageAvatar = req.file.transforms[0].location;
    const testimonialData = {
      type: req.body.type,
      name: req.body.name,
      value: req.body.value,
      avatar: imageAvatar,
      footer: req.body.footer,
      status: req.body.status,
    };
    console.log(testimonialData);

    res.send("OK");
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

const readTestimonial = async (req, res) => {
  try {
    const name = await testimonialControllers.readTestimonialByName(req);
    const readedTestimonial = await testimonialServices.readTestimonial(name);
    res.send(readedTestimonial);
  } catch (err) {
    res.status(500).send(err);
  }
};

const readAllTestimonials = async (req, res) => {
  try {
    const readedTestimonials = await testimonialServices.readAllTestimonials();
    res.send(readedTestimonials);
  } catch (err) {
    res.status(500).send(err);
  }
};

const updateTestimonial = async (req, res) => {
  try {
    const testimonial = {
      type: req.body.type,
      name: req.body.name,
      value: req.body.value,
      avatar: req.body.avatar,
      footer: req.body.footer,
      company: req.body.company,
      status: req.body.status,
    };

    const updates = await testimonialServices.updateTestimonial(testimonial);
    return res.send(updates);
  } catch (err) {
    res.status(500).send(err);
  }
};

const deleteTestimonial = async (req, res) => {
  try {
    const deleteTestimonial = await testimonialServices.deleteTestimonial(
      req.body
    );
    return res.send(deleteTestimonial);
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
  createTestimonial,
  readAllTestimonials,
  readTestimonial,
  updateTestimonial,
  deleteTestimonial,
  upload,
};

//CRUD END
