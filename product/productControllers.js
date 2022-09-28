const multer = require("multer");
const multerS3 = require("multer-s3-transform");
const dotenv = require("dotenv");
const sharp = require("sharp");
const aws = require("aws-sdk");
const { nanoid } = require("nanoid");
const productServices = require("./productServices");

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
          cb(null, sharp().resize(300, 300).webp({ quality: 80 }));
        },
      },
    ],
  }),
});

//CRUD

const createProduct = async (req, res, next) => {
  try {
    const imagesResult = [];
    if(req.body.video && req.files){
        req.files.map((img, i) => {
          imagesResult.push({
            type: 'images',
            url : img.transforms[0].location
          });
        });
        imagesResult.push({
          type: 'video',
          url : req.body.video
        });
    }else if(req.body.video && req.files == undefined){
      imagesResult.push({
        type: 'video',
        url : req.body.video
      });
    } else{
      req.files.map((img, i) => {
        imagesResult.push({
          type: 'images',
          url : img.transforms[0].location
        });
      });
    }
    const parseObject = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      considerations: req.body.considerations,
      sources:{
      // typeFile: req.body.typeFile,
      images: imagesResult,
      // video: req.body.video
      }, //images from Products
      publicPrice: {
        from: req.body.publicPriceFrom,
        to: req.body.publicPriceTo,
      }, //price
      prixerPrice: {
        from: req.body.prixerPriceFrom,
        to: req.body.prixerPriceTo,
      }, //prixerPrice
      attributes: req.body.attributes ? req.body.attributes : [], //activeAttributes
      active: req.body.active,
      variants: req.body.variants ? req.body.variants : [],
      hasSpecialVar: req.body.hasSpecialVar,
    }
    res.send(await productServices.createProduct(parseObject));
  } catch (err) {
    res.status(500).send(err);
  }
};

const readById = async (req, res) => {
  try {
    const readedProduct = await productServices.readById(req.body);
    res.send(readedProduct);
  } catch (err) {
    res.status(500).send(err);
  }
};

const readAllProducts = async (req, res) => {
  try {
    const readedProducts = await productServices.readAllProducts();
    res.send(readedProducts);
  } catch (err) {
    res.status(500).send(err);
  }
};

const readAllProductsAdmin = async (req, res) => {
  try {
    const readedProducts = await productServices.readAllProductsAdmin();
    res.send(readedProducts);
  } catch (err) {
    res.status(500).send(err);
  }
};

async function updateProduct(req, res) {
  try {
    const imagesResult =
      req.files.length > 0
        ? typeof req.body.images === "string"
          ? [req.body.images]
          : req.body.images
        : typeof req.body.images === 'string'
        ? [req.body.images]
        : req.body.images;
    req.files.map(async (img, i) => {
      if(imagesResult[0] === ''){
        imagesResult[0] = img.transforms[0].location
      }else{
        imagesResult.push(img.transforms[0].location);
      }
    });
    const parseObject = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      considerations: req.body.considerations,
      sources:{
      typeFile: req.body.typeFile,
      images: imagesResult,
      video: req.body.video
      }, //images from Products
      publicPrice: {
        from: req.body.publicPriceFrom,
        to: req.body.publicPriceTo,
      }, //price
      prixerPrice: {
        from: req.body.prixerPriceFrom,
        to: req.body.prixerPriceTo,
      }, //prixerPrice
      attributes: req.body.attributes ? req.body.attributes : [], //activeAttributes
      active: req.body.active,
      variants: req.body.variants ? req.body.variants : [],
      hasSpecialVar: req.body.hasSpecialVar,
    };
    const productResult = await productServices.updateProduct(
      parseObject,
      req.params.id
    );
    data = {
      productResult,
      success: true,
    };
    return res.send(data);
  } catch (err) {
    res.status(500).send(err);
  }
}

async function deleteProduct(req, res) {
  const productResult = await productServices.deleteProduct(req.params.id);
  data = {
    productResult,
    success: true,
  };
  return res.send(data);
}

module.exports = {
  upload,
  createProduct,
  readById,
  readAllProducts,
  readAllProductsAdmin,
  updateProduct,
  deleteProduct,
};

// //CRUD END
