const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (message) => {
  try {
    const response = await sgMail.send(message);
    return {
      success: true,
      info: "Envío de correo exitoso.",
    };
  } catch (error) {
    // console.log(error);
    return {
      success: false,
      info: "Error en envío de correo. Por favor inténtalo de nuevo.",
    };
  }
};

module.exports = { sendEmail };
