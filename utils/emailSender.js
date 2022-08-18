const { builtinModules } = require('module');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const sendEmail = (message)=> {
  return sgMail
  .send(message)
  .then((response) => {
    return {
      success: true,
      info: 'Envío de correo exitoso.'
    }
  })
  .catch((error) => {
    return {
      success: false,
      info: 'Error en envío de correo. Por favor inténtalo de nuevo.'
    }
  })
}


module.exports = { sendEmail }

// const message = {
//     from: 'noresponder@prixelart.com', // Sender address
//     to: 'capuzr@gmail.com',         // List of recipients
//     subject: 'Design Your Model S | Tesla', // Subject line
//     text: 'Have the most fun you can in a car. Get your Tesla today!' // Plain text body
// };