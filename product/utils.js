const { readDiscountByFilter } = require('../discount/discountServices.js')

//Esto me lo debería llevar a los utils de discount en tal caso.
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

module.exports = {
    productDataPrep
}
