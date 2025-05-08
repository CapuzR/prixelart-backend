import { Request, Response, NextFunction } from "express";
import * as accountServices from "./accountServices";

export const checkBalance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    if (!req.permissions?.deleteConsumer) {
      res.send({
        success: false,
        message: "No tienes permiso para modificar Accounts.",
      });
      return;
    }

    const id: string = req.body._id;
    const balance = await accountServices.checkBalance(id);
    res.send(balance);
    return;
  } catch (e) {
    next(e);
    return;
  }
};

export const readAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.permissions?.deleteConsumer) {
      res.send({
        success: false,
        message: "No tienes permiso para modificar Accounts.",
      });
      return;
    }

    const accountsRead = await accountServices.readAll();
    res.send(accountsRead);
    return;
  } catch (e) {
    next(e);
    return;
  }
};