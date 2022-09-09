const testimonialServices = require("./testimonialServices");

//CRUD

const createTestimonial = async (req, res) => {
  try {
    const TestimonialData = {
      type: req.body.type,
      name: req.body.name,
      value: req.body.value,
      avatar: req.body.avatar,
      footer: req.body.footer,
      company: req.body.company,
      status: req.body.status,
    };

    console.log(testimonialData, "este es el registro");

    res.send(await testimonialServices.createTestimonial(testimonialData));
  } catch (e) {
    res.status(500).send(e);
  }
};

const readTestimonial = async (req, res) => {
  try {
    const name = await testimonialControllers.readTestimonialByName(req);
    const readedTestimonial = await testimonialServices.readTestimonial(name);
    res.send(readedTestimonial);
  } catch (err) {
    res.status(500).send(err);
  }
};

const readAllTestimonials = async (req, res) => {
  try {
    const readedTestimonials = await testimonialServices.readAllTestimonials();
    res.send(readedTestimonials);
  } catch (err) {
    res.status(500).send(err);
  }
};

const updateTestimonial = async (req, res) => {
  try {
    const testimonial = {
      type: req.body.type,
      name: req.body.name,
      value: req.body.value,
      avatar: req.body.avatar,
      footer: req.body.footer,
      company: req.body.company,
      status: req.body.status,
    };

    const updates = await testimonialServices.updateTestimonial(testimonial);
    return res.send(updates);
  } catch (err) {
    res.status(500).send(err);
  }
};

const deleteTestimonial = async (req, res) => {
  try {
    const deleteTestimonial = await testimonialServices.deleteTestimonial(
      req.body
    );
    return res.send(deleteTestimonial);
  } catch (err) {
    res.status(500).send(err);
  }
};

module.exports = {
  createTestimonial,
  readAllTestimonials,
  readTestimonial,
  updateTestimonial,
  deleteTestimonial,
};

//CRUD END
