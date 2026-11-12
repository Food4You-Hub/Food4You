/**
 * ==============================================================================
 * Food4You · Breathe Taste Innovate
 * Backend en Google Apps Script
 * ==============================================================================
 * Funcionalidades principales:
 * 1. Guarda el archivo Excel (.xlsx) en Google Drive en la carpeta "Ventas por Web".
 * 2. Cálculo de transporte con Google Maps (ruta más corta en km) desde el origen fijo:
 *    "C. Granadillos, 11630 Arcos de la Frontera, Cádiz".
 * 3. Aplicación de tabla de tarifas (Speed Press) con peso (kg), volumen (m³) y bultos.
 *    - Si el pedido es >= 500,00 € IVA incluido: TRANSPORTE GRATUITO (se omite cálculo).
 *    - Si el pedido es < 500,00 € IVA incluido: se calcula según distancia y peso tasable.
 * 4. Envío automático de correo al cliente con Excel adjunto y desglose de transporte.
 * ==============================================================================
 */

// Origen permanente de todos los envíos
const ORIGEN_ENVIO = "C. Granadillos, 11630 Arcos de la Frontera, Cádiz";

// Umbral para transporte gratuito (IVA incluido)
const UMBRAL_TRANSPORTE_GRATIS = 500.00;

// Carpeta en Google Drive para guardar la documentación
const CARPETA_DRIVE_VENTAS = "Ventas por Web";

