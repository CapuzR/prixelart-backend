const Product = require("./productModel")
const axios = require("axios")
const { readDiscountByFilter } = require('../discount/discountServices.js')
const Utils = require('./utils');

const createProduct = async (productData) => {
  try {
    const newProduct = await new Product(productData).save()
    if (newProduct) {
      return {
        success: true,
        productData: newProduct,
      }
    } else {
      return {
        success: false,
        message: "Disculpa, ocurrió un error desconocido, inténtalo de nuevo.",
      }
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

const readById = async (product) => {
  try {
    const readedProduct = await Product.find({ _id: product._id })
    if (readedProduct) {
      const data = {
        info: "Todos los productos disponibles",
        products: readedProduct,
      }
      return data
    } else {
      const data = {
        info: "No hay productos registrados",
        products: null,
      }
      return data
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

const readAllProducts = async () => {
  try {
    const readedProducts = await Product.find({ active: true })
    if (readedProducts) {
      const data = {
        info: "Todos los productos disponibles",
        products: readedProducts,
      }
      return data
    } else {
      const data = {
        info: "No hay productos registrados",
        arts: null,
      }
      return data
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

const readAllProducts_v2 = async (user = null, orderType = '', sortBy = '', initialPoint, productsPerPage) => {
  try {
    let data = {};

    // Query products and select required fields
    const readedProducts = await Product
      .find({ active: true })
      .select('name description priceRange sources variants');

    if (readedProducts) {
      let [products, maxLength] = await Utils.productDataPrep(readedProducts, user, orderType, sortBy, initialPoint, productsPerPage);

      data = {
        info: "Todos los productos disponibles",
        products: products,
        maxLength: maxLength
      };
    } else {
      data = {
        info: "No hay productos registrados",
        products: null,
      };
    }

    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
};



const readAllProductsAdmin = async () => {
  try {
    const readedProducts = await Product.find()

    readedProducts.sort((a, b) => {
      const nameA = a.name.toUpperCase()
      const nameB = b.name.toUpperCase()

      if (nameA < nameB) {
        return -1
      }
      if (nameA > nameB) {
        return 1
      }
      return 0
    })

    if (readedProducts) {
      const data = {
        info: "Todos los productos disponibles",
        products: readedProducts,
      }
      return data
    } else {
      const data = {
        info: "No hay productos registrados",
        products: null,
      }
      return data
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

const updateProduct = async (productData, productId) => {
  try {
    const updateProduct = await Product.findByIdAndUpdate(
      productId,
      productData,
      { new: true }
    )
    if (!updateProduct) {
      return console.log("Product update error: " + err)
    } else {
      return {
        message: "Actualización realizada con éxito.",
        product: updateProduct,
      }
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

const masiveUpdate = async (data) => {
  try {
    const updates = []
    await data.map(async (prod, i) => {
      const updatedProduct = await Product.findByIdAndUpdate(prod._id, prod)

      if (!updatedProduct) {
        updates.push(`${prod.name} : ${false}`)
      } else {
        updates.push(`${prod.name} : ${true}`)
      }
    })
    return {
      message: "Actualizaciones realizadas con éxito.",
      products: updates,
      success: true,
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

const updateMockup = async (data, id) => {
  try {
    delete data.adminToken
    const updateProduct = await Product.findByIdAndUpdate(id, { mockUp: data })
    if (!updateProduct) {
      return console.log("Product update error: " + err)
    } else return "Actualización realizada con éxito."
  } catch (error) {
    console.log(error)
    return error
  }
}

const searchUrl = async (id) => {
  try {
    const readedProduct = await Product.find({ _id: id })
    if (readedProduct.length === 0) {
      throw new Error(
        "producto no encontrado, tal vez o no es visible o no existe."
      )
    }

    const mockup = readedProduct[0].mockUp.mockupImg
    if (!mockup) {
      throw new Error("URL de imagen no encontrada.")
    }
    const response = await axios.get(mockup, { responseType: "arraybuffer" })
    const base64Image = Buffer.from(response.data, "binary").toString("base64")
    return `data:${response.headers["content-type"]};base64,${base64Image}`
  } catch (error) {
    console.error("Error fetching images:", error)
    throw error
  }
}

const deleteProduct = async (req) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    return "Producto eliminado exitosamente"
  } catch (error) {
    console.log(error)
    return error
  }
}

const getBestSellers = async (orders) => {
  try {
    const allProducts = await Product.find({})
    let products = []

    allProducts.map((prod) => {
      products.push({ name: prod.name, quantity: 0 })
    })

    await orders.orders.map(async (order) => {
      await order.requests.map(async (item) => {
        await products.find((element) => {
          if (element.name === item.product.name) {
            element.quantity = element.quantity + 1
          }
        })
      })
    })

    const prodv2 = products
      .sort(function (a, b) {
        return b.quantity - a.quantity
      })
      .slice(0, 10)

    const prodv3 = allProducts.filter((prod) =>
      prodv2.some((ref) => ref.name === prod.name)
    )

    const data = {
      info: "Estos son los productos más vendidos",
      ref: prodv2,
      products: prodv3,
    }
    return data
  } catch (error) {
    console.log(error)
    return error
  }
}
const deleteVariant = async (data) => {
  try {
    const selectedProduct = data.product
    const id = data.variant
    const productToUpdate = await Product.findById(selectedProduct)
    let variants = productToUpdate.variants.filter(
      (variant) => variant._id !== id
    )
    productToUpdate.variants = variants

    const updatedProduct = await Product.findByIdAndUpdate(
      selectedProduct,
      productToUpdate,
      { new: true }
    )
    if (!updatedProduct) {
      return console.log("Cannot delete variant:" + err)
    }
    return {
      message: "Variante eliminada con éxito",
      product: updatedProduct,
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

module.exports = {
  createProduct,
  readById,
  readAllProducts,
  readAllProducts_v2,
  readAllProductsAdmin,
  updateProduct,
  masiveUpdate,
  searchUrl,
  updateMockup,
  deleteProduct,
  getBestSellers,
  deleteVariant,
}
