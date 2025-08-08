import { Request, Response, NextFunction } from "express"
import * as productServices from "./productServices.ts"
import * as authServices from "../user/userServices/userServices.ts"
import { Product, Variant } from "./productModel.ts"
import { User } from "../user/userModel.ts"
import { ObjectId } from "mongodb"
import { PrixResponse } from "../types/responseModel.ts"

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.products.createProduct) {
      res.send({
        success: false,
        message: "No tienes permiso para crear productos.",
      })
      return
    }

    const {
      name,
      description,
      category,
      productionTime,
      cost,
      publicPriceFrom,
      publicPriceTo,
      prixerPriceFrom,
      prixerPriceTo,
      attributes,
      active,
      hasSpecialVar,
      hasInternationalV,
      autoCertified,
      discount,
      bestSeller,
      sources,
      mockUp,
      variants,
      productionLines,
    } = req.body

    if (!name || !description || !category) {
      res.status(400).send({
        success: false,
        message: "Faltan campos requeridos: name, description o category.",
      })
      return
    }

    const productData: Product = {
      name,
      description,
      category,
      productionTime,
      cost,
      sources: {
        images: sources.images,
        video: sources.video,
      },
      active: Boolean(active),
      hasSpecialVar: Boolean(hasSpecialVar),
      autoCertified: Boolean(autoCertified),
      bestSeller: Boolean(bestSeller),
      mockUp: mockUp || "",
      variants: variants,
      productionLines: productionLines, // Added
    }

    const result = await productServices.createProduct(productData)
    res.send(result)
  } catch (e) {
    console.error(e)
    next(e)
  }
}

export const readById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.permissions?.products.readAllProducts) {
    res.send({
      success: false,
      message: "No tienes permiso para actualizar productos.",
    })
    return
  }

  try {
    const resp = await productServices.readById(req.params.id)
    res.send(resp)
  } catch (err) {
    next(err)
  }
}

export const readActiveById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const resp = await productServices.readActiveById(req.params.id)
    res.send(resp)
  } catch (err) {
    next(err)
  }
}

export const getAllVariantPricesForProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.query;

    if (!productId || typeof productId !== 'string') {
      res.status(400).send({
        success: false,
        message: "El parámetro 'productId' es requerido y debe ser una cadena.",
      });
      return;
    }

    let validUser: User | null = null;
    if (req.userId) {
      const userResult = await authServices.readUserById(req.userId);
      if (userResult.success && userResult.result) {
        validUser = userResult.result as User;
      } else {
        console.warn(`[getAllVariantPricesForProductController] Usuario no encontrado para userId: ${req.userId}`);
      }
    }
    const isPrixer = req.isPrixer ? true : false;

    const resp = await productServices.getAllVariantPricesForProduct(
      productId,
      validUser,
      isPrixer
    );

    res.send(resp);
  } catch (err: unknown) {
    console.error("[getAllVariantPricesForProductController] Error en el controlador:", err);
    next(err);
  }
};

export const getVariantPrice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { variantId, productId } = req.query
    if (!variantId || !productId) {
      res.status(400).send({
        success: false,
        message: "variantId y productId son requeridos.",
      })
      return
    }
    let validUser = null
    if (req.userId) {
      validUser = (await authServices.readUserById(req.userId)).result as User
    }
    const isPrixer = req.isPrixer ? true : false

    const resp = await productServices.getVariantPrice(
      variantId as string,
      productId as string,
      validUser,
      isPrixer
    )
    res.send(resp)
  } catch (err) {
    console.error(err)
    next(err)
  }
}

export const readAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.products.readAllProducts) {
      res.send({
        success: false,
        message: "No tienes permiso para actualizar productos.",
      })
      return
    }

    const resp = await productServices.readAllProducts()
    res.send(resp)
  } catch (err) {
    next(err)
  }
}

