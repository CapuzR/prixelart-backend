import { Request, Response, NextFunction } from "express";
import * as adminAuthServices from "../adminServices/adminAuthServices.ts";
import * as adminServices from "../adminServices/adminServices.ts";
import { Admin, Login } from "../adminModel.ts";
import jwt from "jsonwebtoken";

const isProduction = false;

declare global {
  namespace Express {
    interface Request {
      admin?: { id: string };
      permissions?: any;
      adminUsername: string;
    }
  }
}

export const adminLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminCredentials: Login = req.body;
    const auth = await adminAuthServices.authenticate(adminCredentials);
    if (!auth.success) {
      res.send(auth);
      return;
    }

    res.cookie("adminToken", auth.result! as string, {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      ...(isProduction ? { domain: ".prixelart.com" } : {}),
      path: "/",
      maxAge: 240 * 60 * 1000,
    })

    const adminResp = await adminServices.readAdminByEmail(adminCredentials.email);

    if (!adminResp.success || !adminResp.result) {
      res.json({
        success: true,
        message: auth.message,
        result: [],
      });
      return;
    }

    const adminId = (adminResp.result as Admin)._id!.toString();

    const permsResp = await adminAuthServices.getPermissions(adminId);
    const permissions = permsResp.success
      ? permsResp.result
      : [];

    res.json({
      success: true,
      message: auth.message,
      result: permissions,
    });
    return;

  } catch (err) {
    next(err);
    return;
  }
};

export const ensureAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminToken = req.cookies.adminToken;
    if (!adminToken) {
      res.status(401).send({
        success: false,
        message: "No has iniciado sesión. Por favor inicia sesión para continuar.",
      });
      return;
    }

    const decoded = jwt.verify(adminToken, process.env.ADMIN_JWT_SECRET!) as { id: string };

    const permissionsResponse = await adminAuthServices.getPermissions(decoded.id);
    if (!permissionsResponse.success) {
      res.status(403).send(permissionsResponse);
      return;
    }

    const adminUser = await adminServices.readAdminById(decoded.id);

    const adminObject = adminUser.result as Admin;

    req.admin = decoded;
    req.permissions = permissionsResponse.result;
    req.adminUsername = adminObject.username;

    next();
  } catch (err) {
    next(err);
  }
};

export const adminLogout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const response = {
      success: true,
      message: "Logged Out Successfully",
    };
    res.clearCookie("adminToken", {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      ...(isProduction ? { domain: ".prixelart.com" } : {}),
      path: "/",
    });
    res.send(response);
  } catch (err) {
    next(err);
  }
};
