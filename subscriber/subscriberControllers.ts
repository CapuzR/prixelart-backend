import { processWallpaperSubscription } from './subscriberServices.ts';
import * as prixerServices from '../prixer/prixerServices.ts';
import { Request, Response, NextFunction } from 'express';

export const handleWallpaperRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, artId, artName, prixer } = req.body;

  if (!email || !artId) {
    res.status(400).json({ message: 'Email y ArtId son requeridos' });
    return;
  }

  try {
   const prixerData = await prixerServices.readByUsername(prixer);
    await processWallpaperSubscription(email, artId, artName, prixer, prixerData.success ? prixerData?.result?.prixer?.avatar : null);
    res.status(200).json({ success: true, message: 'Correo enviado y suscriptor actualizado' });
    return;
  } catch (error) {
    console.error('Error en WallpaperController:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
    return;
  }
};