export const readAllActiveProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sortBy = req.query.sort as string | undefined
    type ProductSortOption = "A-Z" | "Z-A" | "lowerPrice" | "maxPrice"

    const ALLOWED_PRODUCT_SORT_OPTIONS: Exclude<
      ProductSortOption,
      "default_sort"
    >[] = ["A-Z", "Z-A", "lowerPrice", "maxPrice"]
    let validatedSortBy: ProductSortOption = "A-Z"

    if (sortBy) {
      if (ALLOWED_PRODUCT_SORT_OPTIONS.includes(sortBy as any)) {
        validatedSortBy = sortBy as ProductSortOption
      } else {
        console.warn(
          `Parámetro de ordenamiento inválido: ${sortBy}. Usando orden por defecto.`
        )
      }
    }
    const resp = await productServices.readAllActiveProducts(validatedSortBy)
    res.send(resp)
  } catch (err) {
    next(err)
  }
}

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.products.updateProduct) {
      res.send({
        success: false,
        message: "No tienes permiso para actualizar productos.",
      })
      return
    }

    const updateData: Partial<Product> = {}
    ;[
      "name",
      "description",
      "category",
      "productionTime",
      "cost",
      "discount",
      "mockUp",
      "variants",
      "productionLines",
    ].forEach((f) => {
      if (req.body[f] !== undefined)
        updateData[f as keyof Product] = req.body[f]
    })
    if (req.body.active !== undefined)
      updateData.active = Boolean(req.body.active)
    if (req.body.hasSpecialVar !== undefined)
      updateData.hasSpecialVar = Boolean(req.body.hasSpecialVar)
    if (req.body.autoCertified !== undefined)
      updateData.autoCertified = Boolean(req.body.autoCertified)
    if (req.body.bestSeller !== undefined)
      updateData.bestSeller = Boolean(req.body.bestSeller)

    updateData.sources = req.body.sources
    updateData.variants = req.body.variants

    const resp = await productServices.updateProduct(req.params.id, updateData)
    res.send(resp)
  } catch (err) {
    console.error(err)
    next(err)
  }
}

