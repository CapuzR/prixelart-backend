const multer = require("multer");
const multerS3 = require("multer-s3-transform");
const dotenv = require("dotenv");
const sharp = require("sharp");
const aws = require("aws-sdk");
const { nanoid } = require("nanoid");
const productServices = require("./productServices");
const jwt = require("jsonwebtoken");
const adminRoleModel = require("../admin/adminRoleModel");
const {
  checkPermissions,
} = require("../admin/adminServices/adminAuthServices");

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
      // req.body.Id = nanoid(7); //=> "5-JDFkc"
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

//CRUD

const createProduct = async (req, res, next) => {
  try {
    let checkPermissions = await checkPermissions(req.body.adminToken);
    console.log(checkPermissions);
    if (checkPermissions.createProduct) {
      const imagesResult = [];
      if (req.files) {
        req.files.map((img, i) => {
          imagesResult.push({
            type: "images",
            url: img.transforms[0].location,
          });
        });
      }
      if (req.body.video) {
        imagesResult.push({
          type: "video",
          url: req.body.video,
        });
      }
      const parseObject = {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        considerations: req.body.considerations,
        productionTime: req.body.productionTime,
        sources: {
          images: imagesResult,
          // video: req.body.video
        },
        publicPrice: {
          from: req.body.publicPriceFrom,
          to: req.body.publicPriceTo,
        },
        prixerPrice: {
          from: req.body.prixerPriceFrom,
          to: req.body.prixerPriceTo,
        },
        attributes: req.body.attributes ? req.body.attributes : [],
        active: req.body.active,
        variants: req.body.variants ? req.body.variants : [],
        hasSpecialVar: req.body.hasSpecialVar,
      };
      res.send(await productServices.createProduct(parseObject));
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
    console.log(err);
    res.status(500).send(err);
  }
};

const readAllProductsAdmin = async (req, res) => {
  try {
    const readedProducts = await productServices.readAllProductsAdmin();
    res.send(readedProducts);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const updateProduct = async (req, res) => {
  try {
    let checkPermissions = await checkPermissions(req.body.adminToken);
    console.log(checkPermissions);
    if (checkPermissions.createProduct) {
      const productsVariants = JSON.parse(req.body.variants);
      let newResult = [];
      const previousImg = req.body.images.split(" ");
      if (
        previousImg !== [] &&
        previousImg !== " " &&
        previousImg.includes("newProductImages")
      ) {
        newResult.push({ type: "images", url: previousImg });
      } else if (previousImg && previousImg.length > 1) {
        previousImg.map((img, i) => {
          img.includes("newProductImages") &&
            newResult.push({
              type: "images",
              url: img.replace(/[,]/gi, "").trim(),
            });
        });
      }

      if (req.files["newProductImages"] !== undefined) {
        req.files["newProductImages"].map((img, i) => {
          newResult.push({
            type: "images",
            url: img.transforms[0].location,
          });
        });
      }
      if (req.body.video) {
        newResult.push({
          type: "video",
          url: req.body.video,
        });
      }
      const parseObject = {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        considerations: req.body.considerations,
        productionTime: req.body.productionTime,
        sources: { images: newResult },
        publicPrice: {
          from: req.body.publicPriceFrom,
          to: req.body.publicPriceTo,
        },
        prixerPrice: {
          from: req.body.prixerPriceFrom,
          to: req.body.prixerPriceTo,
        },
        thumbUrl: req.body.thumbUrl,
        attributes: req.body.attributes ? req.body.attributes : [],
        active: req.body.active,
        variants: productsVariants,
        hasSpecialVar: req.body.hasSpecialVar,
      };
      const productResult = await productServices.updateProduct(
        parseObject,
        req.params.id
      );
      data = {
        productResult,
        product: parseObject,
        success: true,
      };
      return res.send(data);
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

const updateVariants = async (req, res) => {
  try {
    const product = { _id: req.params.id };
    const productToUpdate = await productServices.readById(product);
    const productv2 = productToUpdate.products[0];

    const newVariant = {
      _id: req.body.variant_id,
      variantImage: [],
      active: Boolean(req.body.variantActive),
      name: req.body.variantName,
      description: req.body.variantDescription,
      category: req.body.variantCategory,
      considerations: req.body.variantConsiderations,
      attributes:
        typeof req.body.attributesName0 === "string" &&
        typeof req.body.attributesName1 === "string"
          ? [
              {
                name: req.body.attributesName0,
                value: req.body.attributesValue0,
              },
              {
                name: req.body.attributesName1,
                value: req.body.attributesValue1,
              },
            ]
          : typeof req.body.attributesName0 === "string"
          ? [
              {
                name: req.body.attributesName0,
                value: req.body.attributesValue0,
              },
            ]
          : [],
      publicPrice: {
        from: req.body.variantPublicPriceFrom,
        to: req.body.variantPublicPriceTo,
        equation: req.body.variantPublicPriceEq,
      },
      prixerPrice: {
        from: req.body.variantPrixerPriceFrom,
        to: req.body.variantPrixerPriceTo,
        equation: req.body.variantPrixerPriceEq,
      },
    };
    const previousImg = req.body.images.split(" ");
    if (
      previousImg &&
      typeof previousImg === "string" &&
      previousImg.includes("variantImage")
    ) {
      newVariant.variantImage.push({
        type: "images",
        url: previousImg,
      });
    } else if (previousImg && previousImg.length > 1) {
      previousImg.map((img) => {
        img.includes("variantImage") &&
          newVariant.variantImage.push({
            type: "images",
            url: img.trim().replace(/[,]/gi, ""),
          });
      });
    }
    if (req.body.video !== undefined && req.body.video !== "undefined") {
      newVariant.variantImage.push({
        type: "video",
        url: req.body.video,
      });
    }
    if (req.files !== undefined) {
      req.files.map((img, i) => {
        newVariant.variantImage.push({
          type: "images",
          url: img.transforms[0].location,
        });
      });
    }
    if (typeof req.body.attributesName === "object") {
      const a = req.body.attributesName.map((name, i) => {
        const b = req.body.attributesValue.map((value) => {
          return value;
        });
        return {
          name: name,
          value: b[i],
        };
      });
      newVariant.attributes.push(a);
    }

    if (productv2.variants !== []) {
      productv2.variants.map((variant, i) => {
        if (variant._id === newVariant._id) {
          productv2.variants.splice(i, 1);
        }
      });
    }

    productv2.variants.push(newVariant);

    const productResult = await productServices.updateProduct(
      productv2,
      req.params.id
    );
    data = {
      productResult,
      success: true,
    };
    return res.send(data);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

async function deleteProduct(req, res) {
  const productResult = await productServices.deleteProduct(req);
  data = {
    productResult,
    success: true,
  };
  return res.send(data);
}

async function deleteVariant(req, res) {
  const variantToDelete = await productServices.deleteVariant(req.body);
  data = { variantToDelete, success: true };
  return res.send(data);
}
module.exports = {
  upload,
  createProduct,
  readById,
  readAllProducts,
  readAllProductsAdmin,
  updateProduct,
  updateVariants,
  deleteProduct,
  deleteVariant,
};

// //CRUD END