// Matriz oficial de tarifas Speed Press (50 tramos)
const TARIFAS_SPEED_PRESS = [
  { dKm: 0.0, hKm: 100.0, dKg: 0.0, hKg: 1000.0, unit: 48.0, minPrice: 18.3 },
  { dKm: 0.0, hKm: 100.0, dKg: 1000.0, hKg: 3000.0, unit: 432.0, minPrice: 18.4 },
  { dKm: 0.0, hKm: 100.0, dKg: 3000.0, hKg: 5000.0, unit: 384.0, minPrice: 18.5 },
  { dKm: 0.0, hKm: 100.0, dKg: 5000.0, hKg: 15000.0, unit: 336.0, minPrice: 18.6 },
  { dKm: 0.0, hKm: 100.0, dKg: 15000.0, hKg: 24000.0, unit: 288.0, minPrice: 18.7 },
  { dKm: 100.0, hKm: 150.0, dKg: 0.0, hKg: 1000.0, unit: 208.0, minPrice: 21.03 },
  { dKm: 100.0, hKm: 150.0, dKg: 1000.0, hKg: 3000.0, unit: 48.0, minPrice: 21.03 },
  { dKm: 100.0, hKm: 150.0, dKg: 3000.0, hKg: 5000.0, unit: 44.0, minPrice: 21.03 },
  { dKm: 100.0, hKm: 150.0, dKg: 5000.0, hKg: 15000.0, unit: 0.04, minPrice: 21.03 },
  { dKm: 100.0, hKm: 150.0, dKg: 15000.0, hKg: 24000.0, unit: 36.0, minPrice: 21.03 },
  { dKm: 150.0, hKm: 200.0, dKg: 0.0, hKg: 1000.0, unit: 224.0, minPrice: 24.05 },
  { dKm: 150.0, hKm: 200.0, dKg: 1000.0, hKg: 3000.0, unit: 56.0, minPrice: 24.06 },
  { dKm: 150.0, hKm: 200.0, dKg: 3000.0, hKg: 5000.0, unit: 52.0, minPrice: 24.07 },
  { dKm: 150.0, hKm: 200.0, dKg: 5000.0, hKg: 15000.0, unit: 48.0, minPrice: 24.08 },
  { dKm: 150.0, hKm: 200.0, dKg: 15000.0, hKg: 24000.0, unit: 44.0, minPrice: 24.09 },
  { dKm: 200.0, hKm: 250.0, dKg: 0.0, hKg: 1000.0, unit: 0.24, minPrice: 27.06 },
  { dKm: 200.0, hKm: 250.0, dKg: 1000.0, hKg: 3000.0, unit: 64.0, minPrice: 27.07 },
  { dKm: 200.0, hKm: 250.0, dKg: 3000.0, hKg: 5000.0, unit: 0.06, minPrice: 27.08 },
  { dKm: 200.0, hKm: 250.0, dKg: 5000.0, hKg: 15000.0, unit: 56.0, minPrice: 27.09 },
  { dKm: 200.0, hKm: 250.0, dKg: 15000.0, hKg: 24000.0, unit: 52.0, minPrice: 27.1 },
  { dKm: 250.0, hKm: 350.0, dKg: 0.0, hKg: 1000.0, unit: 256.0, minPrice: 30.06 },
  { dKm: 250.0, hKm: 350.0, dKg: 1000.0, hKg: 3000.0, unit: 0.08, minPrice: 30.07 },
  { dKm: 250.0, hKm: 350.0, dKg: 3000.0, hKg: 5000.0, unit: 72.0, minPrice: 30.08 },
  { dKm: 250.0, hKm: 350.0, dKg: 5000.0, hKg: 15000.0, unit: 64.0, minPrice: 30.09 },
  { dKm: 250.0, hKm: 350.0, dKg: 15000.0, hKg: 24000.0, unit: 56.0, minPrice: 30.1 },
  { dKm: 350.0, hKm: 500.0, dKg: 0.0, hKg: 1000.0, unit: 272.0, minPrice: 33.07 },
  { dKm: 350.0, hKm: 500.0, dKg: 1000.0, hKg: 3000.0, unit: 96.0, minPrice: 33.08 },
  { dKm: 350.0, hKm: 500.0, dKg: 3000.0, hKg: 5000.0, unit: 88.0, minPrice: 33.09 },
  { dKm: 350.0, hKm: 500.0, dKg: 5000.0, hKg: 15000.0, unit: 0.08, minPrice: 33.1 },
  { dKm: 350.0, hKm: 500.0, dKg: 15000.0, hKg: 24000.0, unit: 72.0, minPrice: 33.11 },
  { dKm: 500.0, hKm: 750.0, dKg: 0.0, hKg: 1000.0, unit: 288.0, minPrice: 36.07 },
  { dKm: 500.0, hKm: 750.0, dKg: 1000.0, hKg: 3000.0, unit: 112.0, minPrice: 36.08 },
  { dKm: 500.0, hKm: 750.0, dKg: 3000.0, hKg: 5000.0, unit: 96.0, minPrice: 36.09 },
  { dKm: 500.0, hKm: 750.0, dKg: 5000.0, hKg: 15000.0, unit: 88.0, minPrice: 36.1 },
  { dKm: 500.0, hKm: 750.0, dKg: 15000.0, hKg: 24000.0, unit: 0.08, minPrice: 36.11 },
  { dKm: 750.0, hKm: 1000.0, dKg: 0.0, hKg: 1000.0, unit: 304.0, minPrice: 39.08 },
  { dKm: 750.0, hKm: 1000.0, dKg: 1000.0, hKg: 3000.0, unit: 128.0, minPrice: 39.09 },
  { dKm: 750.0, hKm: 1000.0, dKg: 3000.0, hKg: 5000.0, unit: 0.12, minPrice: 39.1 },
  { dKm: 750.0, hKm: 1000.0, dKg: 5000.0, hKg: 15000.0, unit: 112.0, minPrice: 39.11 },
  { dKm: 750.0, hKm: 1000.0, dKg: 15000.0, hKg: 24000.0, unit: 96.0, minPrice: 39.12 },
  { dKm: 1000.0, hKm: 1500.0, dKg: 0.0, hKg: 1000.0, unit: 0.32, minPrice: 42.08 },
  { dKm: 1000.0, hKm: 1500.0, dKg: 1000.0, hKg: 3000.0, unit: 144.0, minPrice: 42.09 },
  { dKm: 1000.0, hKm: 1500.0, dKg: 3000.0, hKg: 5000.0, unit: 136.0, minPrice: 42.1 },
  { dKm: 1000.0, hKm: 1500.0, dKg: 5000.0, hKg: 15000.0, unit: 128.0, minPrice: 42.11 },
  { dKm: 1000.0, hKm: 1500.0, dKg: 15000.0, hKg: 24000.0, unit: 0.12, minPrice: 42.12 },
  { dKm: 1500.0, hKm: 25000.0, dKg: 0.0, hKg: 1000.0, unit: 336.0, minPrice: 45.09 },
  { dKm: 1500.0, hKm: 25000.0, dKg: 1000.0, hKg: 3000.0, unit: 0.16, minPrice: 45.1 },
  { dKm: 1500.0, hKm: 25000.0, dKg: 3000.0, hKg: 5000.0, unit: 384.0, minPrice: 45.11 },
  { dKm: 1500.0, hKm: 25000.0, dKg: 5000.0, hKg: 15000.0, unit: 336.0, minPrice: 45.12 },
  { dKm: 1500.0, hKm: 25000.0, dKg: 15000.0, hKg: 24000.0, unit: 288.0, minPrice: 45.13 },
];

