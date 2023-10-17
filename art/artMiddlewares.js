const multer = require("multer");
const multerS3 = require("multer-s3-transform");
const aws = require("aws-sdk");
const dotenv = require("dotenv");
const sharp = require("sharp");
dotenv.config();
const { nanoid } = require("nanoid");
var path = require("path");
const accents = require("remove-accents");

const spacesEndpoint = new aws.Endpoint(process.env.PRIVATE_BUCKET_URL);
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_ACCESS_KEY,
  secretAccessKey: process.env.DO_ACCESS_SECRET,
});

const uploadOriginalArt = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.PRIVATE_BUCKET_NAME,
    acl: "private",
    // metadata: function (req, file, cb) {
    //   removeExtra(req.body);
    //   cb(null, Object.assign({}, req.body));
    // },
    key: function (req, file, cb) {
      removeExtra(req.body);
      cb(null, req.body.artId + path.extname(file.originalname));
    },
  }),
}).single("imageUrl");

const removeExtra = (arr) => {
  for (var key in arr) {
    if (key !== "artId") {
      arr[key].pop();
      arr[key] = arr[key].toString();
    }
  }
};

const uploadThumbnailArt = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.PUBLIC_BUCKET_NAME,
    acl: "public-read",
    shouldTransform: function (req, file, cb) {
      req.body.artId = nanoid(7); //=> "5-JDFkc"
      cb(null, /^image/i.test(file.mimetype));
    },
    transforms: [
      {
        id: "squareThumb",
        key: function (req, file, cb) {
          cb(
            null,
            accents.remove(req.body.title)?.replace(/ /g, "_").toLowerCase() +
              "-" +
              req.body.artId +
              "-square.webp"
          );
        },
        transform: function (req, file, cb) {
          const crops = JSON.parse(req.body.crops);
          req.body.crops = JSON.parse(req.body.crops);
          cb(null, sharp().webp({ quality: 50 }).resize(850, null));
        },
      },
      {
        id: "largeThumb",
        key: function (req, file, cb) {
          cb(
            null,
            accents.remove(req.body.title)?.replace(/ /g, "_").toLowerCase() +
              "-" +
              req.body.artId +
              "-large.webp"
          );
        },
        transform: function (req, file, cb) {
          cb(null, sharp().resize(1300, null).webp({ quality: 50 }));
        },
      },
      {
        id: "mediumThumb",
        key: function (req, file, cb) {
          cb(
            null,
            accents.remove(req.body.title)?.replace(/ /g, "_").toLowerCase() +
              "-" +
              req.body.artId +
              "-medium.webp"
          );
        },
        transform: function (req, file, cb) {
          cb(null, sharp().resize(850, null).webp({ quality: 50 }));
        },
      },
      {
        id: "smallThumb",
        key: function (req, file, cb) {
          cb(
            null,
            accents.remove(req.body.title)?.replace(/ /g, "_").toLowerCase() +
              "-" +
              req.body.artId +
              "-small.webp"
          );
        },
        transform: function (req, file, cb) {
          cb(null, sharp().resize(600, null).webp({ quality: 50 }));
        },
      },
    ],
  }),
}).single("imageUrl");

//Callbacks

function artThumbsCb(request, response, next) {
  return function (error) {
    if (error) {
      console.log(error);
      return response.send({
        success: false,
        message:
          "Disculpa, ocurrió un error inesperado. Por favor inténtalo de nuevo.",
      });
    } else {
      console.log("Thumbnails subidos correctamente.");
    }
  };
}

function originalArtCb(request, res, next) {
  return function (error, response) {
    if (error) {
      console.log(error);
      return res.send({
        success: false,
        message:
          "Disculpa, ocurrió un error inesperado. Por favor inténtalo de nuevo.",
      });
    } else {
      const publicArtUrl =
        process.env.PUBLIC_BUCKET_URL +
        "/" +
        accents.remove(request.body.title)?.replace(/ /g, "_").toLowerCase() +
        "-" +
        request.body.artId;

      const privateArtUrl =
        process.env.PRIVATE_BUCKET_NAME +
        "." +
        process.env.PRIVATE_BUCKET_URL +
        "/" +
        request.body.artId;

      request.body.largeThumbUrl = publicArtUrl + "-large.webp";
      request.body.mediumThumbUrl = publicArtUrl + "-medium.webp";
      request.body.smallThumbUrl = publicArtUrl + "-small.webp";
      request.body.squareThumbUrl = publicArtUrl + "-square.webp";
      request.body.artUrl = privateArtUrl;
      console.log("Archivo original subido correctamente.");
      next();
    }
  };
}

const uploadThumbnail = (request, response, next) => {
  uploadThumbnailArt(request, response, artThumbsCb(request, response, next));
  uploadOriginalArt(request, response, originalArtCb(request, response, next));
};

module.exports = { uploadThumbnail };
