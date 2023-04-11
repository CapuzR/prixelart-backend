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
    const readedProducts = await Product.find({}).exec();
    const Products = await Product.find();
    console.log(readedProducts, "readed products");
    console.log(Products, "anterior servicio");
    if (readedProducts) {
      const data = {
        info: "Todos los productos disponibles",
        products: readedProducts,
      };
      console.log(data, "data retornada");
      return data;
    } else {
      const data = {
        info: "No hay productos registrados",
        arts: null,
      };
      console.log(data, "data retornada");
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

const deleteProduct = async (productId) => {
  try {
    await Product.findByIdAndDelete(productId);
    return "Producto eliminado exitosamente";
  } catch (error) {
    console.log(error);
    return error;
  }
};

const deleteVariant = async (data) => {
  try {
    const selectedProduct = data.id;
    const indexVariant = data.i;

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
  deleteProduct,
  deleteVariant,
};