export const updateManyProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.permissions?.products.updateProduct) {
      res.status(403).send({
        success: false,
        message:
          "No tienes permiso para realizar una actualización masiva de productos.",
      })
      return
    }

    const productsToProcess: Product[] = req.body
    if (!Array.isArray(productsToProcess)) {
      res.status(400).send({
        success: false,
        message: "El cuerpo de la solicitud debe ser un array de productos.",
      })
      return
    }

    const existingProductsResponse: PrixResponse =
      await productServices.readAllProducts()

    if (!existingProductsResponse.success || !existingProductsResponse.result) {
      res.status(500).send({
        success: false,
        message:
          "No se pudieron obtener los productos existentes para la actualización.",
      })
      return
    }
    const existingProducts: Product[] =
      existingProductsResponse.result as Product[]

    const existingProductsMap = new Map<string, Product>()
    existingProducts.forEach((p) => {
      if (p._id) {
        existingProductsMap.set(p._id.toString(), p)
      }
    })

    const results: {
      productId?: string
      variantId?: string
      success: boolean
      message: string
      productName?: string
      variantName?: string
    }[] = []
    let currentProductIdInExcel: string | undefined = undefined

    for (const productDataFromFrontend of productsToProcess) {
      const {
        _id: productId,
        variants: variantsFromFrontend,
        ...productFieldsFromFrontend
      } = productDataFromFrontend

      if (!productId) {
        results.push({
          success: false,
          message: "Producto recibido sin ID, no se puede actualizar.",
          productName: productFieldsFromFrontend.name || "N/A",
        })
        continue
      }

      const existingProduct = existingProductsMap.get(productId.toString())

      if (!existingProduct) {
        results.push({
          productId: productId.toString(),
          success: false,
          message: `Producto con ID ${productId.toString()} no encontrado en la base de datos.`,
          productName: productFieldsFromFrontend.name || "N/A",
        })
        continue
      }

      const updateProductData: Partial<Product> = {}

      if (productFieldsFromFrontend.name !== undefined)
        updateProductData.name = productFieldsFromFrontend.name
      if (productFieldsFromFrontend.cost !== undefined)
        updateProductData.cost = String(productFieldsFromFrontend.cost)
      if (productFieldsFromFrontend.productionTime !== undefined)
        updateProductData.productionTime = String(
          productFieldsFromFrontend.productionTime
        )
      if (productFieldsFromFrontend.productionLines !== undefined) {
        updateProductData.productionLines = Array.isArray(
          productFieldsFromFrontend.productionLines
        )
          ? productFieldsFromFrontend.productionLines
              .map((s) => String(s).trim())
              .filter((s) => s !== "")
          : undefined
      }

      if (Object.keys(updateProductData).length > 0) {
        try {
          const updateResponse: PrixResponse =
            await productServices.updateProduct(
              productId.toString(),
              updateProductData
            )
          results.push({
            productId: productId.toString(),
            success: updateResponse.success,
            message: updateResponse.message,
            productName: existingProduct.name,
          })
        } catch (err: any) {
          results.push({
            productId: productId.toString(),
            success: false,
            message: `Error al actualizar el producto: ${err.message || "Error desconocido"}`,
            productName: existingProduct.name,
          })
        }
      } else {
        results.push({
          productId: productId.toString(),
          success: true,
          message: "No hay propiedades del producto padre para actualizar.",
          productName: existingProduct.name,
        })
      }

      const updatedVariantsForProduct: Variant[] = [
        ...(existingProduct.variants || []),
      ]

      if (variantsFromFrontend && variantsFromFrontend.length > 0) {
        for (const variantDataFromFrontend of variantsFromFrontend) {
          const {
            _id: variantId,
            attributes,
            ...variantFields
          } = variantDataFromFrontend

          const updateVariantData: Partial<Variant> = {}

          if (variantFields.name !== undefined)
            updateVariantData.name = variantFields.name
          if (variantFields.publicPrice !== undefined)
            updateVariantData.publicPrice = String(variantFields.publicPrice)
          if (variantFields.prixerPrice !== undefined)
            updateVariantData.prixerPrice = String(variantFields.prixerPrice)
          if (attributes !== undefined) {
            updateVariantData.attributes = Array.isArray(attributes)
              ? attributes.map((attr) => ({
                  name: String(attr.name).trim(),
                  value: String(attr.value).trim(),
                }))
              : []
          }

          let variantFound = false
          if (variantId) {
            for (let i = 0; i < updatedVariantsForProduct.length; i++) {
              if (
                updatedVariantsForProduct[i]._id?.toString() ===
                variantId.toString()
              ) {
                updatedVariantsForProduct[i] = {
                  ...updatedVariantsForProduct[i],
                  ...updateVariantData,
                }
                variantFound = true
                results.push({
                  productId: productId.toString(),
                  variantId: variantId.toString(),
                  success: true,
                  message: `Variante '${variantFields.name}' actualizada para el producto '${existingProduct.name}'.`,
                  productName: existingProduct.name,
                  variantName: variantFields.name,
                })
                break
              }
            }
          }

          if (!variantFound && Object.keys(updateVariantData).length > 0) {
            const newVariant: Variant = {
              _id: new ObjectId().toString(),
              ...(updateVariantData as Variant),
              attributes: updateVariantData.attributes || [],
              publicPrice: updateVariantData.publicPrice || "0.00",
              prixerPrice: updateVariantData.prixerPrice || "0.00",
            }
            updatedVariantsForProduct.push(newVariant)
            results.push({
              productId: productId.toString(),
              variantId: newVariant._id,
              success: true,
              message: `Nueva variante '${newVariant.name}' creada para el producto '${existingProduct.name}'.`,
              productName: existingProduct.name,
              variantName: newVariant.name,
            })
          } else if (
            !variantFound &&
            Object.keys(updateVariantData).length === 0
          ) {
            results.push({
              productId: productId.toString(),
              variantId: variantId?.toString() || "N/A",
              success: true,
              message: `Variante '${variantFields.name || "sin nombre"}' no encontrada o sin datos de actualización, se ignora.`,
              productName: existingProduct.name,
              variantName: variantFields.name || "N/A",
            })
          }
        }
      }

      if (
        updatedVariantsForProduct.length > 0 ||
        (existingProduct.variants || []).length !==
          updatedVariantsForProduct.length
      ) {
        try {
          const updateProductVariantsResponse: PrixResponse =
            await productServices.updateProduct(productId.toString(), {
              variants: updatedVariantsForProduct,
            })
          if (!updateProductVariantsResponse.success) {
            results.push({
              productId: productId.toString(),
              success: false,
              message: `Error al guardar los cambios de variantes para el producto: ${updateProductVariantsResponse.message}`,
              productName: existingProduct.name,
            })
          }
        } catch (err: any) {
          results.push({
            productId: productId.toString(),
            success: false,
            message: `Error al guardar los cambios de variantes para el producto: ${err.message || "Error desconocido"}`,
            productName: existingProduct.name,
          })
        }
      }
    }

    console.log("Resultados finales de la actualización masiva:", results)
    res.status(200).send({
      success: true,
      message: "Proceso de actualización masiva completado.",
      details: results,
    })
  } catch (err) {
    console.error("Error general en bulkUpdateProducts:", err)
    next(err)
  }
}

export const getUniqueProductionLines = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const resp = await productServices.getUniqueProductionLines()
    res.send(resp)
  } catch (err) {
    next(err)
  }
}

export const readBestSellers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const resp = await productServices.readBestSellers()
    res.send(resp)
  } catch (err) {
    console.error(err)
    next(err)
  }
}

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.products.deleteProduct) {
      res.send({
        success: false,
        message: "No tienes permiso para eliminar productos.",
      })
      return
    }
    const resp = await productServices.deleteProduct(req.params.id)
    res.send(resp)
  } catch (err) {
    console.error(err)
    next(err)
  }
}

export const deleteVariant = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.products.deleteVariant) {
      res.send({
        success: false,
        message: "No tienes permiso para actualizar productos.",
      })
      return
    }
    const variantToDelete = await productServices.deleteVariant(req.body)
    const data = { variantToDelete, success: true }
    res.send(data)
  } catch (err) {
    next(err)
  }
}
