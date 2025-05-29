import { Collection, FindOptions, ObjectId } from "mongodb";
import { PrixResponse } from "../../types/responseModel.ts";
import { User } from "../userModel.ts";
import bcrypt from "bcrypt";
import { getDb } from "../../mongo.ts";

function usersCollection(): Collection<User> {
  return getDb().collection<User>("users");
}

const excludePasswordProjection: FindOptions<User>['projection'] = { password: 0 };

export const createUser = async (userData: User): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const existingUserByEmail = await users.findOne({ email: userData.email });
    const existingUserByUsername = await readUserByUsername(userData.username);
    if (existingUserByUsername.success) {
      return {
        success: false,
        message: "Disculpa, el nombre de usuario ya está registrado.",
      };
    }
    if (existingUserByEmail) {
      return {
        success: false,
        message: "Disculpa, el correo del usuario ya está registrado.",
      };
    }

    const salt = await bcrypt.genSalt(2);
    const hash = await bcrypt.hash(userData.password!, salt);
    const newUserData = { ...userData, password: hash };
    const result = await users.insertOne(newUserData);
    if (result.insertedId) {
      const newUser = await users.findOne({ _id: result.insertedId });
      return {
        success: true,
        message: "Éxito",
        result: newUser!,
      };
    } else {
      return {
        success: false,
        message: "No se pudo insertar el usuario.",
      };
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `An error occurred: ${errorMsg}`,
    };
  }
};

export const changePassword = async (username: string, oldPassword: string, newPassword: string): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const userRecord = await users.findOne({ username: username });
    if (!userRecord) {
      return {
        success: false,
        message: "Nombre de usuario incorrecto.",
      };
    }
    if (userRecord.password && !bcrypt.compareSync(oldPassword, userRecord.password)) {
      return {
        success: false,
        message: "Inténtalo de nuevo, contraseña incorrecta.",
      };
    } else {
      const salt = await bcrypt.genSalt(2);
      const hash = await bcrypt.hash(newPassword, salt);
      const updateResult = await users.findOneAndUpdate(
        { username: username },
        { $set: { password: hash } },
        { returnDocument: "after" }
      );
      if (updateResult) {
        return { success: true, message: "Contraseña actualizada correctamente." };
      } else {
        return { success: false, message: "No se pudo actualizar la contraseña." };
      }
    }
  } catch (e) {
    return {
      success: false,
      message: "Unable to change the password.",
    };
  }
};

export const resetPassword = async (newPassword: string, user: User): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const salt = await bcrypt.genSalt(2);
    const hash = await bcrypt.hash(newPassword, salt);
    const updateResult = await users.findOneAndUpdate(
      { _id: new ObjectId(user._id) },
      { $set: { password: hash } },
      { returnDocument: "after" }
    );
    if (updateResult) {
      return {
        success: true,
        message: "Contraseña modificada correctamente. Por favor inicia sesión.",
      };
    } else {
      return {
        success: false,
        message: "No pudimos actualizar tu contraseña, por favor inténtalo de nuevo.",
      };
    }
  } catch (e) {
    return {
      success: false,
      message: "No pudimos actualizar tu contraseña, por favor inténtalo de nuevo.",
    };
  }
};
// Utils

export const readUserById = async (id: string): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const user = await users.findOne(
      { _id: new ObjectId(id) },
      { projection: excludePasswordProjection }
    );
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }
    return {
      success: true,
      message: "User found successfully.",
      result: user,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `An error occurred: ${errorMsg}`,
    };
  }
};

export const readAllUsers = async (): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const userList = await users.find({}, { projection: excludePasswordProjection }).toArray();

    return {
      success: true,
      message: 'Users found.',
      result: userList
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `An error occurred: ${errorMsg}`,
    };
  }
};

export const readUserByUsername = async (username: string): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const user = await users.findOne(
      { username: username },
      { projection: excludePasswordProjection }
    );

    if (!user) {
      return {
        success: false,
        message: `User not found`,
      };
    }

    return {
      success: true,
      message: "User found successfully.",
      result: user,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `An error occurred: ${errorMsg}`,
    };
  }
};

export const readUserByAccount = async (account: string): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const found = await users.findOne(
      { account: account },
      { projection: excludePasswordProjection }
    );
    if (found) {
      found.password = '';
      found.email = '';
    }

    if (!found) {
      return {
        success: false,
        message: `User not found`,
      };
    }

    return {
      success: true,
      message: "User found successfully.",
      result: found,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `An error occurred: ${errorMsg}`,
    };
  }
};

export const getUsersByIds = async (ids: string[]): Promise<PrixResponse> => {
  try {

    if (!Array.isArray(ids)) {
      return {
        success: false,
        message: "Input must be an array of user IDs.",
      };
    }

    if (ids.length === 0) {
      return {
        success: true,
        message: "Successfully retrieved 0 users.",
        result: [],
      };
    }

    const users = usersCollection();
    let objectIds: ObjectId[];

    try {
      objectIds = ids.map(id => new ObjectId(id));
    } catch (validationError: unknown) {
      const errorMsg = validationError instanceof Error ? validationError.message : String(validationError);
      console.error("Invalid ObjectId format detected:", validationError);
      return {
        success: false,
        message: `One or more provided IDs have an invalid format: ${errorMsg}`,
      };
    }

    const query = { _id: { $in: objectIds } };

    const foundUsers = await users.find(query).toArray();

    return {
      success: true,
      message: `Successfully retrieved ${foundUsers.length} out of ${ids.length} requested users.`,
      result: foundUsers,
    };

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Error fetching users by IDs:", error);
    return {
      success: false,
      message: `An error occurred while retrieving users: ${errorMsg}`,
    };
  }
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<PrixResponse> => {
  try {
    const users = usersCollection();

    const { password, ...otherDataToUpdate } = userData;

    const updatePayload: any = { ...otherDataToUpdate };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatePayload.password = await bcrypt.hash(password, salt);
    }

    if (Object.keys(updatePayload).length === 0) {
      return {
        success: false,
        message: "No se proporcionaron datos para actualizar.",
      };
    }

    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatePayload },
      {
        returnDocument: "after",
        projection: { password: 0 }
      }
    );

    if (!result) {
      return {
        success: false,
        message: "User no encontrado o error al actualizar.",
      };
    }

    return {
      success: true,
      message: "User actualizado exitosamente.",
      result: result,
    };
  } catch (error) {
    console.error("Error updating user:", error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Ocurrió un error al actualizar el user: ${errorMsg}`,
    };
  }
};

export const deleteUser = async (userUsername: string): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const result = await users.findOneAndDelete({ username: userUsername });
    if (result) {
      return {
        success: true,
        message: "User eliminado exitosamente.",
        result: result
      };
    } else {
      return {
        success: false,
        message: "Error al eliminar el user."
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