/**
 * Endpoint GET: Comprobación rápida de estado desde el navegador.
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    service: "Food4You Sales & Logistics Webhook",
    message: "El servicio de Food4You está funcionando correctamente.",
    origen: ORIGEN_ENVIO,
    umbralGratuito: UMBRAL_TRANSPORTE_GRATIS,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Endpoint POST: Procesa la compra, calcula transporte con Google Maps y envía email.
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
      data = e.parameter || {};
    }

    var clientName = data.clientName || "Cliente";
    var clientEmail = data.clientEmail;
    var clientNif = data.clientNif || "";
    var clientTel = data.clientTel || "";
    var clientDireccion = data.clientDireccion || "";
    var pedidoNum = data.pedidoNum || ("P-" + new Date().getFullYear());
    var facturaNum = data.facturaNum || "";
    var totalAmount = parseFloat(data.totalAmount || "0") || 0.0;
    var totalWeight = parseFloat(data.totalWeight || "0") || 0.0;
    var totalVol = parseFloat(data.totalVol || "0") || 0.0;
    var totalBultos = parseInt(data.totalBultos || "0", 10) || 0;
    var fecha = data.fecha || new Date().toLocaleDateString('es-ES');
    var excelBase64 = data.excelBase64;
    var fileName = data.fileName || ("Food4You_Documentacion_" + pedidoNum + ".xlsx");

    if (!clientEmail) {
      throw new Error("El correo electrónico del cliente es obligatorio.");
    }
    if (!excelBase64) {
      throw new Error("No se ha recibido el archivo Excel en Base64.");
    }

    // 1. Cálculo de Transporte con Google Maps y matriz de tarifas
    var transporte = calcularTransporteGoogleMaps(clientDireccion, totalAmount, totalWeight, totalVol, totalBultos);

    // 2. Decodificar archivo Excel desde Base64
    var excelBytes = Utilities.base64Decode(excelBase64);
    var mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    var excelBlob = Utilities.newBlob(excelBytes, mimeType, fileName);

    // 3. Guardar en carpeta "Ventas por Web" de Google Drive
    var folder = obtenerOCrearCarpeta(CARPETA_DRIVE_VENTAS);
    var archivoDrive = folder.createFile(excelBlob);
    var descLogistica = transporte.gratis
      ? "Transporte GRATIS (Pedido >= 500 €)"
      : (transporte.distanciaKm ? transporte.distanciaKm.toFixed(1) + " km · " : "") + transporte.costeTransporte.toFixed(2) + " €";
    archivoDrive.setDescription("Venta web " + fecha + ". Pedido: " + pedidoNum + " - Cliente: " + clientName + " - " + descLogistica);

    // 4. Preparar y enviar correo electrónico al cliente
    var asunto = "Documentación de su compra · Pedido " + pedidoNum + " - Food4You";
    var cuerpoTexto = "Estimado/a " + clientName + ",\n\n" +
      "Muchas gracias por su compra en Food4You.\n" +
      "Le adjuntamos la documentación oficial de su pedido (Hoja de Pedido, Albarán y Factura).\n\n" +
      "Detalles del pedido:\n" +
      "- Pedido: " + pedidoNum + "\n" +
      (facturaNum ? "- Factura: " + facturaNum + "\n" : "") +
      "- Fecha: " + fecha + "\n" +
      "- Total pedido: " + totalAmount.toFixed(2) + " €\n" +
      "- Estado transporte: " + (transporte.gratis ? "GRATUITO (Pedido >= 500 €)" : "No incluido (" + transporte.costeTransporte.toFixed(2) + " € estimados)") + "\n\n" +
      "Gracias por confiar en Food4You.\n" +
      "Food4You · Breathe Taste Innovate";

    var cuerpoHtml = generarPlantillaHtmlEmail({
      clientName: clientName,
      pedidoNum: pedidoNum,
      facturaNum: facturaNum,
      fecha: fecha,
      totalAmount: totalAmount.toFixed(2),
      fileName: fileName,
      transporte: transporte
    });

    GmailApp.sendEmail(clientEmail, asunto, cuerpoTexto, {
      name: "Food4You",
      htmlBody: cuerpoHtml,
      attachments: [excelBlob]
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Pedido tramitado, guardado en Drive y enviado por correo.",
      pedidoNum: pedidoNum,
      transporte: transporte,
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
 * Calcula la distancia más corta con Google Maps y la tarifa de transporte Speed Press.
 * Todo el proceso de coste se omite si el importe con IVA >= 500,00 €.
 */
