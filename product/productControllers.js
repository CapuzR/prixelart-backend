const productServices = require( "./productServices" );

//CRUD

const createProduct = async (req, res, next)=> {
  try {
    res.send(await productServices.createProduct(req.body));
  }catch(e) {
    res.status(500).send(e);
  }
}

const readById = async (req, res)=> {
  try {
    const readedProduct = await productServices.readById(req.body);
    res.send(readedProduct);
  } catch (err) {
    res.status(500).send(err);
  }
}

const readAllProducts = async (req, res)=> {
  try {
    const readedProducts = await productServices.readAllProducts();
    res.send(readedProducts);
  } catch (err) {
    res.status(500).send(err);
  }
}

const readAllProductsAdmin = async (req, res)=> {
  try {
    const readedProducts = await productServices.readAllProductsAdmin();
    res.send(readedProducts);
  } catch (err) {
    res.status(500).send(err);
  }
}

async function updateProduct (req, res) {
  try {
    const product = req.body;
    const productResult = await productServices.updateProduct(product);
    data = {
        productResult,
        success: true
    }
    return res.send(data);
  } catch (err) {
    res.status(500).send(err);
  }
}

module.exports = { createProduct, readById, readAllProducts, readAllProductsAdmin, updateProduct }

// //CRUD END