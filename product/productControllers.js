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

const updateProduct = async (req, res) => {
  try {
    const productsVariants = JSON.parse(req.body.variants)
    if(req.body.variant_id !== undefined){
      const newResult = typeof req.body.productImages === 'string' ?
      [{
        type:'images',
        url: req.body.productImages
      }]
      :
      req.body.productImages.map((img,  i) => {
      switch (img[0]) {
        case 'h':
        return objParse = {
          type: 'images',
          url: img
        }
          break;
          case '<':
          return objParse = {
            type: 'video',
            url: img
          }
            break;
        default:
        return objParse ={
          type: 'images',
          url: img
        }
          break;
      }
    })
      req.body.images !== undefined?
      newVariantResult = typeof req.body.images === 'string' ?
      [{
        type: 'images',
        url: req.body.images
      }]
      :
      req.body.images.map((img,  i) => {
        switch (img[0]) {
          case 'h':
          return objParse = {
            type: 'images',
            url: img
          }
        break;
        case '<':
        return objParse = {
          type: 'video',
          url: img
        }
          break;
      default:
      return objParse ={
        type: 'images',
        url: img
      }
        break;
    }
  })
      :
      ''
    const variants = {
      _id: req.body.variant_id,
      variantImage: req.body.images ? newVariantResult : [],
      active: req.body.variantActive,
      name: req.body.variantName,
      description: req.body.variantDescription,
      category: req.body.variantCategory,
      considerations: req.body.variantConsiderations,
      attributes: typeof req.body.attributesName  === 'string' ? [{
        name: req.body.attributesName,
        value: req.body.attributesValue
      }]
      :
      []
      ,
      publicPrice: {
        from: req.body.variantPublicPriceFrom,
        to: req.body.variantPublicPriceTo,
        equation: req.body.variantPublicPriceEq
      }, //price
      prixerPrice: {
        from: req.body.variantPrixerPriceFrom,
        to: req.body.variantPrixerPriceTo,
        equation: req.body.variantPrixerPriceEq
      }
    }

    if(req?.files['variantImage']?.length > 0){
        req.files['variantImage'].map((img, i) => {
          variants.variantImage.push({
            type: "images",
            url: img.transforms[0].location,
          });
        });
      }
      if(req.body.video != ''){
        const currentVideo = newResult.find(result => result.type === 'video');
        if(currentVideo){
          currentVideo.url = req.body.video
        } else{
          variants.variantImage.push({
            type: 'video',
            url: req.body.video
          })
        }
      }

    if(typeof req.body.attributesName === 'object')
    {
      const a = req.body.attributesName.map((name, i) => {
        const b = req.body.attributesValue.map(value => {
          return value
        })
        return {
          name: name,
          value: b[i]
        }
    })
      variants.attributes.push(a)
    }
      const parseObject = {
        name: req.body.productName,
        description: req.body.productDescription,
        category: req.body.productCategory,
        considerations: req.body.productConsiderations,
        sources: {
          images: newResult,
          // video: req.body.productPideo
        }, //images from Products
        publicPrice: {
          from: req.body.productPublicPriceFrom,
          to: req.body.productPublicPriceTo,
        }, //price
        prixerPrice: {
          from: req.body.productPrixerPriceFrom,
          to: req.body.productPrixerPriceTo,
        }, //prixerPrice
        attributes: req.body.attributes ? req.body.attributes : [], //activeAttributes
        active: req.body.productActive,
        variants: productsVariants != undefined ? productsVariants : [],
        hasSpecialVar: req.body.productHasSpecialVar,
      };
      parseObject.variants.push(variants);
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
      const imagesResult =
        req?.files["newProductImages"]?.length > 0
          ? typeof req.body.images === "string"
            ? [req.body.images]
            : req.body.images
          : typeof req.body.images === "string"
          ? [req.body.images]
          : req.body.images;

      const newResult = imagesResult?.map((img, i) => {
        switch (img[0]) {
          case "h":
            return {
              type: 'images',
              url: img
            }
              break;
              case '<':
              return {
                type: 'video',
                url: img 
              }
                break;
            default:
              break;
          }
        })
        if(req?.files['newProductImages']?.length > 0){
            req?.files['newProductImages']?.map((img, i) => {
              newResult?.push({
                type: 'images',
                url : img.transforms[0].location
              })
            })
          }
          if(req.body.video === ''){
            const currentVideo = newResult.find(result => result?.type === 'video');
            if(currentVideo){
              const indexVideo = newResult.indexOf(currentVideo)
              imagesResult.splice(indexVideo, 1)
            }
          } else{
              const currentVideo = newResult.find(result => result.type === 'video');
              if(currentVideo){
                currentVideo.url = req.body.video
              } else{
                newResult.push({
                  type: 'video',
                  url: req.body.video
                })
              }
          }
    const parseObject = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      considerations: req.body.considerations,
      sources:{
      images: newResult,
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
      variants: req.body.variants != undefined ? productsVariants : [],
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
