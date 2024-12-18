const multer = require("multer")
const multerS3 = require("multer-s3-transform")
const sharp = require("sharp")
const aws = require("aws-sdk")
const { nanoid } = require("nanoid")
const productServices = require("./productServices")
const adminAuthServices = require("../admin/adminServices/adminAuthServices")
const orderServices = require("../order/orderService")

const spacesEndpoint = new aws.Endpoint(process.env.PRIVATE_BUCKET_URL)
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_ACCESS_KEY,
  secretAccessKey: process.env.DO_ACCESS_SECRET,
})

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.PUBLIC_BUCKET_NAME,
    acl: "public-read",
    shouldTransform: function (req, file, cb) {
      cb(null, /^image/i.test(file.mimetype))
    },
    transforms: [
      {
        id: "largeThumb",
        key: function (req, file, cb) {
          cb(null, nanoid(7) + "-large.webp")
        },
        transform: function (req, file, cb) {
          cb(null, sharp().webp({ quality: 100 }))
        },
      },
    ],
  }),
})

//CRUD

const createProduct = async (req, res, next) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    )
    if (checkPermissions.role.createProduct) {
      const imagesResult = []
      if (req.files) {
        req.files.map((img, i) => {
          imagesResult.push({
            type: "images",
            url: img.transforms[0].location,
          })
        })
      }
      if (req.body.video) {
        imagesResult.push({
          type: "video",
          url: req.body.video,
        })
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
        autoCertified: req.body.autoCertified,
      }
      res.send(await productServices.createProduct(parseObject))
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      })
    }
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

const readById = async (req, res) => {
  try {
    const readedProduct = await productServices.readById(req.body)
    res.send(readedProduct)
  } catch (err) {
    res.status(500).send(err)
  }
}

const readById_v2 = async (req, res) => {
  try {
    const readedProduct = await productServices.readById_v2(req.body._id, req.body.inter)
    res.send(readedProduct)
  } catch (err) {
    res.status(500).send(err)
  }
}

