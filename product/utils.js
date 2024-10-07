const getUniqueAttributesFromVariants = (variants) => {
    const attributeMap = {};
  
    variants?.forEach((variant) => {
      if (variant.active && variant.attributes) {
        variant.attributes.forEach((attr) => {
          const { name, value } = attr;
  
          // If the attribute name doesn't exist in the map, initialize it
          if (!attributeMap[name]) {
            attributeMap[name] = new Set(); // Use Set to ensure uniqueness
          }
  
          // Add the value to the set for this attribute name
          attributeMap[name].add(value);
        });
      }
    });
  
    // Convert the map to the desired array format
    const attributesArray = Object.keys(attributeMap).map((key) => ({
      name: key,
      value: Array.from(attributeMap[key]), // Convert Set to Array
    }));
  
    return attributesArray;
  };
  
  
  const parseAndFormatNumber = (value) => {
    if (typeof value !== 'string') return null;
    const parsedNumber = parseFloat(value.replace(',', '.'));
    return !isNaN(parsedNumber) ? parsedNumber : null;
  };
  
  // Helper function to format price
  const formatPrice = (price) => price.toFixed(2).replace('.', ',');

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
  getUniqueAttributesFromVariants,
  parseAndFormatNumber,
  formatPrice,
  sortProducts
}
