import { Resend } from 'resend';
import { Order, OrderLine, Tax } from '../order/orderModel.ts';

const resend = new Resend('re_5p8exeLt_6r7WpSjoreg5jBT4qtAhwRhZ');
// This var must NOT be here!
const ADMIN_EMAIL = 'iamwar2070@gmail.com';

export const thanksForYourPurchase = async (order: Order) => {
  try {
    const emailHtml = createOrderTemplate(order);

    const { data, error } = await resend.emails.send({
      from: 'prixers@prixelart.com',
      to: [order?.consumerDetails?.basic?.email!],
      subject: `|Prixelart| Gracias por comprar ${order?.consumerDetails?.basic?.name} ${order?.consumerDetails?.basic?.lastName}!`,
      html: emailHtml,
    });

    if (error) {
      console.error('Error al enviar el correo:', error);
      return { success: false, error };
    }

    console.log('Correo enviado exitosamente:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Excepción al enviar el correo:', error);
    return { success: false, error };
  }
};

export const sendWallpaperEmail = async (
  email: string,
  artId: string,
  artName: string,
  prixer: string,
  fileBuffer: Buffer,
  avatar?: string | null
) => {
  try {
    const cidName = 'wallpaper_exclusive';
    let prixerAvatar = avatar || null;
    const base64Image = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
    const emailHtml = wallpaperEmailTemplate(artName, `cid:${cidName}`, prixer, prixerAvatar);
    const { data, error } = await resend.emails.send({
      from: 'Prixelart <prixers@prixelart.com>',
      to: [email],
      subject: `|Prixelart| ${artName}`,
      attachments: [
        {
          filename: `${artId}.jpg`,
          content: fileBuffer,
          cid: cidName,
          content_id: cidName, 
          // disposition: 'inline',
        } as any,
      ],
      html: emailHtml,
    });
    if (error) {
      console.error('Error al enviar el correo:', error);
      return { success: false, error };
    }

    console.log('Correo enviado exitosamente:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Excepción al enviar el correo:', error);
    return { success: false, error };
  }
};

