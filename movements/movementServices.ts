import { Collection, Filter, ObjectId } from "mongodb";
import { PrixResponse } from "../types/responseModel.ts";
import { Movement } from "./movementModel.ts";
import { Account } from "../account/accountModel.ts";
import { getDb } from "../mongo.ts";

function movementCollection(): Collection<Movement> {
  return getDb().collection<Movement>("movements");
}

function accountCollection(): Collection<Account> {
  return getDb().collection<Account>("account");
}

export const createMovement = async (movement: Movement): Promise<PrixResponse> => {
  try {
    const movements = movementCollection();
    const { acknowledged, insertedId } = await movements.insertOne(movement);
    if (acknowledged) {
      return {
        success: true,
        message: "Movimiento creado con éxito.",
        result: { ...movement, _id: insertedId },
      };
    }
    return { success: false, message: "No se pudo crear el movimiento." };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, message: `An error occurred: ${msg}` };
  }
};

export const updateBalance = async (movement: Movement): Promise<PrixResponse> => {
  try {
    if (!movement.destinatary) {
      return { success: false, message: "Destinatario no definido." };
    }
    const accounts = accountCollection();

    const acct = await accounts.findOne({
      _id: movement.destinatary,
    });
    if (!acct) {
      return { success: false, message: "Cuenta no encontrada." };
    }

    let newBalance = acct.balance;
    if (movement.type === "Depósito") {
      newBalance += movement.value;
    } else if (movement.type === "Retiro") {
      newBalance -= movement.value;
    } else {
      return {
        success: true,
        message: "Tipo de movimiento no modifica balance.",
        result: acct,
      };
    }

    await accounts.updateOne(
      { _id: movement.destinatary },
      { $set: { balance: newBalance } }
    );
    const updated = await accounts.findOne({
      _id: movement.destinatary,
    });
    return {
      success: true,
      message: "Balance actualizado con éxito.",
      result: updated!,
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, message: `An error occurred: ${msg}` };
  }
};

export const readByAccount = async (accountId: string): Promise<PrixResponse> => {
  try {
    const movements = movementCollection();
    const list = await movements
      .find({ destinatary: accountId })
      .toArray();
    return {
      success: true,
      message: list.length
        ? "Movimientos encontrados."
        : "No hay movimientos registrados.",
      result: list,
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, message: `An error occurred: ${msg}` };
  }
};

export interface MovementQueryOptions {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 1 | -1;
  filterType?: 'Depósito' | 'Retiro';
  searchDesc?: string;
  destinatary?: string;
}

interface PaginatedMovementResponse extends Omit<PrixResponse, 'result'> {
  result: {
    data: Movement[];
    totalCount: number;
  } | null;
}

export const readAllMovements = async (options: MovementQueryOptions): Promise<PaginatedMovementResponse> => {
  try {
    const { page, limit, sortBy, sortOrder, filterType, searchDesc, destinatary } = options;
    const movements = movementCollection();
    const skip = (page - 1) * limit;

    const filterQuery: Filter<Movement> = {};
    if (filterType) {
      filterQuery.type = filterType;
    }
    if (searchDesc) {
      filterQuery.description = { $regex: searchDesc, $options: 'i' };
    }

    if (destinatary) {
      filterQuery.destinatary = destinatary
    }
    const totalCount = await movements.countDocuments(filterQuery);

    const list = await movements
      .find(filterQuery)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .toArray();

    return {
      success: true,
      message: list.length ? "Movimientos recuperados." : "No se encontraron movimientos para esta página/filtros.",
      result: {
        data: list,
        totalCount: totalCount
      }
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Error in readAllMovements service:", e);
    return { success: false, message: `Ocurrió un error al leer movimientos: ${msg}`, result: null };
  }
};

export const readById = async (id: string): Promise<PrixResponse> => {
  try {

    const movements = movementCollection();
    const mov = await movements.findOne({
      _id: id,
    });
    if (mov) {
      return {
        success: true,
        message: "Movimiento encontrado.",
        result: mov,
      };
    }
    return { success: false, message: "Movimiento no encontrado." };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, message: `An error occurred: ${msg}` };
  }
};