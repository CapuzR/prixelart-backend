const ObjectId = require("mongoose").Types.ObjectId;

const Testimonial = require("./testimonialModel");

const createTestimonial = async (testimonialData) => {
  try {
    const newTestimonial = await new Testimonial(testimonialData).save();
    if (newTestimonial) {
      return {
        success: true,
        testimonialData: null,
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
const readById = async (testimonial) => {
  try {
    const readedTestimonial = await Testimonial.findOne({
      _id: testimonial,
    });
    if (readedTestimonial) {
      return readedTestimonial;
    } else {
      const data = {
        info: "No hay testimonios registrados",
        arts: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const readAllTestimonials = async () => {
  try {
    const readedTestimonials = await Testimonial.find({}).exec();
    if (readedTestimonials) {
      const data = {
        info: "Todos los testimonios disponibles",
        testimonials: readedTestimonials,
      };
      return data;
    } else {
      const data = {
        info: "No hay testimonios registrados",
        testimonials: null,
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const updateTestimonial = async (testimonialId, testimonialData) => {
  try {
    const toUpdateTestimonial = await Testimonial.findByIdAndUpdate(
      testimonialId
    );
    toUpdateTestimonial.avatar = testimonialData.avatar;
    toUpdateTestimonial.type = testimonialData.type;
    toUpdateTestimonial.value = testimonialData.value;
    toUpdateTestimonial.footer = testimonialData.footer;
    toUpdateTestimonial.status = testimonialData.status;
    toUpdateTestimonial.name = testimonialData.name;

    const updatedTestimonial = await toUpdateTestimonial.save();
    if (!updatedTestimonial) {
      return console.log("Testimonial update error: " + err);
    }
    return "Actualización realizada con éxito.";
  } catch (e) {
    console.log(e);
    return e;
  }
};

const deleteTestimonial = async (testimonialId) => {
  try {
    await Testimonial.findByIdAndDelete(testimonialId);
    return "Testimonio eliminado exitosamente";
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = {
  createTestimonial,
  readById,
  readAllTestimonials,
  updateTestimonial,
  deleteTestimonial,
};
