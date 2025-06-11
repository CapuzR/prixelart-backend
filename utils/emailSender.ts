import { Resend } from "resend"
import { BasicInfo } from "../order/orderModel.ts"
const resend = new Resend("re_5p8exeLt_6r7WpSjoreg5jBT4qtAhwRhZ")

export const sendWelcomeEmail = async (basic: BasicInfo) => {
  try {
    const emailHtml = createOrderTemplate(basic)

    const { data, error } = await resend.emails.send({
      from: "prixers@prixelart.com",
      to: [basic.email!],
      subject: `|Prixelart| Gracias por comprar ${basic.name}!`,
      html: emailHtml,
    })

    if (error) {
      console.error("Error al enviar el correo:", error)
      return { success: false, error }
    }

    console.log("Correo enviado exitosamente:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Excepción al enviar el correo:", error)
    return { success: false, error }
  }
}

const createOrderTemplate = (basic: BasicInfo): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Confirmación de Compra</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        table {
          border-spacing: 0;
        }
        td {
          padding: 0;
        }
        img {
          border: 0;
        }
        .wrapper {
          width: 100%;
          table-layout: fixed;
          background-color: #f4f4f4;
          padding-bottom: 60px;
        }
        .main {
          background-color: #ffffff;
          margin: 0 auto;
          width: 100%;
          max-width: 600px;
          border-spacing: 0;
          font-family: Arial, Helvetica, sans-serif;
          color: #171a1b;
        }
        .content {
          text-align: center;
          background-color: #333;
          padding: 40px;
        }
        .content h2 {
          color: #fefefe;
          font-family: 'Arial Black', Gadget, sans-serif;
          margin: 0;
        }
        .content p {
          color: #fefefe;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <table class="main" align="center">
          
          <tr>
            <td style="font-size:6px; line-height:10px; padding:21px 0px 21px 0px;" valign="top" align="center">
              <img class="max-width" border="0" style="display:block; color:#d33f49; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:18% !important; width:18%; height:auto !important;" width="108" alt="Logo de la empresa" data-proportionally-constrained="true" data-responsive="true" src="http://cdn.mcauto-images-production.sendgrid.net/6d0762ca48740808/c3f84613-06ad-41d7-a17c-f331f1c25714/326x396.png">
            </td>
          </tr>

          <tr>
            <td>
              <div class="content">
                <h2>¡Gracias por tu compra, ${basic.name} ${basic.lastName}!</h2>
                <p>Tu pedido está siendo procesado y te notificaremos cuando sea enviado.</p>
              </div>
            </td>
          </tr>

        </table>
      </div>
    </body>
    </html>
  `;
};