const wallpaperEmailTemplate = (
  artName: string,
  artImageUrl: string,
  prixerName: string,
  prixerAvatar?: string | null
): string => {
  const brandColor = '#D23F49';
  const brandGradient = '#B8353E';
  const brandLogo = 'http://cdn.mcauto-images-production.sendgrid.net/6d0762ca48740808/c3f84613-06ad-41d7-a17c-f331f1c25714/326x396.png';
  const avatarSrc = prixerAvatar && prixerAvatar !== "" 
    ? prixerAvatar 
    : brandLogo;

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Tu Wallpaper Exclusivo</title>
    <style>
      body, table, td, a { text-decoration: none !important; }
      table { border-spacing: 0 !important; border-collapse: collapse !important; }
      img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
      
      @media screen and (max-width: 600px) {
        .main-table { width: 100% !important; }
        .responsive-image { width: 100% !important; height: auto !important; }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Helvetica, Arial, sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f8fafc">
      <tr>
        <td align="center" style="padding: 20px 0;">
          
          <!-- Contenedor Principal -->
          <table width="600" border="0" cellspacing="0" cellpadding="0" class="main-table" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            
            <!-- 1. HEADER (Rojo) -->
            <tr>
              <td align="center" bgcolor="${brandGradient}" style="padding: 60px 40px 20px 40px;">
                <div style="color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 3px; font-size: 10px; font-weight: bold; margin-bottom: 15px;">Exclusivo para ti</div>
                <h1 style="color: #ffffff; font-size: 32px; font-weight: 800; margin: 0; letter-spacing: -1px;">Tu Wallpaper de Regalo</h1>
                <p style="color: rgba(255,255,255,0.9); font-size: 16px; line-height: 1.5; margin-top: 15px; max-width: 380px;">
                  Descarga este wallpaper creado especialmente para ti por uno de nuestros talentosos prixers.
                </p>
              </td>
            </tr>

            <!-- 2. FILA DEL LOGO (Mantiene el fondo rojo para que el círculo blanco resalte) -->
            <tr>
              <td align="center" bgcolor="${brandColor}" style="background: linear-gradient(180deg, ${brandGradient} 50%, #FFF 0%); padding: 0;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center" style="line-height: 0;">
                      <!-- Círculo blanco del Logo -->
                      <table width="120" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="border-radius: 60px; border-collapse: separate !important; box-shadow: 0 10px 20px rgba(0,0,0,0.1); border: 2px solid rgba(210,63,73,0.1);">
                        <tr>
                          <td align="center" style="padding:22px 25px;">
                            <img src="${brandLogo}" width="60" style="display: block; width: 60px; height: auto;" alt="Logo">
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- 3. CUERPO DEL CORREO (Empieza en Blanco) -->
            <tr>
              <td bgcolor="#ffffff" style="padding: 40px;">
                
                <!-- Preview del Wallpaper -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                  <tr>
                    <td align="center">
                      <img src="${artImageUrl}" width="520" alt="Preview de ${artName}" class="responsive-image" style="display: block; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); object-fit: cover;"/>
                    </td>
                  </tr>
                </table>
                <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-bottom: 30px;">
                  Tip: En móviles, puedes mantener presionada la imagen y usar la opción "Guardar" para descargarla directamente.
                </p>

                <!-- Separador -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 40px 0;">
                  <tr>
                    <td align="center">
                      <div style="height: 1px; width: 100%; background: linear-gradient(to right, transparent, #e2e8f0, transparent);"></div>
                    </td>
                  </tr>
                </table>

                <!-- Info del Artista -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f8fafc" style="">
                  <tr style="padding: 16px; border-radius: 20px; border: 1px solid gainsboro; display: flex;">
                    <td width="80" valign="top">
                       <img src="${avatarSrc}" style="width: 64px; height: 64px; background-color: ${brandColor}; border-radius: 32px; object-fit: cover;" alt="Avatar de ${prixerName}"/>
                    </td>
                    <td valign="middle" style="padding-left: 15px; display: flex; flex-direction: column; justify-content: center;">
                      <p style="margin: 0; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Arte de</p>
                      <h3 style="margin: 5px 0 0 0; color: #1e293b; font-size: 20px;">${prixerName}</h3>
                    </td>
                  </tr>
                </table>

                <!-- Botones de Acción -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center">
                      <div style="margin-top: 20px;">
                         <a href="https://prixelart.com/${prixerName}" style="color: ${brandColor}; font-size: 14px; font-weight: bold; text-decoration: none;">Ver Perfil del Prixer →</a>
                      </div>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <!-- 4. FOOTER -->
            <tr>
              <td align="center" bgcolor="${brandColor}" style="padding: 40px; background: linear-gradient(to right, ${brandColor}, ${brandGradient});">
                <p style="color: #ffffff; margin: 0; font-size: 14px; opacity: 0.9;">
                  ¿Te gustó este wallpaper? <a href="https://prixelart.com/galeria" style="text-decoration: underline !important; color: #ffffff; font-weight: bold">Descubre más obras increíbles.</a>
                </p>
                <p style="color: rgba(255,255,255,0.6); margin-top: 20px; font-size: 12px; letter-spacing: 1px;">
                  © ${new Date().getFullYear()} PRIXELART · TODOS LOS DERECHOS RESERVADOS
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

const createOrderTemplate = (order: Order): string => {
  const formatSelectionDetails = (line: OrderLine): string => {
    if (!line.item.product.selection || line.item.product.selection.length === 0) {
      return '';
    }
    const details = line.item.product.selection
      .map((attr) => `${attr.name}: ${attr.value}`)
      .join(', ');
    return `<br><small style="color: #333333;">Selección: ${details}</small>`;
  };

  const generateProductLines = (lines: OrderLine[]): string => {
    return lines
      .map(
        (line) => `
      <tr class="product-row">
        <td>
          <strong>${line.item.product.name}</strong>
          ${line.item.art && 'title' in line.item.art ? `<br><small style="color: #333333;">Arte: ${line.item.art.title}</small>` : ''}
          ${formatSelectionDetails(line)}
        </td>
        <td style="text-align: center;">${line.quantity}</td>
        <td style="text-align: right;">$${line.subtotal.toFixed(2)}</td>
      </tr>
    `
      )
      .join('');
  };

  const generateTaxLines = (taxes: Tax[]): string => {
    return taxes
      .map(
        (tax) => `
      <tr>
        <td style="text-align: right; padding-right: 20px;">${tax.name}:</td>
        <td style="text-align: right;">$${tax.amount.toFixed(2)}</td>
      </tr>
    `
      )
      .join('');
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Confirmación de Compra</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        table { border-spacing: 0; width: 100%; }
        td { padding: 0; }
        img { border: 0; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f4f4f4; padding: 40px 0; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; font-family: Arial, Helvetica, sans-serif; color: #333333; }
        .content-header { text-align: center; background-color: #d33f49; padding: 40px; }
        .content-header h2 { color: #fefefe; font-family: 'Arial Black', Gadget, sans-serif; margin: 0; }
        .content-header p { color: #fefefe; }
        .details-section { padding: 20px 30px; }
        .details-section h3 { margin-top: 0; text-align: center; color: #000000; }
        .product-table { margin-bottom: 20px; }
        .product-table th { text-align: left; padding-bottom: 10px; border-bottom: 2px solid #eeeeee; color: #000000; }
        .product-row td { padding: 10px 0; border-bottom: 1px solid #eeeeee; }
        .totals-table { width: 100%; max-width: 300px; float: right; }
        .totals-table td { padding: 5px 0; }
        .totals-table .total-row td { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 10px; color: #000000; }
        .shipping-info { padding: 20px 30px; background-color: #f8f8f8; }
        .clearfix::after { content: ""; clear: both; display: table; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <table class="main" align="center">
          
          <tr>
            <td style="padding: 21px 0;" valign="top" align="center">
              <img class="max-width" border="0" style="display:block; color:#d33f49; max-width:18% !important; width:18%; height:auto !important;" width="108" alt="Logo de la empresa" src="http://cdn.mcauto-images-production.sendgrid.net/6d0762ca48740808/c3f84613-06ad-41d7-a17c-f331f1c25714/326x396.png">
            </td>
          </tr>

          <tr>
            <td>
              <div class="content-header">
                <h2>¡Gracias por tu compra, ${order.consumerDetails?.basic?.name} ${order.consumerDetails?.basic?.lastName}!</h2>
                <p>Hemos recibido tu pedido #${order._id?.toString().slice(-6)} y ya lo estamos preparando. Aquí tienes el resumen:</p>
              </div>
            </td>
          </tr>

          <tr>
            <td class="details-section">
              <h3>Resumen de tu Pedido</h3>
              <table class="product-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th style="text-align: center;">Cantidad</th>
                    <th style="text-align: right;">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  ${generateProductLines(order.lines)}
                </tbody>
              </table>

              <div class="clearfix">
                <table class="totals-table">
                  <tbody>
                    <tr>
                      <td style="text-align: right; padding-right: 20px;">Subtotal:</td>
                      <td style="text-align: right;">$${order.subTotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style="text-align: right; padding-right: 20px;">Envío (${order.shipping.method.name}):</td>
                      <td style="text-align: right;">$${(order.shippingCost || 0).toFixed(2)}</td>
                    </tr>
                    ${generateTaxLines(order.tax)}
                    <tr class="total-row">
                      <td style="text-align: right; padding-right: 20px;">Total:</td>
                      <td style="text-align: right;">$${order.total.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;
};

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
};

export const forgotPassword = async (email: string, recoveryUrl: string) => {
  try {
    const emailHtml = forgotPasswordTemplate(recoveryUrl);
    const { data, error } = await resend.emails.send({
      from: 'prixers@prixelart.com',
      to: [email],
      subject: `|Prixelart| Recupera tu contraseña aquí!`,
      html: emailHtml,
    });

    if (error) {
      console.error('Error al enviar el correo:', error);
      return { success: false, error };
    }

    console.log('Correo enviado exitosamente:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Excepción al enviar el correo:', error);
    return { success: false, error };
  }
};

export const sendAdminErrorAlert = async (errorMessage: string, orderData?: any) => {
  try {
    const orderJson = orderData ? JSON.stringify(orderData, null, 2) : 'Sin datos';

    const { data, error } = await resend.emails.send({
      from: 'System Alert <ventas@prixelart.com>',
      to: [ADMIN_EMAIL],
      subject: `🚨 ERROR CRÍTICO: Fallo al crear Orden - ${new Date().toLocaleTimeString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h1 style="color: #d32f2f;">❌ Error al Procesar Orden</h1>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Mensaje del Error:</strong></p>
          <div style="background-color: #ffebee; padding: 15px; border-left: 5px solid #d32f2f; margin-bottom: 20px;">
            <code>${errorMessage}</code>
          </div>

          <h3>📦 Datos del Intento de Orden:</h3>
          <p><strong>Cliente:</strong> ${orderData?.consumerDetails?.basic?.email || 'Desconocido'}</p>
          <p><strong>Monto Total:</strong> ${orderData?.total || 'N/A'}</p>
          
          <details>
            <summary style="cursor: pointer; color: #1976d2; font-weight: bold;">Ver JSON Completo (Click aquí)</summary>
            <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto;">
${orderJson}
            </pre>
          </details>

          <hr />
          <p style="font-size: 12px; color: #777;">Este es un mensaje automático del sistema backend.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error de Resend al intentar enviar la alerta:', error);
      return;
    }

    console.log('📧 Alerta de error enviada al administrador vía Resend.');
  } catch (err) {
    console.error('Excepción al enviar alerta de Resend:', err);
  }
};
