import { Request, Response, NextFunction } from "express";
import * as productServices from "./productServices";
import * as authServices from '../user/userServices/userServices'
import { Product } from "./productModel";
import { User } from "../user/userModel";

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.permissions?.createProduct) {
      res.send({ success: false, message: "No tienes permiso para crear productos." });
      return;
    }

    const uploads = (req.session && req.session.uploadResults?.files as Array<{ name: string; url: string }>) || [];

    const imageEntries = uploads.filter(u => u.name === "productImage");
    const videoEntry = uploads.find(u => u.name === "productVideo");


    if (imageEntries.length === 0) {
      res.status(400).send({ success: false, message: "Debe subir al menos una imagen de producto." });
      return;
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
      mockUp
    } = req.body;

    if (!name || !description || !category) {
      res.status(400).send({
        success: false,
        message: "Faltan campos requeridos: name, description o category."
      });
      return;
    }

    const productData: Product = {
      name,
      description,
      category,
      productionTime,
      cost,
      sources: {
        images: imageEntries.map(e => ({ url: e.url })),
        video: videoEntry?.url
      },
      active: Boolean(active),
      variants: [],
      hasSpecialVar: Boolean(hasSpecialVar),
      autoCertified: Boolean(autoCertified),
      bestSeller: Boolean(bestSeller),
      mockUp: mockUp || ""
    };

    const result = await productServices.createProduct(productData);
    res.send(result);
  } catch (e) {
    console.error(e);
    next(e);
  }
};

export const readById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  if (!req.permissions?.createProduct) {
    res.send({ success: false, message: "No tienes permiso para actualizar productos." });
    return;
  }

  try {
    const resp = await productServices.readById(req.params.id);
    res.send(resp);
  } catch (err) {
    next(err);
  }
};

export const readActiveById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  try {
    const resp = await productServices.readActiveById(req.params.id);
    res.send(resp);
  } catch (err) {
    next(err);
  }
};

export const getVariantPrice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { variantId, productId } = req.query;
    if (!variantId || !productId) {
      res.status(400).send({ success: false, message: "variantId y productId son requeridos." });
      return;
    }
    let validUser = null;
    if (req.userId) {
      validUser = (await authServices.readUserById(req.userId)).result as User;
    }
    const isPrixer = req.isPrixer ? true : false;

    const resp = await productServices.getVariantPrice(variantId as string, productId as string, validUser, isPrixer);
    res.send(resp);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const readAllProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    if (!req.permissions?.createProduct) {
      res.send({ success: false, message: "No tienes permiso para actualizar productos." });
      return;
    }

    const resp = await productServices.readAllProducts();
    res.send(resp);
  } catch (err) {
    next(err);
  }
};

export const readAllActiveProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    const resp = await productServices.readAllActiveProducts();
    res.send(resp);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    if (!req.permissions?.createProduct) {
      res.send({ success: false, message: "No tienes permiso para actualizar productos." });
      return;
    }

    const uploads = (req.session && req.session.uploadResults?.files as Array<{ name: string; url: string }>) || [];
    const newImages = uploads.filter(u => u.name === "productImage").map(u => u.url);
    const newVideo = uploads.find(u => u.name === "productVideo")?.url;

    const updateData: Partial<Product> = {};
    ["name", "description", "category", "productionTime", "cost", "discount", "mockUp"]
      .forEach((f) => { if (req.body[f] !== undefined) updateData[f as keyof Product] = req.body[f]; });
    if (req.body.active !== undefined) updateData.active = Boolean(req.body.active);
    if (req.body.hasSpecialVar !== undefined) updateData.hasSpecialVar = Boolean(req.body.hasSpecialVar);
    if (req.body.autoCertified !== undefined) updateData.autoCertified = Boolean(req.body.autoCertified);
    if (req.body.bestSeller !== undefined) updateData.bestSeller = Boolean(req.body.bestSeller);
    if (newImages.length) {
      updateData.sources = updateData.sources || { images: [], video: undefined };
      updateData.sources.images = newImages.map(url => ({ url }));
    }

    if (newVideo) {
      updateData.sources = updateData.sources || { images: [], video: undefined };
      updateData.sources.video = newVideo;
    }

    const resp = await productServices.updateProduct(req.params.id, updateData);
    res.send(resp);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const readBestSellers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resp = await productServices.readBestSellers();
    res.send(resp);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.permissions?.deleteProduct) {
      res.send({ success: false, message: "No tienes permiso para eliminar productos." });
      return;
    }
    const resp = await productServices.deleteProduct(req.params.id);
    res.send(resp);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const deleteVariant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.permissions?.createProduct) {
      res.send({ success: false, message: "No tienes permiso para actualizar productos." });
      return;
    }
    const variantToDelete = await productServices.deleteVariant(req.body);
    const data = { variantToDelete, success: true };
    res.send(data);
  } catch (err) {
    next(err);
  }
};