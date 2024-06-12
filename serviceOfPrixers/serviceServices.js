const Service = require("./serviceModel");
const Prixer = require("../prixer/prixerModel");
const prixerService = require("../prixer/prixerServices");
const userService = require("../user/userServices/userServices");

const createService = async (serviceData) => {
  const newService = await new Service(serviceData).save();
  try {
    if (newService) {
      return {
        success: true,
        serviceData: newService,
      };
    } else {
      return {
        success: false,
        message: "Disculpa, ocurrió un error desconocido, inténtalo de nuevo.",
      };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getAll = async () => {
  try {
    const readedServices = await Service.find();
    if (readedServices) {
      const data = {
        info: "El Prixer sí tiene servicios registrados",
        services: readedServices,
      };
      return data;
    } else {
      const data = {
        info: "El Prixer no tiene servicios registrados",
        services: null,
      };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getAllActive = async () => {
  try {
    let readedServices = await Service.find({
      active: true,
      //,  visible: true
    });
    if (readedServices.length > 0) {
      const fixedServices = await Promise.all(
        readedServices.map(async (s) => {
          const p = s.prixer;
          const user = await Prixer.findOne({ _id: p });
          if (user) {
            s.prixer = user.username;
          }
          return s;
        })
      );
      const data = {
        info: "El Prixer sí tiene servicios registrados",
        services: fixedServices,
      };
      return data;
    } else {
      const data = {
        info: "El Prixer no tiene servicios registrados",
        services: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const readMyServices = async (prixerId) => {
  try {
    const readedServices = await Service.find({ prixer: prixerId }).exec();
    const fixedServices = await Promise.all(
      readedServices.map(async (s) => {
        const p = s.prixer;
        const user = await Prixer.findOne({ _id: p });
        if (user) {
          s.prixer = user.username;
        }
        return s;
      })
    );
    if (readedServices) {
      const data = {
        info: "El Prixer sí tiene servicios registrados",
        services: fixedServices,
      };
      return data;
    } else {
      const data = {
        info: "El Prixer no tiene servicios registrados",
        services: null,
      };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const readService = async (id) => {
  try {
    let readedService = await Service.findById(id);
    if (readedService) {
      const p = readedService.prixer;
      const user = await Prixer.findOne({ _id: p });
      if (user) {
        readedService.prixer = user.username;
      }
      const data = {
        info: "Servicio encontrado.",
        service: readedService,
        success: true,
      };
      return data;
    } else {
      const data = {
        info: "Servicio no encontrado",
        service: null,
        success: false,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const readByPrixer = async (prixer) => {
  try {
    const data = { username: prixer };
    const readedUser = await userService.readUserByUsername(prixer);
    const readedPrixer = await prixerService.readPrixer(readedUser);
    const readedServices = await Service.find({
      prixer: readedPrixer.prixerId,
    }).exec();
    if (readedServices) {
      const filteredServices = readedServices.filter(
        (service) => service.active === true
      );
      const fixedServices = await Promise.all(
        filteredServices.map(async (s) => {
          const p = s.prixer;
          const user = await Prixer.findOne({ _id: p });
          if (user) {
            s.prixer = user.username;
          }
          return s;
        })
      );
      const data = {
        info: "El príxer sí tiene servicios registrados",
        services: fixedServices,
      };
      return data;
    } else {
      const data = {
        info: "El prixer no tiene servicios registrados",
        services: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const updateMyService = async (id, data) => {
  try {
    const toUpdateService = await Service.findByIdAndUpdate(id, data);
    if (toUpdateService) {
      return {
        service: toUpdateService,
        success: true,
        message: "Servicio actualizado exitosamente.",
      };
    } else {
      return {
        success: false,
        message: "Actualización de servicio fallida.",
      };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const disableService = async (id, data) => {
  try {
    const toUpdateService = await Service.findByIdAndUpdate(id, {
      active: data,
    });
    if (!toUpdateService) {
      return console.log("Art update error: " + err);
    }
    return "Actualización realizada con éxito.";
  } catch (error) {
    console.log(error);
    return error;
  }
};

const unableServices = async (id) => {
  try {
    const change = await Service.updateMany({ prixer: id }, { visible: false });

    return `${change.nModified} documentos de Arte actualizados.`;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const deleteService = async (id) => {
  try {
    const toDelete = await Service.findByIdAndDelete(id);
    if (toDelete) {
      return {
        success: true,
        message: "Servicio eliminado.",
      };
    } else {
      return {
        success: false,
        message:
          "Hubo un error al intentar eliminar el servicio, por favor intente de nuevo.",
      };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};
module.exports = {
  createService,
  getAll,
  getAllActive,
  readMyServices,
  readService,
  readByPrixer,
  updateMyService,
  disableService,
  unableServices,
  deleteService,
};
