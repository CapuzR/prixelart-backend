const multer = require("multer");
const multerS3 = require("multer-s3-transform");
const sharp = require("sharp");
const aws = require("aws-sdk");
const { nanoid } = require("nanoid");
const productServices = require("./productServices");
const adminAuthServices = require("../admin/adminServices/adminAuthServices");
const orderServices = require("../order/orderService");

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

//CRUD

const createProduct = async (req, res, next) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.createProduct) {
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
        cost: req.body.cost,
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
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.createProduct) {
      const productsVariants = JSON.parse(req.body.variants);
      let newResult = [];
      const previousImg = req.body.images.split(" ");
      if (
        previousImg[0] !== null &&
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
        cost: req.body.cost,
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

const updateMany = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.createProduct) {
      const masiveUpdate = await productServices.masiveUpdate(
        req.body.products
      );
      return res.send(masiveUpdate);
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

const updateMockup = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.createProduct) {
      const mockUp = req.body;
      if (req.file !== undefined) {
        mockUp.mockupImg = req.file.transforms[0].location;
      }
      const result = await productServices.updateMockup(mockUp, req.params.id);
      data = {
        result: result,
        success: true,
        message: "Actualización realizada exitosamente",
      };
      return res.send(data);
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

const readBestSellers = async (req, res) => {
  try {
    const allOrders = await orderServices.readAllOrders();
    const getBestSellers = await productServices.getBestSellers(allOrders);
    res.send(getBestSellers);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
const updateVariants = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    );
    if (checkPermissions.role.createProduct) {
      const product = { _id: req.params.id };
      const productToUpdate = await productServices.readById(product);
      const productv2 = productToUpdate.products[0];
      const newVariant = {
        _id: req.body.variant_id,
        variantImage: [],
        active: req.body.variantActive === "true" ? true : false,
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
        cost: req.body.variantPrice,
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
      if (productv2.variants.length > 0) {
        const newArray = productv2.variants.filter(
          (variant, i) => variant._id !== newVariant._id
        );
        newArray.push(newVariant);
        productv2.variants = newArray;
      } else {
        productv2.variants = [newVariant];
      }
      const productResult = await productServices.updateProduct(
        productv2,
        req.params.id
      );
      data = {
        productResult,
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

async function deleteProduct(req, res) {
  let checkPermissions = await adminAuthServices.checkPermissions(
    req.body.adminToken
  );
  if (checkPermissions.role.createProduct) {
    const productResult = await productServices.deleteProduct(req);
    data = {
      productResult,
      success: true,
    };
    return res.send(data);
  } else {
    return res.send({
      success: false,
      message: "No tienes autorización para realizar esta acción.",
    });
  }
}

async function deleteVariant(req, res) {
  let checkPermissions = await adminAuthServices.checkPermissions(
    req.body.adminToken
  );
  if (checkPermissions.role.createProduct) {
    const variantToDelete = await productServices.deleteVariant(req.body);
    data = { variantToDelete, success: true };
    return res.send(data);
  } else {
    return res.send({
      success: false,
      message: "No tienes autorización para realizar esta acción.",
    });
  }
}

module.exports = {
  upload,
  createProduct,
  readById,
  readAllProducts,
  readAllProductsAdmin,
  updateProduct,
  updateMany,
  updateMockup,
  readBestSellers,
  deleteProduct,
  updateVariants,
  deleteVariant,
};

// //CRUD END
