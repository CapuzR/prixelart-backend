import { Collection, ObjectId } from "mongodb";
import { PrixResponse } from "../types/responseModel.ts";
import { Account } from "./accountModel.ts";
import { User } from "../user/userModel.ts";
import { getDb } from "../mongo.ts";

function usersCollection(): Collection<User> {
  return getDb().collection<User>("users");
}

function accountCollection(): Collection<Account> {
  return getDb().collection<Account>("account");
}

export const createAccount = async (account: Account): Promise<PrixResponse> => {
  try {
    const accounts = accountCollection();
    const result = await accounts.insertOne(account);

    if (result.acknowledged && result.insertedId) {
      return {
        success: true,
        message: 'Carousel created successfully.',
        result: { ...account, _id: result.insertedId },
      };
    } else {
      return {
        success: false,
        message: 'Failed to create carousel.',
      };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `An error occurred: ${errorMsg}`,
    };
  }
};

export const checkBalance = async (id: string): Promise<PrixResponse> => {
  try {

    const accounts = accountCollection();
    const account = await accounts.findOne({ _id: id });

    if (account) {
      return {
        success: true,
        message: 'Account found. Balance: ' + account.balance,
        result: account,
      };
    } else {
      return {
        success: false,
        message: 'Account not found.',
      };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `An error occurred: ${errorMsg}`,
    };
  }
};

export const readAll = async (): Promise<PrixResponse> => {
  try {
    const accounts = accountCollection();
    const accountList = await accounts.find({}).toArray();

    if (accountList.length === 0) {
      return {
        success: true,
        message: 'No accounts found.',
        result: accountList
      };
    }
    return {
      success: true,
      message: 'Accounts found.',
      result: accountList
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `An error occurred: ${errorMsg}`,
    };
  }
};