const readAllProducts = async (req, res) => {
  try {
    const readedProducts = await productServices.readAllProducts()
    res.send(readedProducts)
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

const readAllProducts_v2 = async (req, res) => {
  try {
    const readedProducts = await productServices.readAllProducts_v2(
      req.user,
      req.query.orderType,
      req.query.sortBy,
      req.query.initialPoint,
      req.query.productsPerPage,
      req.query.query
    )
    res.send(readedProducts)
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

const readAllProductsAdmin = async (req, res) => {
  try {
    const readedProducts = await productServices.readAllProductsAdmin()
    res.send(readedProducts)
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

const readInter = async (req, res) => {
  try {
    const readedProducts = await productServices.readInter(
      req.user,
      req.query.orderType,
      req.query.sortBy,
      req.query.initialPoint,
      req.query.productsPerPage
    )
    res.send(readedProducts)
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

const updateProduct = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    )
    if (checkPermissions.role.createProduct) {
      const productsVariants = JSON.parse(req.body.variants)
      let newResult = []
      const previousImg = req.body.images.split(" ")
      if (
        previousImg[0] !== null &&
        previousImg !== " "
        // && previousImg.includes("newProductImages")
      ) {
        newResult.push({ type: "images", url: previousImg })
      } else if (previousImg && previousImg.length > 1) {
        previousImg.map((img, i) => {
          // img.includes("newProductImages") &&
          newResult.push({
            type: "images",
            url: img.replace(/[,]/gi, "").trim(),
          })
        })
      }

      if (req.files["newProductImages"] !== undefined) {
        req.files["newProductImages"].map((img, i) => {
          newResult.push({
            type: "images",
            url: img.transforms[0].location,
          })
        })
      }
      if (req.body.video) {
        newResult.push({
          type: "video",
          url: req.body.video,
        })
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
        autoCertified: req.body.autoCertified,
      }
      const productResult = await productServices.updateProduct(
        parseObject,
        req.params.id
      )
      data = {
        productResult,
        product: parseObject,
        success: true,
      }
      return res.send(data)
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      })
    }
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

const updateAll = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.cookies.adminToken
    )
    if (checkPermissions.role.createProduct) {
      const masiveUpdate = await productServices.updateAll()
      res.send(masiveUpdate)
    } else {
      return {
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      }
    }
  } catch (error) {
    c
  }
}

const changeVisibility = async (req, res) => {
  try {
    console.log(req.params.id)
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.cookies.adminToken
    )
    if (checkPermissions.role.createProduct) {
      const rapidUpdate = await productServices.changeVisibility(
        req.params.id,
        req.body
      )
      res.send(rapidUpdate)
    }
  } catch (error) {
    changeVisibility
  }
}

const updateMany = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    )
    if (checkPermissions.role.createProduct) {
      const masiveUpdate = await productServices.masiveUpdate(req.body.products)
      return res.send(masiveUpdate)
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

const updateMockup = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    )
    if (checkPermissions.role.createProduct) {
      const mockUp = req?.body
      if (req.file !== undefined) {
        mockUp.mockupImg = req.file.transforms[0].location
      }
      const result = await productServices.updateMockup(mockUp, req.params.id)
      data = {
        result: result,
        success: true,
        message: "Actualización realizada exitosamente",
      }
      return res.send(data)
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

const readUrl = async (req, res) => {
  try {
    const readedImg = await productServices.searchUrl(req.params.productId)
    if (readedImg) {
      res.setHeader("Content-Type", "image/jpeg")
      res.send(readedImg)
    } else {
      res.status(404).send("Imagen no encontrada")
    }
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

const readBestSellers = async (req, res) => {
  try {
    const allOrders = await orderServices.readAllOrders()
    const getBestSellers = await productServices.getBestSellers(allOrders)
    res.send(getBestSellers)
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

const updateVariants = async (req, res) => {
  try {
    let checkPermissions = await adminAuthServices.checkPermissions(
      req.body.adminToken
    )
    if (checkPermissions.role.createProduct) {
      const product = { _id: req.params.id }
      const productToUpdate = await productServices.readById(product)
      const productv2 = productToUpdate.products[0]

      const newVariant = {
        _id: req.body.variant_id,
        variantImage: [],
        active: Boolean(req.body.variantActive),
        inter: Boolean(req.body.inter),
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
        cost: Number(req.body.variantPrice.replace(/[,]/gi, ".")),
        publicPrice: {
          from: Number(req.body.variantPublicPriceFrom?.replace(/[,]/gi, ".")),
          to: Number(req.body.variantPublicPriceTo?.replace(/[,]/gi, ".")),
          equation: Number(
            req.body.variantPublicPriceEq?.replace(/[,]/gi, ".")
          ),
        },
        prixerPrice: {
          from: Number(req.body.variantPrixerPriceFrom?.replace(/[,]/gi, ".")),
          to: Number(req.body.variantPrixerPriceTo?.replace(/[,]/gi, ".")),
          equation: Number(
            req.body.variantPrixerPriceEq?.replace(/[,]/gi, ".")
          ),
        },
      }
      const previousImg = req.body.images.split(" ")

      if (
        previousImg &&
        typeof previousImg === "string" &&
        previousImg.includes("digitalocean")
      ) {
        newVariant.variantImage.push({
          type: "images",
          url: previousImg,
        })
      } else if (previousImg && previousImg.length > 1) {
        previousImg.map((img) => {
          img.includes("digitalocean") &&
            newVariant.variantImage.push({
              type: "images",
              url: img.trim().replace(/[,]/gi, ""),
            })
        })
      }
      if (req.body.video !== undefined && req.body.video !== "undefined") {
        newVariant.variantImage.push({
          type: "video",
          url: req.body.video,
        })
      }
      if (req.files !== undefined) {
        req.files.map((img, i) => {
          newVariant.variantImage.push({
            type: "images",
            url: img.transforms[0].location,
          })
        })
      }
      if (typeof req.body.attributesName === "object") {
        const a = req.body.attributesName.map((name, i) => {
          const b = req.body.attributesValue.map((value) => {
            return value
          })
          return {
            name: name,
            value: b[i],
          }
        })
        newVariant.attributes.push(a)
      }

      if (productv2.variants.length > 0) {
        const newArray = productv2.variants.filter(
          (variant, i) => variant._id !== newVariant._id
        )
        productv2.variants = newArray
      } else {
        productv2.variants = []
      }
      productv2.variants.push(newVariant)
      productv2.hasInternationalV = productv2.variants.some(
        (item) => item.inter === true
      )

      const productResult = await productServices.updateProduct(
        productv2,
        req.params.id
      )
      data = {
        productResult,
        success: true,
      }
      return res.send(data)
    } else {
      return res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      })
    }
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

async function deleteProduct(req, res) {
  let checkPermissions = await adminAuthServices.checkPermissions(
    req.body.adminToken
  )
  if (checkPermissions.role.createProduct) {
    const productResult = await productServices.deleteProduct(req)
    data = {
      productResult,
      success: true,
    }
    return res.send(data)
  } else {
    return res.send({
      success: false,
      message: "No tienes autorización para realizar esta acción.",
    })
  }
}

async function deleteVariant(req, res) {
  let checkPermissions = await adminAuthServices.checkPermissions(
    req.body.adminToken
  )
  if (checkPermissions.role.createProduct) {
    const variantToDelete = await productServices.deleteVariant(req.body)
    data = { variantToDelete, success: true }
    return res.send(data)
  } else {
    return res.send({
      success: false,
      message: "No tienes autorización para realizar esta acción.",
    })
  }
}

const createCategory = async (req, res) => {
  try {
    const cat = {
      active: Boolean(req.body.active),
      name: req.body.name,
      appliedProducts: req.body.appliedProducts,
    }
    res.send(await productServices.createCategory(cat))
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

const updateCategory = async (req, res) => {
  try {
    const cat = {
      active: Boolean(req.body.active),
      name: req.body.name,
      appliedProducts: req.body.appliedProducts,
    }
    res.send(await productServices.updateCategory(req.params.id, cat))
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

const readAllCategories = async (req, res) => {
  try {
    const categories = await productServices.readAllCategories()
    res.send(categories)
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

const readActiveCategories = async (req, res) => {
  try {
    const categories = await productServices.readActiveCategories()
    res.send(categories)
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

const deleteCategory = async (req, res) => {
  try {
    const categoryDeleted = await productServices.deleteCategory(req.params.id)
    data = {
      categoryDeleted,
      success: true,
    }
    return res.send(data)
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

module.exports = {
  upload,
  createProduct,
  readById,
  readAllProducts,
  readAllProducts_v2,
  readAllProductsAdmin,
  readInter,
  updateProduct,
  updateMany,
  changeVisibility,
  updateAll,
  updateMockup,
  readUrl,
  readBestSellers,
  deleteProduct,
  updateVariants,
  deleteVariant,
  readById_v2,
  createCategory,
  updateCategory,
  readAllCategories,
  readActiveCategories,
  deleteCategory,
}

// //CRUD END
