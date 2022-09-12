const multer  = require('multer');
const multerS3 = require('multer-s3-transform');
const dotenv = require('dotenv');
const sharp = require('sharp');
const aws = require('aws-sdk');
const { nanoid } = require('nanoid');
const productServices = require( "./productServices" );

const spacesEndpoint = new aws.Endpoint(process.env.PRIVATE_BUCKET_URL);
const s3 = new aws.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.DO_ACCESS_KEY,
    secretAccessKey: process.env.DO_ACCESS_SECRET
});

const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.PUBLIC_BUCKET_NAME,
      acl: 'public-read',
      shouldTransform: function (req, file, cb) {
        req.body.Id = nanoid(7); //=> "5-JDFkc"
        cb(null, /^image/i.test(file.mimetype))
      },
      transforms: [{
        id: 'largeThumb',
        key: function (req, file, cb) {
          cb(null, file.fieldname  + '-' + req.body.Id + '-large.webp')
        },
        transform: function (req, file, cb) {
          cb(null, sharp().resize(300, 300).webp({ quality: 80 }));
      }
    }
    ]
    })
  })

//CRUD

const createProduct = async (req, res, next)=> {
    const imagesResult = [];
      req.files.map(img =>
      {
        img.transforms.map(url => imagesResult.push(url.location))
      })
      req.body.images = imagesResult;
      res.send(await productServices.createProduct(req.body));
}

const readById = async (req, res)=> {
  try {
    const readedProduct = await productServices.readById(req.body);
    res.send(readedProduct);
  } catch (err) {
    res.status(500).send(err);
  }
}

const readAllProducts = async (req, res)=> {
  try {
    const readedProducts = await productServices.readAllProducts();
    res.send(readedProducts);
  } catch (err) {
    res.status(500).send(err);
  }
}

const readAllProductsAdmin = async (req, res)=> {
  try {
    const readedProducts = await productServices.readAllProductsAdmin();
    res.send(readedProducts);
  } catch (err) {
    res.status(500).send(err);
  }
}

async function updateProduct (req, res) {
  try {
    const product = req.body;
    const productResult = await productServices.updateProduct(product);
    data = {
        productResult,
        success: true
    }
    return res.send(data);
  } catch (err) {
    res.status(500).send(err);
  }
}

module.exports = { upload, createProduct, readById, readAllProducts, readAllProductsAdmin, updateProduct }

// //CRUD END
