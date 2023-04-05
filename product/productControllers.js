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
    const imagesResult = [];
    if (req.body.video && req.files) {
      req.files.map((img, i) => {
        imagesResult.push({
          type: "images",
          url: img.transforms[0].location,
        });
      });
      imagesResult.push({
        type: "video",
        url: req.body.video,
      });
    } else if (req.body.video && req.files == undefined) {
      imagesResult.push({
        type: "video",
        url: req.body.video,
      });
    } else {
      req.files.map((img, i) => {
        imagesResult.push({
          type: "images",
          url: img.transforms[0].location,
        });
      });
    }
    const parseObject = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      considerations: req.body.considerations,
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
    const productsVariants = JSON.parse(req.body.variants);
    if (req.body.variant_id !== undefined) {
      const newResult =
        typeof req.body.productImages === "string"
          ? [
              {
                type: "images",
                url: req.body.productImages,
              },
            ]
          : req.body.productImages.map((img, i) => {
              switch (img[0]) {
                case "h":
                  return (objParse = {
                    type: "images",
                    url: img,
                  });
                  break;
                case "<":
                  return (objParse = {
                    type: "video",
                    url: img,
                  });
                  break;
                default:
                  return (objParse = {
                    type: "images",
                    url: img,
                  });
                  break;
              }
            });

      // let newVariantResult = [];
      // if (req.body.images !== undefined) {
      //   newVariantResult =
      //     typeof req.body.images === "string"
      //       ? [
      //           {
      //             type: "images",
      //             url: req.body.images,
      //           },
      //         ]
      //       : req.body.images.length > 1 &&
      //         req.body.images.map((img, i) => {
      //           if (img.type === "images") {
      //             newVariantResult.push({
      //               type: "images",
      //               url: img.url,
      //             });
      //           } else if (img.type === "video") {
      //             newVariantResult.push({
      //               type: "video",
      //               url: img.url,
      //             });
      //           }
      //         });
      // }

      const variants = [];
      const newVariant = {
        _id: req.body.variant_id,
        variantImage: [],
        active: Boolean(req.body.variantActive),
        name: req.body.variantName,
        description: req.body.variantDescription,
        category: req.body.variantCategory,
        considerations: req.body.variantConsiderations,
        attributes:
          typeof req.body.attributesName === "string"
            ? [
                {
                  name: req.body.attributesName,
                  value: req.body.attributesValue,
                },
              ]
            : [],
        publicPrice: {
          from: req.body.variantPublicPriceFrom,
          to: req.body.variantPublicPriceTo,
          equation: req.body.variantPublicPriceEq,
        }, //price
        prixerPrice: {
          from: req.body.variantPrixerPriceFrom,
          to: req.body.variantPrixerPriceTo,
          equation: req.body.variantPrixerPriceEq,
        },
      };

      if (req.files["variantImage"]?.length > 0) {
        req.files["variantImage"].map((img, i) => {
          newVariant.variantImage.push({
            type: "images",
            url: img.transforms[0].location,
          });
        });
      }

      const previousImg = req.body.images.split(" ");
      if (previousImg !== undefined) {
        previousImg &&
          previousImg.map((img) => {
            img.includes("variantImage") &&
              newVariant.variantImage.push({
                type: "images",
                url: img.replace(/[,]/gi, ""),
              });
          });
      }
      if (req.body.video !== undefined && req.body.video !== "undefined") {
        newVariant.variantImage.push({
          type: "video",
          url: req.body.video,
        });
      }

      if (productsVariants !== []) {
        productsVariants.map((prevVariant) => {
          variants.push(prevVariant);
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

      if (variants !== []) {
        variants.map((variant, i) => {
          if (variant._id === newVariant._id) {
            variants.splice(i, 1, newVariant);
          } else {
            return;
          }
        });
      }

      const parseObject = {
        name: req.body.productName,
        description: req.body.productDescription,
        category: req.body.productCategory,
        considerations: req.body.productConsiderations,
        productionTime: req.body.productionTime,
        sources: {
          images: newResult,
        },
        publicPrice: {
          from: req.body.productPublicPriceFrom,
          to: req.body.productPublicPriceTo,
        },
        prixerPrice: {
          from: req.body.productPrixerPriceFrom,
          to: req.body.productPrixerPriceTo,
        },
        attributes: req.body.attributes ? req.body.attributes : [],
        active: req.body.productActive,
        variants: variants.map((variant) => {
          if (variant._id !== null && variant._id !== undefined) {
            return variant;
          } else {
            undefined;
          }
        }),
        hasSpecialVar: req.body.productHasSpecialVar,
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
    } else {
      let newResult = [];
      const previousImg = req.body.images.split(" ");

      if (
        previousImg &&
        typeof previousImg === "string" &&
        previousImg.includes("newProductImages")
      ) {
        newResult.push({ type: "images", url: previousImg });
      } else if (previousImg && previousImg.length > 1) {
        previousImg.map((img, i) => {
          img.includes("newProductImages") &&
            newResult.push({ type: "images", url: img.replace(/[,]/gi, "") });
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

      if (req.body.video !== undefined) {
        newResult.push({
          type: "video",
          url: req.body.video,
        });
      }

      let variants = [];
      if (productsVariants) {
        variants = productsVariants;
      }

      const newVariant = {
        _id: req.body.variant_id,
        variantImage: req.body.images ? newResult : [],
        active: req.body.variantActive,
        name: req.body.variantName,
        description: req.body.variantDescription,
        category: req.body.variantCategory,
        considerations: req.body.variantConsiderations,
        attributes:
          typeof req.body.attributesName === "string"
            ? [
                {
                  name: req.body.attributesName,
                  value: req.body.attributesValue,
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

      if (req.files["variantImage"]?.length > 0) {
        req.files["variantImage"].map((img, i) => {
          variants.variantImage.push({
            type: "images",
            url: img.transforms[0].location,
          });
        });
      }

      if (variants !== []) {
        variants.map((variant, i) => {
          if (variant._id === newVariant._id) {
            variants.splice(i, 1, newVariant);
          } else {
            return;
          }
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
        attributes: req.body.attributes ? req.body.attributes : [],
        active: req.body.active,
        variants: variants,
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
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

async function deleteProduct(req, res) {
  const productResult = await productServices.deleteProduct(req.params.id);
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
  deleteProduct,
  deleteVariant,
};

// //CRUD END
