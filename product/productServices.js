const Product = require("./productModel");
const Product_v2 = require("./productModel_v2");
const { getDiscountsByFilters } = require('../discount/discountServices.js');
const { getSurchargesByFilters } = require('../surcharge/surchargeServices.js');
const { getPrixerArtCommission } = require("../art/artServices.js");


const createProduct = async (productData) => {
  try {
    const newProduct = await new Product(productData).save();
    if (newProduct) {
      return {
        success: true,
        productData: newProduct,
      };
    } else {
      return {
        success: false,
        message: "Disculpa, ocurrió un error desconocido, inténtalo de nuevo.",
      };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const readById = async (product) => {
  try {
    const readedProduct = await Product.find({ _id: product._id });
    if (readedProduct) {
      const data = {
        info: "Todos los productos disponibles",
        products: readedProduct,
      };
      return data;
    } else {
      const data = {
        info: "No hay productos registrados",
        products: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

//Calculate the price based on: discount, recharge, manually, Prixer %.
const calculateCatalogPrice = async () => {

};

//TODO: Está listo el cálculo mega básico de precios. 
//Falta incluir comisión de Prixer, descuentos, recargos, 
//y tomar en cuenta quién está viendo el precio.
const readAllProducts_v2 = async () => {
  try {
    const readedProducts = await Product_v2.find({ active: true });
    if (readedProducts) {
      const productRes = publicProductDataPrep(readedProducts)//, userType);

      const data = {
        info: "Todos los productos disponibles",
        products: productRes,
      };

      return data;
    } else {
      const data = {
        info: "No hay productos registrados",
        arts: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const readAllProducts_v3 = async () => {
  try {
    const readedProducts = 
    await Product_v2
      .find({ active: true })
      .select('name description thumbUrl considerations priceRange attributes');

    if (readedProducts) {
      // const productRes = publicProductDataPrep(readedProducts)//, userType);
      console.log("readedProducts: ", readedProducts);
      const data = {
        info: "Todos los productos disponibles",
        products: readedProducts,
      };

      return data;
    } else {
      const data = {
        info: "No hay productos registrados",
        arts: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};
const getProductPriceRange = (variants) => {
  let prices = [];
  variants.forEach((variant, i) => {
    const cost = Number(variant.cost);
    const margin = Number(variant.margin);
    const price = cost / (1 - (margin / 100));
    variants[i].price = Math.round(price * 100) / 100;
    prices.push(price);
  });
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  return [ { from: minPrice, to: maxPrice }, variants ];
};

const publicProductDataPrep = (products) => {
  
  products.map((product, index, arr)=> {
    [ product.priceRange, product.variants ] = getProductPriceRange(product.variants);
  });
  console.log("product.variants: ", products[0].variants);
  

};

const loopAndSet = async (data) => {
  const products = data;
  for (let i = 0; i < data.length; i++) {
    const product = data[i];
    if (product.publicPrice && product.publicPrice.equation) {
      const price = product.publicPrice.equation;
      product.price = price;
    } else {
      const price = product.publicPrice;
      product.priceRange = { from: price.from, to: price.to };
      const variants = product.variants;
      for (let j = 0; j < variants.length; j++) {
        const variant = variants[j];
        
        if (variant.publicPrice && variant.publicPrice.equation) {
          // if (lol === 0) {
          //   console.log("Name: ", variant.name);
          //   console.log("variant.publicPrice: ", variant.publicPrice);
          //   console.log("variant.prixerPrice: ", variant.prixerPrice);
          //   lol++;
          // };
          const price = variant.publicPrice.equation;
          variant.price = price;
        };
        product.variants[j] = variant;
      }
    }
    products[i] = product;
  }
  return products;
};

const createProduct_v2 = async (productData) => {
  try {
    const newProduct = await new Product_v2(productData).save();
    if (newProduct) {
      return {
        success: true,
        productData: newProduct,
      };
    } else {
      return {
        success: false,
        message: "Disculpa, ocurrió un error desconocido, inténtalo de nuevo.",
      };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};



const readAllProducts = async () => {
  try {
    const readedProducts = await Product.find({ active: true });
    if (readedProducts) {
      const data = {
        info: "Todos los productos disponibles",
        products: readedProducts,
      };
      return data;
    } else {
      const data = {
        info: "No hay productos registrados",
        arts: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const readAllProductsAdmin = async () => {
  try {
    const readedProducts = await Product.find();

    readedProducts.sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });

    if (readedProducts) {
      const data = {
        info: "Todos los productos disponibles",
        products: readedProducts,
      };
      return data;
    } else {
      const data = {
        info: "No hay productos registrados",
        products: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const updateProduct = async (productData, productId) => {
  try {
    const updateProduct = await Product.findByIdAndUpdate(
      productId,
      productData,
      { new: true }
    );
    if (!updateProduct) {
      return console.log("Product update error: " + err);
    } else {
      return {
        message: "Actualización realizada con éxito.",
        product: updateProduct,
      };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const masiveUpdate = async (data) => {
  try {
    const updates = [];
    await data.map(async (prod, i) => {
      const updatedProduct = await Product.findByIdAndUpdate(prod._id, prod);

      if (!updatedProduct) {
        updates.push(`${prod.name} : ${false}`);
      } else {
        updates.push(`${prod.name} : ${true}`);
      }
    });
    return {
      message: "Actualizaciones realizadas con éxito.",
      products: updates,
      success: true,
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

const updateMockup = async (data, id) => {
  try {
    delete data.adminToken;
    const updateProduct = await Product.findByIdAndUpdate(id, { mockUp: data });
    if (!updateProduct) {
      return console.log("Product update error: " + err);
    } else return "Actualización realizada con éxito.";
  } catch (error) {
    console.log(error);
    return error;
  }
};

const deleteProduct = async (req) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    return "Producto eliminado exitosamente";
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getBestSellers = async (orders) => {
  try {
    const allProducts = await Product.find({});
    let products = [];

    allProducts.map((prod) => {
      products.push({ name: prod.name, quantity: 0 });
    });

    await orders.orders.map(async (order) => {
      await order.requests.map(async (item) => {
        await products.find((element) => {
          if (element.name === item.product.name) {
            element.quantity = element.quantity + 1;
          }
        });
      });
    });

    const prodv2 = products
      .sort(function (a, b) {
        return b.quantity - a.quantity;
      })
      .slice(0, 10);

    const prodv3 = allProducts.filter((prod) =>
      prodv2.some((ref) => ref.name === prod.name)
    );

    const data = {
      info: "Estos son los productos más vendidos",
      ref: prodv2,
      products: prodv3,
    };
    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
};
const deleteVariant = async (data) => {
  try {
    const selectedProduct = data.product;
    const id = data.variant;
    const productToUpdate = await Product.findById(selectedProduct);
    let variants = productToUpdate.variants.filter(
      (variant) => variant._id !== id
    );
    productToUpdate.variants = variants;

    const updatedProduct = await Product.findByIdAndUpdate(
      selectedProduct,
      productToUpdate,
      { new: true }
    );
    if (!updatedProduct) {
      return console.log("Cannot delete variant:" + err);
    }
    return {
      message: "Variante eliminada con éxito",
      product: updatedProduct,
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

async function fetchDiscounts(userType, selectedVariant, username, salesPlatform, salesAgent, prixerId, artId) {
  try {
    const discounts = await getDiscountsByFilters(userType, selectedVariant, username, salesPlatform, salesAgent, prixerId, artId);
    discounts.sort((a, b) => a.priority - b.priority);
    return discounts;
  } catch (error) {
    console.error(error);
  }
}

async function fetchSurcharges(userType, selectedVariant, username, salesPlatform, salesAgent, prixerId, artId) {
  try {
    const surcharges = await getSurchargesByFilters(userType, selectedVariant, username, salesPlatform, salesAgent, prixerId, artId);
    surcharges.sort((a, b) => a.priority - b.priority);
    return surcharges;
  } catch (error) {
    console.error(error);
  }
}

async function fetchPrixerArtComission(artId) {
  try {
    const artComission = await getPrixerArtCommission(artId);
    return artComission;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Retrieve the cost of a selected variant.
 * @param {String} selectedVariant - The name of the selected variant.
 * @returns {Object} - The cost and margin of the selected variant.
 */
async function getVariantCostAndMargin(selectedVariant) {
  try {
    // Find the product that contains the variant with the specified name
    const product = await Product_v2.findOne({'variants._id': selectedVariant?._id }, { 'variants.$': 1 }).lean();
    // If the product or variant is not found, return null or throw an error
    if (!product || !product.variants || product.variants.length === 0) {
      return {
        message: "Variante no encontrada"
      };
    }
    // Extract the cost of the selected variant
    const variant = {
      cost: product.variants[0].cost,
      margin: {
        format: 'Porcentaje',
        type: 'margin',
        value: Number(product.variants[0].margin),
        operation: 'add',
        priority: 1
      }
    };

    return variant;
  } catch (error) {
    console.error('Error retrieving variant cost:', error);
    throw new Error('Failed to retrieve variant cost.');
  }
}

/**
 * Calculate the final price based on cost and an array of operations.
 *
 * @param {Number} cost - The base cost of the product.
 * @param {Number} margin - The margin to be applied to the cost.
 * @param {Array} adjustments - An array of objects containing the attributes:
 *                              - type (String): discount, surcharge, prixerComission, margin
 *                              - format (String): percentage or currency
 *                              - operation (String): addition or subtraction
 *                              - priority (Number): the order in which the operations should be applied
 * @returns {Number} - The calculated price.
 */
function calculatePrice(cost, margin,  adjustments, artComission) {
  // Clone the cost to avoid modifying the original input
  let price = cost;

  console.log("margin", margin);
  if (margin && margin.value) price = cost / (1 - (margin.value / 100));

  // Apply each adjustment in order
  adjustments.forEach(adjustment => {
      const { format, operation } = adjustment;
      let value = adjustment.value;

      // Calculate the value if it's in percentage format
      if (format === 'Porcentaje') {
          value = (price * value) / 100;
      }

      // Apply the operation
      if (operation === 'add') {
          price += value;
      } else if (operation === 'subtract') {
          price -= value;
      }
  });
  // Apply Prixer commission
  if (artComission) price += (price * artComission) / 100;

  // Return the final calculated price
  return price;
}

/**
 * Get the final calculated price for a selected product variant.
 *
 * @param {String} userType - The type of the user (e.g., guest, consumer, prixer, organization).
 * @param {Object} selectedVariant - The selected variant object.
 * @param {String} username - The username of the customer.
 * @param {String} salesPlatform - The platform where the sale is occurring (e.g., website, app).
 * @param {String} salesAgent - The sales agent handling the transaction.
 * @param {String} prixerId - The ID of the Prixer (artist).
 * @param {String} artId - The ID of the artwork.
 * @returns {Number} - The calculated final price.
 */
async function getPrice_v2({ userType, selectedVariant, username, salesPlatform, salesAgent, prixerId, artId }) {
  try {
    // Step 1: Get the base cost of the selected variant.
    const { cost, margin } = await getVariantCostAndMargin(selectedVariant);
    
    if (!cost) {
      throw new Error('Base cost could not be retrieved');
    }

    // Step 2: Fetch applicable discounts and surcharges.
    const surcharges = await fetchSurcharges(userType, selectedVariant, username, salesPlatform, salesAgent, prixerId, artId);
    const discounts = await fetchDiscounts(userType, selectedVariant, username, salesPlatform, salesAgent, prixerId, artId);
    // Step 3: Combine discounts and surcharges into a single adjustments array.
    const adjustments = (discounts || surcharges) && [...surcharges, ...discounts];
    // Step 4: Get Prixer commission if the userType requesting is not a Prixer.
    const prixerArtComission = userType == 'Prixer' ? null : await fetchPrixerArtComission(artId);
    // Step 5: Calculate the final price using the base cost and adjustments.
    const finalPrice = calculatePrice(cost, margin, adjustments, prixerArtComission);

    // Return the calculated final price
    return finalPrice;
  } catch (error) {
    console.error('Error calculating price:', error);
    throw new Error('Failed to calculate price.');
  }
}

module.exports = {
  createProduct,
  readById,
  readAllProducts,
  readAllProductsAdmin,
  updateProduct,
  masiveUpdate,
  updateMockup,
  deleteProduct,
  getBestSellers,
  deleteVariant,
  readAllProducts_v2,
  createProduct_v2,
  // getRegularConsumerPrice,
  fetchDiscounts,
  fetchSurcharges,
  getVariantCostAndMargin,
  calculatePrice,
  getPrice_v2,
  readAllProducts_v3
};
