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
  } catch (e) {
    console.log(error);
    return error;
  }
};
const readById = async (testimonial) => {
  try {
    const readedTestimonial = await Testimonial.find({ _id: testimonial._id });
    if (readedTestimonial) {
      const data = {
        info: "Todos los testimonios disponibles",
        testimonials: readedTestimonial,
      };
      return data;
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
    const readedTestimonials = await Testimonial.find({ active: true });
    if (readedTestimonials) {
      const data = {
        info: "Todos los testimonios disponibles",
        testimonials: readedTestimonials,
      };
      return data;
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
const readTestimonials = async () => {
  try {
    const readedTestimonials = await Testimonial.find();
    if (readedTestimonials) {
      const data = {
        info: "Todos los testimonios disponibles",
        testimonials: readedTestimonials,
      };
      return data;
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

const updateTestimonial = async (testimonialData) => {
  try {
    const toUpdateTestimonial = await Testimonial.findOne({
      _id: testimonialData._id,
    });
    toUpdateTestimonial.set(testimonialData);
    const updatedProduct = await toUpdateTestimonial.save();
    if (!updatedProduct) {
      return console.log("Testimonial update error: " + err);
    }

    return "Actualización realizada con éxito.";
  } catch (e) {
    console.log(error);
    return error;
  }
};

module.exports = {
  createTestimonial,
  readById,
  readAllTestimonials,
  readTestimonials,
  updateTestimonial,
};
