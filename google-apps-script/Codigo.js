/**
 * ==============================================================================
 * Food4You · Breathe Taste Innovate
 * Backend en Google Apps Script
 * ==============================================================================
 * Este script realiza dos tareas clave cuando un cliente realiza una compra:
 * 1. Guarda el archivo Excel (.xlsx) en la carpeta de Google Drive "Ventas por Web".
 * 2. Envía un correo electrónico al cliente desde tu cuenta con el Excel adjunto.
 * ==============================================================================
 */

// Nombre exacto de la carpeta en Google Drive donde se almacenan las ventas
const CARPETA_DRIVE_VENTAS = "Ventas por Web";

/**
 * Endpoint GET: Permite comprobar en el navegador que el Web App está activo.
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    service: "Food4You Sales Webhook",
    message: "El servicio de Food4You está funcionando correctamente.",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Endpoint POST: Recibe los datos de la compra y el archivo Excel en Base64.
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No se han recibido datos en la solicitud POST.");
    }

    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      // Si llega como formulario x-www-form-urlencoded
      data = e.parameter;
    }

    var clientName = data.clientName || "Cliente";
    var clientEmail = data.clientEmail;
    var pedidoNum = data.pedidoNum || ("P-" + new Date().getFullYear());
    var facturaNum = data.facturaNum || "";
    var totalAmount = data.totalAmount || "0.00";
    var fecha = data.fecha || new Date().toLocaleDateString('es-ES');
    var excelBase64 = data.excelBase64;
    var fileName = data.fileName || ("Food4You_Documentacion_" + pedidoNum + ".xlsx");

    if (!clientEmail) {
      throw new Error("El correo electrónico del cliente es obligatorio.");
    }
    if (!excelBase64) {
      throw new Error("No se ha recibido el archivo Excel en Base64.");
    }

    // 1. Decodificar el archivo Excel desde Base64
    var excelBytes = Utilities.base64Decode(excelBase64);
    var mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    var excelBlob = Utilities.newBlob(excelBytes, mimeType, fileName);

    // 2. Obtener o crear la carpeta "Ventas por Web" en Google Drive
    var folder = obtenerOCrearCarpeta(CARPETA_DRIVE_VENTAS);
    var archivoDrive = folder.createFile(excelBlob);
    archivoDrive.setDescription("Venta realizada desde la web Food4You el " + fecha + ". Pedido: " + pedidoNum + " - Cliente: " + clientName);

    // 3. Preparar y enviar el correo electrónico al cliente
    var asunto = "Documentación de su compra · Pedido " + pedidoNum + " - Food4You";
    var cuerpoTexto = "Estimado/a " + clientName + ",\n\n" +
      "Muchas gracias por su compra en Food4You.\n" +
      "Le adjuntamos la documentación oficial de su pedido (Hoja de Pedido, Albarán y Factura).\n\n" +
      "Detalles de la compra:\n" +
      "- Pedido: " + pedidoNum + "\n" +
      (facturaNum ? "- Factura: " + facturaNum + "\n" : "") +
      "- Fecha: " + fecha + "\n" +
      "- Total: " + totalAmount + " €\n\n" +
      "Gracias por confiar en Food4You.\n" +
      "Food4You · Breathe Taste Innovate";

    var cuerpoHtml = generarPlantillaHtmlEmail({
      clientName: clientName,
      pedidoNum: pedidoNum,
      facturaNum: facturaNum,
      fecha: fecha,
      totalAmount: totalAmount,
      fileName: fileName
    });

    GmailApp.sendEmail(clientEmail, asunto, cuerpoTexto, {
      name: "Food4You",
      htmlBody: cuerpoHtml,
      attachments: [excelBlob]
    });

    // 4. Responder con éxito
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Documentación enviada con éxito por correo y guardada en Google Drive.",
      pedidoNum: pedidoNum,
      driveFileId: archivoDrive.getId(),
      driveFileUrl: archivoDrive.getUrl()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("Error en doPost: " + err.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Busca una carpeta por nombre en Google Drive; si no existe, la crea en la raíz.
 */
function obtenerOCrearCarpeta(nombreCarpeta) {
  var carpetas = DriveApp.getFoldersByName(nombreCarpeta);
  if (carpetas.hasNext()) {
    return carpetas.next();
  }
  return DriveApp.createFolder(nombreCarpeta);
}

/**
 * Genera el diseño HTML del correo corporativo para el cliente.
 */
