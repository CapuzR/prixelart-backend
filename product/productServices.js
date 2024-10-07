const Product = require("./productModel")
const Category = require("./categoryModel.js")
const axios = require("axios")
const { readDiscountByFilter } = require('../discount/discountServices.js')

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

const getProductPriceRange_v3 = (variants) => {
  let prices = [];
  console.log("variants", variants);
  variants?.forEach((variant, i) => {
    const cost = Number(variant.cost);
    const margin = Number(variant.margin);
    const price = cost / (1 - (margin / 100));
    variants[i].price = Math.round(price * 100) / 100;
    prices.push(price);
  });
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  console.log("minPrice", minPrice);
  console.log("maxPrice", maxPrice);
  return { from: minPrice, to: maxPrice };
};

const applyDiscounts = async (values = [], productName = null, userId = null) => {
  try {
    const discountResponse = await readDiscountByFilter(productName, userId);

    if (discountResponse.success && discountResponse.discounts.length > 0) {
      const discountedValues = values.map((value) => {
        let discountedValue = value;

        discountResponse.discounts.forEach((discount) => {
          if (discount.type === 'Porcentaje') {
            discountedValue -= (discount.value / 100) * discountedValue;
          } else if (discount.type === 'Monto') {
            discountedValue -= discount.value;
          }
        });
        return Math.max(0, discountedValue);
      });

      return discountedValues;
    } else {
      return values;
    }
  } catch (error) {
    console.error("Error applying discounts:", error);
    return values;
  }
};


const getPriceRange = async (variants, user, productName) => {
  let minPrice = Infinity;
  let maxPrice = -Infinity;

  const parseAndFormatNumber = (value) => {
    if (typeof value !== 'string') return null;
    const parsedNumber = parseFloat(value.replace(',', '.'));
    if (!isNaN(parsedNumber)) {
      return parsedNumber;
    }
    return null;
  };

  variants?.forEach((variant) => {
    let equation = null;

    if (user && variant.prixerPrice) {
      equation = variant.prixerPrice.equation;
    } else if (!user && variant.publicPrice) {
      equation = variant.publicPrice.equation;
    }

    const price = parseAndFormatNumber(equation);

    if (price !== null) {
      minPrice = Math.min(minPrice, price);
      maxPrice = Math.max(maxPrice, price);
    }
  });

  if (minPrice !== Infinity && maxPrice !== -Infinity) {
    const formatPrice = (price) => price.toFixed(2).replace('.', ',');
    let postPrixerFeeMinPrice = minPrice/(1-0.1);
    let postPrixerFeeMaxPrice = maxPrice/(1-0.1);
    const [ finalMinPrice, finalMaxPrice ] = await applyDiscounts([ postPrixerFeeMinPrice, postPrixerFeeMaxPrice ], productName, user?.id);
    return { from: formatPrice(finalMinPrice), to: formatPrice(finalMaxPrice) };
  } else {
    return null;
  }
};

const productDataPrep = async (products, user, orderType, sortBy, initialPoint, productsPerPage) => {
  let productsRes = [];

  const res = await Promise.all(products.map(async (product) => {
    let priceRange = await getPriceRange(product.variants, user, product.name);

    if ((priceRange && priceRange !== undefined) || 
        (product.priceRange && product.priceRange !== undefined)) {

      productsRes.push({
        id: product._id,
        name: product.name,
        description: product.description,
        sources: product.sources,
        priceRange: priceRange ? priceRange : product.priceRange,
      });
    }
  }));

  if (res) {
    const sortDirection = orderType === 'asc' ? 1 : -1;
    const sortedProducts = sortProducts(productsRes, sortBy, sortDirection);
    const paginatedProducts = sortedProducts.slice(initialPoint, Number(initialPoint) + Number(productsPerPage));
    return [paginatedProducts, sortedProducts.length];
  }
};

const sortProducts = (products, sortBy, sortDirection) => {
  // Sort by name (case-insensitive)
  if (sortBy === 'name') {
    return products.sort((a, b) => {
      const nameA = a.name.toLowerCase(); // Ensure case-insensitive sorting
      const nameB = b.name.toLowerCase();
      
      if (nameA < nameB) return sortDirection === 1 ? -1 : 1;
      if (nameA > nameB) return sortDirection === 1 ? 1 : -1;
      return 0;
    });
  }
  
  // Sort by priceRange.from
  else if (sortBy === 'priceRange') {
    return products.sort((a, b) => {
      const priceA = a.priceRange && a.priceRange.from ? parseFloat(a.priceRange.from.replace(',', '.')) : 0;
      const priceB = b.priceRange && b.priceRange.from ? parseFloat(b.priceRange.from.replace(',', '.')) : 0;

      return sortDirection === 1 ? priceA - priceB : priceB - priceA;
    });
  }

  // No sorting criteria provided, return unsorted products
  return products;
};


const readAllProducts_v2 = async (user = null, orderType = '', sortBy = '', initialPoint, productsPerPage) => {
  try {
    let data = {};

    // Query products and select required fields
    const readedProducts = await Product
      .find({ active: true })
      .select('name description priceRange sources variants');

    if (readedProducts) {
      let [products, maxLength] = await productDataPrep(readedProducts, user, orderType, sortBy, initialPoint, productsPerPage);

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

const readAllCategories = async () => {
  try {
    const readedCategories = await Category.find()
    if (readedCategories) {
      const data = {
        info: "Todas las categorías existentes",
        products: readedCategories,
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
    const readedCategories = await Category.find({active: true})
    if (readedCategories) {
      const data = {
        info: "Todas las categorías existentes",
        products: readedCategories,
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
  readAllCategories,
  readActiveCategories
}
