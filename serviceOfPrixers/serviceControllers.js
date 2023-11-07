const multer = require("multer");
const multerS3 = require("multer-s3-transform");
const sharp = require("sharp");
const aws = require("aws-sdk");
const { nanoid } = require("nanoid");
const serviceServices = require("./serviceServices");
const { parse } = require("dotenv");

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
      cb(null, /^image/i.test(file.mimetype));
    },
    transforms: [
      {
        id: "largeThumb",
        key: function (req, file, cb) {
          cb(null, file.fieldname + "-" + nanoid(7) + "-large.webp");
        },
        transform: function (req, file, cb) {
          cb(null, sharp().resize(300, 300).webp({ quality: 80 }));
        },
      },
    ],
  }),
});

const createService = async (req, res) => {
  try {
    const imagesResult = [];
    // if (req.files) {
    req.files.map((img, i) => {
      imagesResult.push({
        type: "images",
        url: img.transforms[0].location,
      });
    });
    // }
    // if (req.body.video) {
    //   imagesResult.push({
    //     type: "video",
    //     url: req.body.video,
    //   });
    // }
    const parseObject = {
      title: req.body.title,
      description: req.body.description,
      serviceArea: req.body.serviceArea,
      isLocal: req.body.isLocal,
      isRemote: req.body.isRemote,
      sources: {
        images: imagesResult,
        // video: req.body.video
      },
      publicPrice: {
        from: req.body.priceFrom,
      },
      //   prixerPrice: {
      //     from: req.body.prixerPriceFrom,
      //     to: req.body.prixerPriceTo,
      //   },
      active: req.body.active,
      productionTime: req.body.productionTime,
      prixer: req.body.prixer,
    };

    if (req.body.priceTo) {
      parseObject.publicPrice.to = req.body.priceTo;
    }
    if (req.body.location) {
      parseObject.location = req.body.location;
    }
    if (req.body.productionTime) {
      parseObject.productionTime = req.body.productionTime;
    }
    res.send(await serviceServices.createService(parseObject));
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const readMyServices = async (req, res) => {
  try {
    const readedServices = await serviceServices.readMyServices(
      req.body.prixer
    );
    res.send(readedServices);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

const getServicesByPrixer = async (req, res) => {
  try {
    const readedServices = await serviceServices.readByPrixer(
      req.params.prixer
    );
    res.send(readedServices);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

const updateMyService = async (req, res) => {
  try {
    const imagesResult = [];
    req.files.map((img, i) => {
      imagesResult.push({
        type: "images",
        url: img.transforms[0].location,
      });
    });

    const parseObject = {
      title: req.body.title,
      description: req.body.description,
      serviceArea: req.body.serviceArea,
      isLocal: req.body.isLocal,
      isRemote: req.body.isRemote,
      sources: {
        images: [],
        // video: req.body.video
      },
      publicPrice: {
        from: Number(req.body.priceFrom),
        to: Number(req.body?.priceTo),
      },
      //   prixerPrice: {
      //     from: req.body.prixerPriceFrom,
      //     to: req.body.prixerPriceTo,
      //   },
      active: req.body.active,
      productionTime: req.body.productionTime,
      prixer: req.body.prixer,
    };

    if (req.body.priceTo) {
      parseObject.publicPrice.to = Number(req.body.priceTo);
    }
    if (req.body.location) {
      parseObject.location = req.body.location;
    }
    if (req.body.productionTime) {
      parseObject.productionTime = req.body.productionTime;
    }
    if (typeof req.body.images === "string") {
      parseObject.sources.images.push({ type: "images", url: req.body.images });
    } else if (req.body.images.length > 1) {
      req.body.images.map((prev) => {
        parseObject.sources.images.push({ type: "images", url: prev });
      });
    }

    if (imagesResult.length > 0) {
      imagesResult.map((n) => {
        parseObject.sources.images.push(n);
      });
    }
    const updateService = await serviceServices.updateMyService(
      req.params.id,
      parseObject
    );
    res.send(updateService);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

const deleteService = async (req, res) => {
  try {
    const serviceToDelete = await serviceServices.deleteService(req.params.id);
    res.send(serviceToDelete);
  } catch (error) {
    console.log(err);
    res.status(500).send(err);
  }
};
module.exports = {
  upload,
  createService,
  readMyServices,
  getServicesByPrixer,
  updateMyService,
  deleteService,
};