function generarPlantillaHtmlEmail(info) {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f9; margin: 0; padding: 20px; color: #1a1a2e; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(9,51,117,0.08); border: 1px solid #e1e8ed; }
      .header { background: linear-gradient(135deg, #093375 0%, #0d4aa8 100%); padding: 35px 25px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 26px; letter-spacing: -0.5px; font-weight: 700; }
      .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; color: #fbbc05; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
      .content { padding: 30px 25px; }
      .greeting { font-size: 18px; font-weight: 600; color: #093375; margin-bottom: 12px; }
      .info-card { background: #f8fafc; border-left: 4px solid #fbbc05; border-radius: 8px; padding: 18px; margin: 20px 0; }
      .info-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; border-bottom: 1px dashed #e2e8f0; }
      .info-row:last-child { border-bottom: none; font-weight: bold; font-size: 16px; color: #093375; }
      .attachment-box { background: #eef4fc; border: 1px solid #093375; border-radius: 10px; padding: 15px; margin: 25px 0; display: flex; align-items: center; }
      .attachment-icon { font-size: 28px; margin-right: 15px; }
      .attachment-text strong { color: #093375; font-size: 14px; }
      .attachment-text span { font-size: 12px; color: #555; display: block; margin-top: 2px; }
      .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Food4You</h1>
        <p>Breathe · Taste · Innovate</p>
      </div>
      <div class="content">
        <div class="greeting">¡Hola, ${info.clientName}!</div>
        <p>Queremos agradecerte tu compra en nuestra tienda web. Tu pedido ha sido tramitado con éxito y ya estamos preparando toda tu documentación.</p>
        
        <div class="info-card">
          <div class="info-row"><span>Número de Pedido:</span><strong>${info.pedidoNum}</strong></div>
          ${info.facturaNum ? `<div class="info-row"><span>Número de Factura:</span><strong>${info.facturaNum}</strong></div>` : ''}
          <div class="info-row"><span>Fecha:</span><span>${info.fecha}</span></div>
          <div class="info-row"><span>Total Pagado:</span><span>${info.totalAmount} €</span></div>
        </div>

        <div class="attachment-box">
          <div class="attachment-icon">📎</div>
          <div class="attachment-text">
            <strong>${info.fileName}</strong>
            <span>Incluye la Hoja de Pedido, Albarán de Entrega y Factura en formato Excel.</span>
          </div>
        </div>

        <p style="font-size: 13px; color: #555; line-height: 1.5;">
          Encontrarás el documento Excel adjunto a este correo electrónico. También se ha archivado de forma segura una copia digital en nuestro sistema en la carpeta <strong>Ventas por Web</strong>.
        </p>
      </div>
      <div class="footer">
        Food4You · Soluciones de cocina y alimentación para empresas.<br>
        Este es un mensaje automático generado tras la compra en nuestra tienda online.
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Función para probar el script directamente desde el editor de Apps Script.
 * Selecciona "testEnvio" en la barra superior y haz clic en "Ejecutar".
 */
function testEnvio() {
  var miCorreo = Session.getActiveUser().getEmail();
  Logger.log("Ejecutando prueba de envío hacia: " + miCorreo);

  // Crear un archivo de prueba simulado
  var contenidoSimulado = "Simulación de Excel Food4You";
  var testBlob = Utilities.newBlob(contenidoSimulado, "text/plain", "Food4You_Documentacion_TEST.xlsx");

  // 1. Probar guardado en carpeta
  var folder = obtenerOCrearCarpeta(CARPETA_DRIVE_VENTAS);
  var archivo = folder.createFile(testBlob);
  Logger.log("Carpeta Drive verificada: " + folder.getName());
  Logger.log("Archivo creado en Drive con ID: " + archivo.getId());

  // 2. Probar envío de email
  GmailApp.sendEmail(miCorreo, "Prueba de conexión Food4You -> Apps Script", "Esta es una prueba de conexión exitosa.", {
    name: "Food4You Test",
    htmlBody: generarPlantillaHtmlEmail({
      clientName: "Usuario de Prueba",
      pedidoNum: "P-2026-TEST",
      facturaNum: "F-2026-TEST",
      fecha: new Date().toLocaleDateString('es-ES'),
      totalAmount: "125.00",
      fileName: "Food4You_Documentacion_TEST.xlsx"
    }),
    attachments: [testBlob]
  });

  Logger.log("¡Prueba completada! Revisa tu bandeja de entrada en " + miCorreo + " y tu carpeta de Drive '" + CARPETA_DRIVE_VENTAS + "'.");
}
