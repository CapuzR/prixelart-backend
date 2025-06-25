import { Request, Response, NextFunction } from "express"
import * as productServices from "./productServices.ts"
import * as authServices from "../user/userServices/userServices.ts"
import { Product } from "./productModel.ts"
import { User } from "../user/userModel.ts"

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.createProduct) {
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
  if (!req.permissions?.createProduct) {
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
    if (!req.permissions?.createProduct) {
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
    if (!req.permissions?.createProduct) {
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
    if (!req.permissions?.deleteProduct) {
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
    if (!req.permissions?.createProduct) {
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

export const getTuFotoDivertidaProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productIds = [
      "6413349c2657ac0012046477",
      "620a3f1791523f0011ebd573",
      "6176a5787404fa0011b10216",
    ];
    const resp = await productServices.readProductsByIds(productIds);
    res.send(resp);
  } catch (err) {
    next(err);
  }
};