import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);


export const sendEmail = async (message: sgMail.MailDataRequired): Promise<{ success: boolean; info: string; }> => {
  try {
    await sgMail.send(message);
    return {
      success: true,
      info: "Envío de correo exitoso.",
    };
  } catch (error) {
    return {
      success: false,
      info: "Error en envío de correo. Por favor inténtalo de nuevo.",
    };
  }
};
