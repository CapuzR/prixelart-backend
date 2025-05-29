import { Request, Response, NextFunction } from "express";
import * as movementServices from "./movementServices.ts";
import { Movement } from "./movementModel.ts";

export const createMovement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.permissions?.modifyAdmins) {
      res.send({
        success: false,
        message: "No tienes permiso para crear Movimientos.",
      });
      return;
    }

    // Grab TUS‐uploaded file under purpose "MovementItem"
    const movementFile =
      req.session?.uploadResults?.item?.find(
        (f: { purpose: string; url: string }) => f.purpose === "MovementItem"
      )?.url || null;

    const { destinatary, description, type, value, order } = req.body;

    if (!destinatary || !description || !type || value === undefined) {
      res.status(400).send({
        success: false,
        message:
          "Missing required fields: destinatary, description, type, and value are required.",
      });
      return;
    }

    const movementData: Movement = {
      date: new Date(),
      destinatary,
      description,
      type,
      value: Number(value),
      order,
      createdOn: new Date(),
      createdBy: req.adminUsername,
      item: movementFile ? { url: movementFile } : undefined,
    };

    const createResult = await movementServices.createMovement(movementData);
    const balanceResult = await movementServices.updateBalance(movementData);

    res.send({ createResult, balanceResult });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const readByAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  if (!req.permissions?.modifyAdmins) {
    res.send({
      success: false,
      message: "No tienes permiso para crear Movimientos.",
    });
    return;
  }

  try {
    const result = await movementServices.readByAccount(req.body._id);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

export const readAllMovements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  if (!req.permissions?.modifyAdmins) {
    res.send({
      success: false,
      message: "No tienes permiso para crear Movimientos.",
    });
    return;
  }

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = req.query.sortBy as string || 'date';
    const sortOrder = (req.query.sortOrder as string === 'asc' ? 1 : -1) as 1 | -1;
    const rawFilterType = req.query.type as string | undefined;
    const rawSearchDesc = req.query.search as string | undefined;

    let validatedFilterType: 'Depósito' | 'Retiro' | undefined = undefined;
    if (rawFilterType === 'Depósito' || rawFilterType === 'Retiro') {
      validatedFilterType = rawFilterType;
    }

    const options: movementServices.MovementQueryOptions = {
      page,
      limit,
      sortBy,
      sortOrder,
      filterType: validatedFilterType,
      searchDesc: rawSearchDesc,
    };

    const result = await movementServices.readAllMovements(options);
    res.send(result);
  } catch (error) {
    console.error("Error in readAllMovements controller:", error);
    next(error);
  }
};

export const readById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  if (!req.permissions?.modifyAdmins) {
    res.send({
      success: false,
      message: "No tienes permiso para crear Movimientos.",
    });
    return;
  }

  try {
    const result = await movementServices.readById(req.params.id);
    res.send(result);
  } catch (error) {
    console.error(error);
    next(error);
  }
};