function calcularTransporteGoogleMaps(destino, totalAmount, pesoKg, volM3, bultos) {
  // Caso 1: Transporte GRATIS (pedido >= 500 € con IVA)
  if (totalAmount >= UMBRAL_TRANSPORTE_GRATIS) {
    return {
      gratis: true,
      costeTransporte: 0.00,
      mensaje: "¡Transporte gratuito incluido! Su pedido supera los 500,00 € (IVA incluido).",
      distanciaKm: null,
      pesoKg: pesoKg,
      volM3: volM3,
      bultos: bultos,
      pesoTasable: pesoKg
    };
  }

  // Caso 2: Pedido < 500 € -> Cálculo de ruta más corta con Google Maps
  var distanciaKm = 50.0; // Distancia de seguridad predeterminada si no se puede geocodificar
  var errorMaps = null;

  if (destino && destino.trim().length > 3) {
    try {
      var directions = Maps.newDirectionFinder()
        .setOrigin(ORIGEN_ENVIO)
        .setDestination(destino)
        .setAlternatives(true)
        .getDirections();

      if (directions && directions.routes && directions.routes.length > 0) {
        var menorDistanciaMetros = Infinity;
        for (var i = 0; i < directions.routes.length; i++) {
          var route = directions.routes[i];
          var distanciaRuta = 0;
          for (var j = 0; j < route.legs.length; j++) {
            distanciaRuta += route.legs[j].distance.value;
          }
          if (distanciaRuta < menorDistanciaMetros) {
            menorDistanciaMetros = distanciaRuta;
          }
        }
        if (menorDistanciaMetros !== Infinity) {
          distanciaKm = menorDistanciaMetros / 1000.0;
        }
      }
    } catch (mErr) {
      errorMaps = mErr.toString();
      Logger.log("Aviso en Maps: " + errorMaps);
    }
  }

  // Regla de tres volumétrica: 1 m³ = 250 kg (estándar logístico terrestre Speed Press)
  var pesoVolumetrico = volM3 * 250.0;
  var pesoTasable = Math.max(pesoKg, pesoVolumetrico);

  // Búsqueda en matriz de 50 tramos Speed Press
  var tramoEncontrado = buscarTramoTarifa(distanciaKm, pesoTasable);

  // Cálculo del precio con tarifa unitaria y mínimo de tramo
  var costeCalculado = 0.0;
  if (tramoEncontrado) {
    if (tramoEncontrado.unit >= 1.0) {
      // Tarifa en € por tonelada (1000 kg)
      costeCalculado = (tramoEncontrado.unit / 1000.0) * pesoTasable;
    } else {
      // Tarifa directa en € por kg
      costeCalculado = tramoEncontrado.unit * pesoTasable;
    }
    // Aplicar mínimo del tramo
    costeCalculado = Math.max(tramoEncontrado.minPrice, costeCalculado);
  } else {
    // Tarifa base de contingencia
    costeCalculado = Math.max(18.30, pesoTasable * 0.25);
  }

  return {
    gratis: false,
    costeTransporte: Number(costeCalculado.toFixed(2)),
    mensaje: "Gastos de transporte no incluidos en la compra web (pedido inferior a 500,00 € con IVA).",
    distanciaKm: Number(distanciaKm.toFixed(1)),
    pesoKg: Number(pesoKg.toFixed(2)),
    volM3: Number(volM3.toFixed(3)),
    bultos: bultos,
    pesoTasable: Number(pesoTasable.toFixed(2)),
    tramo: tramoEncontrado,
    errorMaps: errorMaps
  };
}

/**
 * Busca el tramo correspondiente en la tabla Speed Press según Km y Kg.
 */
function buscarTramoTarifa(km, kg) {
  var tramoPorKm = null;
  for (var i = 0; i < TARIFAS_SPEED_PRESS.length; i++) {
    var t = TARIFAS_SPEED_PRESS[i];
    // Coincidencia en tramo de Km
    if (km >= t.dKm && (km <= t.hKm || t.hKm >= 25000)) {
      // Coincidencia en tramo de Kg
      if (kg >= t.dKg && (kg <= t.hKg || t.hKg >= 24000)) {
        return t;
      }
      if (!tramoPorKm) tramoPorKm = t;
    }
  }
  return tramoPorKm || TARIFAS_SPEED_PRESS[0];
}

/**
 * Busca o crea una carpeta en Google Drive por nombre.
 */
function obtenerOCrearCarpeta(nombreCarpeta) {
  var carpetas = DriveApp.getFoldersByName(nombreCarpeta);
  if (carpetas.hasNext()) {
    return carpetas.next();
  }
  return DriveApp.createFolder(nombreCarpeta);
}

/**
 * Genera el cuerpo HTML enriquecido para el correo corporativo.
 */
