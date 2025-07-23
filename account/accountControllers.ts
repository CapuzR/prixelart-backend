import { Request, Response, NextFunction } from "express"
import * as accountServices from "./accountServices.ts"

export const checkBalance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // TODO: need verify if admin with read balance permission OR account owner
    const id: string = req.params.id
    const balance = await accountServices.checkBalance(id)
    res.send(balance)
    return
  } catch (e) {
    next(e)
    return
  }
}

export const readAll = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.users.readPrixerBalance) {
      res.send({
        success: false,
        message: "No tienes permiso para leer Billeteras.",
      })
      return
    }

    const accountsRead = await accountServices.readAll()
    res.send(accountsRead)
    return
  } catch (e) {
    next(e)
    return
  }
}
