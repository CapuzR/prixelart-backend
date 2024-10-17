const Product = require("./productModel")
const Category = require("./categoryModel.js")
const axios = require("axios")
const { applyDiscounts } = require('../discount/discountServices.js')
const Utils = require('./utils');
const { readOneById } = require('../art/artServices');
const { readDiscountByFilter } = require("../discount/discountServices.js")
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

const readById_v2 = async (id, user) => {
  try {
    const readedProduct = await Product
    .find({ _id: id })
    .select('name description priceRange sources variants')
    let product = readedProduct[0];
    const variants = readedProduct[0].variants.map(({_id, name, attributes})=>{ return {_id, name, attributes} });
    const attributes = Utils.getUniqueAttributesFromVariants(readedProduct[0].variants);
    const productPriceRange = await getPriceRange(readedProduct[0].variants, user, product.name);
    if (attributes) {
      const data = {
        info: "Todos los productos disponibles",
        variants: variants,
        attributes: attributes,
        product: { ...product.toObject(), priceRange: productPriceRange },
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

const getVariantPrice = async (user = null, variantId, artId = null) => {
  try {
    const product = await Product.findOne({ "variants._id": variantId  });
    if (!product || !product.variants || product.variants.length === 0) {
      return null;
    }
    const variant = product.variants[0];

    let equation = null;

    if (user && variant.prixerPrice) {
      equation = variant.prixerPrice.equation;
    } else if (!user && variant.publicPrice) {
      equation = variant.publicPrice.equation;
    }

    const price = Utils.parseAndFormatNumber(equation);

    if (price !== null) {
      const finalPrice = await applyFeesAndDiscounts(price, product.name, user?.id, artId);
      return Utils.formatPrice(finalPrice);
    }
  } catch (error) {
    console.error('Error in productService.getVariantPrice:', error);
    throw error;
  }
};

const applyFeesAndDiscounts = async (price, productName, userId, artId) => {
  
  const postArtFeePrice = artId ? price / (1 - (await getPrixerFee(artId))) : price / (1 - 0.1);
  //surcharges here
  const [finalPrice] = await applyDiscounts([userId ? price : postArtFeePrice], productName, userId);
  return finalPrice;

};

const getPrixerFee = async (artId) => {
  try {
    const artData = await readOneById(artId);

    const commission = artData?.arts?.comission;

    if (commission) {
      return commission / 100;
    } else {
      throw new Error('Commission data not found for the given artId');
    }
  } catch (error) {
    console.error(`Error retrieving Prixer fee for artId ${artId}:`, error);
    throw error;
  }
};

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

const readAllProducts_v2 = async (
  user = null,
  orderType = "",
  sortBy = "",
  initialPoint,
  productsPerPage
) => {
  try {
    let data = {}

    // Query products and select required fields
    const readedProducts = await Product.find({ active: true }).select(
      "name description priceRange sources variants"
    )

    if (readedProducts) {
      let [products, maxLength] = await productDataPrep(readedProducts, user, orderType, sortBy, initialPoint, productsPerPage);

      data = {
        info: "Todos los productos disponibles",
        products: products,
        maxLength: maxLength,
      }
    } else {
      data = {
        info: "No hay productos registrados",
        products: null,
      }
    }

    return data
  } catch (error) {
    console.log(error)
    return error
  }
};

const productDataPrep = async (products, user, orderType, sortBy, initialPoint, productsPerPage) => {
  const productsRes = await Promise.all(
    products.map(async (product) => {
      try {
        const priceRange = await getPriceRange(product.variants, user, product.name);
        if (priceRange || product.priceRange) {
          return {
            id: product._id,
            name: product.name,
            description: product.description,
            sources: product.sources,
            priceRange: priceRange || product.priceRange,
          };
        }
        return null;
      } catch (error) {
        console.error(`Error processing product ${product.name}:`, error);
        return null;
      }
    })
  );
  const validProducts = productsRes.filter(product => product !== null);
  const sortDirection = orderType === 'asc' ? 1 : -1;
  const sortedProducts = Utils.sortProducts(validProducts, sortBy, sortDirection);
  const paginatedProducts = sortedProducts.slice(
    Number(initialPoint),
    Number(initialPoint) + Number(productsPerPage)
  );
  return [paginatedProducts, sortedProducts.length];
};

const getPriceRange = async (variants, user, productName) => {
  let minPrice = Infinity;
  let maxPrice = -Infinity;

  variants?.forEach((variant) => {
    const price = Utils.parseAndFormatNumber(
      user && variant.prixerPrice
        ? variant.prixerPrice.equation
        : !user && variant.publicPrice
        ? variant.publicPrice.equation
        : null
    );

    if (price !== null) {
      minPrice = Math.min(minPrice, price);
      maxPrice = Math.max(maxPrice, price);
    }
  });

  if (minPrice !== Infinity && maxPrice !== -Infinity) {
    const finalMinPrice = await applyFeesAndDiscounts(minPrice, productName, user?.id);
    const finalMaxPrice = await applyFeesAndDiscounts(maxPrice, productName, user?.id);
    return {
      from: Utils.formatPrice(finalMinPrice),
      to: Utils.formatPrice(finalMaxPrice),
    };
  }

  return null;
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

const createCategory = async (cat) => {
  try {
    const newCategory = await new Category(cat).save()
    if (newCategory) {
      return {
        success: true,
        categoryData: newCategory,
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

const updateCategory = async (id, cat) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(id, cat, {
      new: true,
    })
    if (updatedCategory) {
      return {
        success: true,
        categoryData: updatedCategory,
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

const readAllCategories = async () => {
  try {
    const readedCategories = await Category.find()
    if (readedCategories) {
      const data = {
        info: "Todas las categorías existentes",
        categories: readedCategories,
      }
      return data
    } else {
      const data = {
        info: "No hay categorías registrados",
        arts: null,
      }
      return data
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

const readActiveCategories = async () => {
  try {
    const readedCategories = await Category.find({ active: true })
    if (readedCategories) {
      const data = {
        info: "Todas las categorías existentes",
        categories: readedCategories,
      }
      return data
    } else {
      const data = {
        info: "No hay categorías registrados",
        arts: null,
      }
      return data
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

const deleteCategory = async (id) => {
  try {
    await Category.findByIdAndDelete({ _id: id })
    return "Categoría eliminada exitosamente"
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
  readInter,
  readAllProductsAdmin,
  updateProduct,
  masiveUpdate,
  searchUrl,
  updateMockup,
  deleteProduct,
  getBestSellers,
  deleteVariant,
  readById_v2,
  getVariantPrice,
  createCategory,
  updateCategory,
  readAllCategories,
  readActiveCategories,
  deleteCategory,
}
