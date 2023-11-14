const Product = require("./productModel");

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
        arts: null,
      };
      return data;
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
      productData
    );
    if (!updateProduct) {
      return console.log("Product update error: " + err);
    }
    return "Actualización realizada con éxito.";
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
    const indexVariant = data.variant;

    const productToUpdate = await Product.findById(selectedProduct);
    productToUpdate.variants.splice(indexVariant, 1);
    // productToUpdate.variants = [];

    const updatedProduct = await Product.findByIdAndUpdate(
      selectedProduct,
      productToUpdate
    );
    if (!updatedProduct) {
      return console.log("Cannot delete variant:" + err);
    }
    return "Variante eliminada con éxito";
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = {
  createProduct,
  readById,
  readAllProducts,
  readAllProductsAdmin,
  updateProduct,
  updateMockup,
  deleteProduct,
  getBestSellers,
  deleteVariant,
};
