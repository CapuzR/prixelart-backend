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
  `
}

const forgotPasswordTemplate = (recoveryUrl: string): string => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Recupera tu contraseña</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body {
        font-family: Arial, Helvetica, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
        -webkit-font-smoothing: antialiased;
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
      
      /* --- ✨ ESTILO PARA EL BOTÓN INTERACTIVO ✨ --- */
      .button-hover:hover {
        background-color: #b8333d !important;
        border-color: #b8333d !important;
      }

      @media (prefers-color-scheme: dark) {
        body, .wrapper {
          background-color: #2d2d2d !important;
        }
        .main {
          background-color: #3d3d3d !important;
          color: #ffffff !important;
        }
        .footer-link {
          color: #aaaaaa !important;
        }
      }
    </style>
  </head>
  <body>
    <center class="wrapper">
      <table class="main" align="center">
        
        <tr>
          <td style="padding: 21px 0;" align="center">
            <img width="108" alt="Logo Prixelart" src="http://cdn.mcauto-images-production.sendgrid.net/6d0762ca48740808/c3f84613-06ad-41d7-a17c-f331f1c25714/326x396.png">
          </td>
        </tr>
        <tr>
          <td style="background-color: #d33f49; padding: 20px; text-align: center;">
            <h1 style="font-size: 28px; font-family: 'Arial Black', Gadget, sans-serif; color: #ffffff; margin: 0;">
              ¡Pronto estarás listo!
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px 30px 30px 30px; text-align: center;">
            <p style="font-size: 16px; line-height: 24px; color: #555555; margin: 0;">
              Solo haz clic en el siguiente botón para restablecer tu contraseña y continuar compartiendo tu creación con el mundo.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding: 0 30px 40px 30px; text-align: center;">
            <table align="center" border="0" cellspacing="0" cellpadding="0" role="presentation">
                <tr>
                  <td align="center" style="border-radius: 6px;" bgcolor="#d33f49">
                    <a href="${recoveryUrl}" target="_blank" class="button-hover" style="font-size: 16px; font-family: 'Arial Black', Helvetica, sans-serif; font-weight: bold; color: #ffffff; text-decoration: none; display: block; padding: 15px 25px; border-radius: 6px; border: 1px solid #d33f49;">
                      Recuperar contraseña
                    </a>
                  </td>
                </tr>
              </table>
            </td>
        </tr>

        <tr>
          <td style="padding-bottom: 20px; text-align: center;">
            <p style="font-size: 12px; color: #888888; margin: 0;">
              ¿El correo no se muestra completo? 
              <a href="#" target="_blank" class="footer-link" style="color: #888888;">Ver en el navegador</a>
            </p>
          </td>
        </tr>

      </table>
    </center>
  </body>
  </html>
  `;
}

export const forgotPassword = async (email: string, recoveryUrl: string) => {
  try {
    console.log(recoveryUrl)
    const emailHtml = forgotPasswordTemplate(recoveryUrl)

    const { data, error } = await resend.emails.send({
      from: "prixers@prixelart.com",
      to: [email],
      subject: `|Prixelart| Recupera tu contraseña aquí!`,
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
