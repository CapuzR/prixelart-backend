const { readDiscountByFilter } = require("../discount/discountServices.js")
const { readWithId } = require("../discount/utils.js")

//Esto me lo debería llevar a los utils de discount en tal caso.
const applyDiscounts = async (
  values = [],
  productName = null,
  userId = null
) => {
  try {
    const discountResponse = await readDiscountByFilter(productName, userId)

    if (discountResponse.success && discountResponse.discounts.length > 0) {
      const discountedValues = values.map((value) => {
        let discountedValue = value

        discountResponse.discounts.forEach((discount) => {
          if (discount.type === "Porcentaje") {
            discountedValue -= (discount.value / 100) * discountedValue
          } else if (discount.type === "Monto") {
            discountedValue -= discount.value
          }
        })
        return Math.max(0, discountedValue)
      })

      return discountedValues
    } else {
      return values
    }
  } catch (error) {
    console.error("Error applying discounts:", error)
    return values
  }
}

const getPriceRange = async (
  variants,
  user,
  productName,
  publicPrice,
  prixerPrice,
  interV
) => {
  let minPrice = Infinity
  let maxPrice = -Infinity

  const parseAndFormatNumber = (value) => {
    if (typeof value === "number") {
      return value
    }

    if (typeof value === "string") {
      const parsedNumber = parseFloat(value.replace(",", "."))
      if (!isNaN(parsedNumber)) {
        return parsedNumber
      }
    }

    return null
  }

  if (interV === true) {
    variants
      ?.filter((variant) => variant.inter)
      .forEach((variant) => {
        let equation = null

        if (user && variant.prixerPrice) {
          equation = variant.prixerPrice.equation
        } else if (!user && variant.publicPrice) {
          equation = variant.publicPrice.equation
        }

        const price = parseAndFormatNumber(equation)
        if (price !== null) {
          minPrice = Math.min(minPrice, price)
          maxPrice = Math.max(maxPrice, price)
        }
      })
  } else if (variants.length > 0) {
    variants?.forEach((variant) => {
      let equation = null

      if (user && variant.prixerPrice) {
        equation = variant.prixerPrice.equation
      } else if (!user && variant.publicPrice) {
        equation = variant.publicPrice.equation
      }

      const price = parseAndFormatNumber(equation)

      if (price !== null) {
        minPrice = Math.min(minPrice, price)
        maxPrice = Math.max(maxPrice, price)
      }
    })
  } else {
    let equation = null

    if (user && prixerPrice) {
      equation = prixerPrice.from
    } else if (!user && publicPrice.from) {
      equation = publicPrice.from
    }

    const price = parseAndFormatNumber(equation)

    if (price !== null) {
      minPrice = Math.min(minPrice, price)
      maxPrice = Math.max(maxPrice, price)
    }
  }
  const formatPrice = (price) => price.toFixed(2).replace(".", ",")

  if (interV === true) {
    return {
      from: formatPrice(minPrice),
      to: formatPrice(maxPrice),
    }
  } else if (minPrice !== Infinity && maxPrice !== -Infinity) {
    let postPrixerFeeMinPrice = minPrice / (1 - 0.1)
    let postPrixerFeeMaxPrice = maxPrice / (1 - 0.1)
    const [finalMinPrice, finalMaxPrice] = await applyDiscounts(
      [postPrixerFeeMinPrice, postPrixerFeeMaxPrice],
      productName,
      user?.id
    )
    return {
      from: formatPrice(finalMinPrice),
      to: formatPrice(finalMaxPrice),
    }
  } else {
    return null
  }
}

const getUniqueAttributesFromVariants = (variants) => {
  const attributeMap = {}

  variants?.forEach((variant) => {
    if (variant.active && variant.attributes) {
      variant.attributes.forEach((attr) => {
        const { name, value } = attr

        // If the attribute name doesn't exist in the map, initialize it
        if (!attributeMap[name]) {
          attributeMap[name] = new Set() // Use Set to ensure uniqueness
        }

        // Add the value to the set for this attribute name
        attributeMap[name].add(value)
      })
    }
  })

  // Convert the map to the desired array format
  const attributesArray = Object.keys(attributeMap).map((key) => ({
    name: key,
    value: Array.from(attributeMap[key]), // Convert Set to Array
  }))

  return attributesArray
}

const productDataPrep = async (
  products,
  user,
  orderType,
  sortBy,
  initialPoint,
  productsPerPage,
  interV
) => {
  let productsRes = []

  const res = await Promise.all(
    products.map(async (product) => {
      let priceRange = await getPriceRange(
        product.variants,
        user,
        product.name,
        product.publicPrice,
        product.prixerPrice,
        interV
      )
      let searchDiscount = undefined
      if (product?.discount !== undefined) {
        let id = product.discount
        searchDiscount = await readWithId(id)
        console.log(searchDiscount)
        product.discount = searchDiscount
      }

      if (
        (priceRange && priceRange !== undefined) ||
        (product.priceRange && product.priceRange !== undefined)
      ) {
        productsRes.push({
          id: product._id,
          name: product.name,
          description: product.description,
          discount: searchDiscount,
          sources: product.sources,
          priceRange: priceRange ? priceRange : product.priceRange,
        })
      }
    })
  )

  if (res) {
    const sortDirection = orderType === "asc" ? 1 : -1
    const sortedProducts = sortProducts(productsRes, sortBy, sortDirection)
    const paginatedProducts = sortedProducts.slice(
      initialPoint,
      Number(initialPoint) + Number(productsPerPage)
    )
    return [paginatedProducts, sortedProducts.length]
  }
}

const sortProducts = (products, sortBy, sortDirection) => {
  // Sort by name (case-insensitive)
  if (sortBy === "name") {
    return products.sort((a, b) => {
      const nameA = a.name.toLowerCase() // Ensure case-insensitive sorting
      const nameB = b.name.toLowerCase()

      if (nameA < nameB) return sortDirection === 1 ? -1 : 1
      if (nameA > nameB) return sortDirection === 1 ? 1 : -1
      return 0
    })
  }

  // Sort by priceRange.from
  else if (sortBy === "priceRange") {
    return products.sort((a, b) => {
      const priceA =
        a.priceRange && a.priceRange.from
          ? parseFloat(a.priceRange.from.replace(",", "."))
          : 0
      const priceB =
        b.priceRange && b.priceRange.from
          ? parseFloat(b.priceRange.from.replace(",", "."))
          : 0

      return sortDirection === 1 ? priceA - priceB : priceB - priceA
    })
  }

  // No sorting criteria provided, return unsorted products
  return products
}

module.exports = {
  productDataPrep,
  getUniqueAttributesFromVariants,
}