function generarPlantillaHtmlEmail(info) {
  var t = info.transporte || { gratis: true };

  var bloqueTransporte = t.gratis
    ? `
      <div style="background: rgba(46, 125, 50, 0.08); border-left: 4px solid #2e7d32; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h4 style="margin: 0 0 6px 0; color: #1b5e20; font-size: 15px;">🚚 ¡Transporte Gratuito Incluido!</h4>
        <p style="margin: 0; font-size: 13px; color: #2e7d32; line-height: 1.5;">
          Al superar los <strong>500,00 € (IVA incluido)</strong> en su compra, los gastos de transporte corren por nuestra cuenta desde nuestras instalaciones en <strong>Arcos de la Frontera (Cádiz)</strong>.
        </p>
      </div>
    `
    : `
      <div style="background: #fff8e1; border-left: 4px solid #fbbc05; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h4 style="margin: 0 0 8px 0; color: #7a5a00; font-size: 15px;">🚚 Información de Transporte (Speed Press)</h4>
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #5d4037; line-height: 1.5;">
          Al ser un pedido inferior a 500,00 € con IVA, los gastos de transporte no están incluidos en el albarán ni cobrados en la web.
        </p>
        <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin-top: 8px;">
          <tr><td style="padding: 3px 0; color: #666;">Origen permanente:</td><td style="text-align: right; font-weight: 600;">Arcos de la Frontera (Cádiz)</td></tr>
          <tr><td style="padding: 3px 0; color: #666;">Distancia menor (Google Maps):</td><td style="text-align: right; font-weight: 600;">${t.distanciaKm} km</td></tr>
          <tr><td style="padding: 3px 0; color: #666;">Bultos / Peso / Volumen:</td><td style="text-align: right; font-weight: 600;">${t.bultos} bultos · ${t.pesoKg} kg · ${t.volM3} m³</td></tr>
          <tr><td style="padding: 3px 0; color: #666;">Peso tasable (regla de 3):</td><td style="text-align: right; font-weight: 600;">${t.pesoTasable} kg</td></tr>
          <tr style="border-top: 1px dashed #e0e0e0;"><td style="padding: 6px 0 0; font-weight: bold; color: #093375;">Coste transporte calculado:</td><td style="padding: 6px 0 0; text-align: right; font-weight: bold; font-size: 15px; color: #093375;">${t.costeTransporte.toFixed(2)} €</td></tr>
        </table>
      </div>
    `;

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
      .footer { background: #f8fafc; padding: 20px 25px; text-align: center; font-size: 12px; color: #718096; border-top: 1px solid #e2e8f0; }
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
        <p>Le agradecemos su confianza en <strong>Food4You</strong>. Su pedido ha sido registrado con éxito en nuestro sistema central.</p>
        
        <div class="info-card">
          <div class="info-row"><span>Número de Pedido:</span> <strong>${info.pedidoNum}</strong></div>
          ${info.facturaNum ? `<div class="info-row"><span>Factura Emitida:</span> <strong>${info.facturaNum}</strong></div>` : ''}
          <div class="info-row"><span>Fecha:</span> <span>${info.fecha}</span></div>
          <div class="info-row"><span>Importe Total:</span> <span>${info.totalAmount} €</span></div>
        </div>

        ${bloqueTransporte}

        <div class="attachment-box">
          <div class="attachment-icon">📎</div>
          <div class="attachment-text">
            <strong>${info.fileName}</strong>
            <span>Documentación completa adjunta (Hoja de Pedido, Albarán y Factura)</span>
          </div>
        </div>

        <p style="font-size: 14px; color: #555; line-height: 1.6;">
          También hemos guardado una copia íntegra de sus documentos en nuestro Google Drive oficial en la carpeta <strong>"${CARPETA_DRIVE_VENTAS}"</strong>.
        </p>
      </div>
      <div class="footer">
        <p>Food4You, SLS · C. Granadillos, 11630 Arcos de la Frontera, Cádiz<br>Este es un correo automático de confirmación generado tras su compra.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Función de prueba para ejecutar directamente en el editor de Google Apps Script.
 */
function testCalcularTransporte() {
  Logger.log("=== TEST 1: Pedido >= 500 € (Transporte Gratis) ===");
  var resGratis = calcularTransporteGoogleMaps("Av. Diagonal 400, Barcelona", 550.00, 75.0, 0.9, 2);
  Logger.log(JSON.stringify(resGratis, null, 2));

  Logger.log("\n=== TEST 2: Pedido < 500 € (Cálculo Maps + Speed Press) ===");
  var resTarifa = calcularTransporteGoogleMaps("Calle Sierpes 10, Sevilla", 180.00, 15.0, 0.08, 2);
  Logger.log(JSON.stringify(resTarifa, null, 2));
}
