const PDFDocument = require("pdfkit");
const fs = require("fs");

// datos = { cliente, porcinos }
const generarPDFReporte = (datos, res) => {
  const doc = new PDFDocument();

  // Configuración de headers para descarga
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=reporte.pdf");

  // Pipea el PDF directamente a la respuesta
  doc.pipe(res);

  // Encabezado
  doc.fontSize(18).text("Reporte de Cliente", { align: "center" });
  doc.moveDown();

  // Info cliente
  doc.fontSize(14).text(`Cédula: ${datos.cliente.cedula}`);
  doc.text(`Nombre: ${datos.cliente.nombres} ${datos.cliente.apellidos}`);
  doc.text(`Teléfono: ${datos.cliente.telefono}`);
  doc.moveDown();

  // Tabla simplificada de porcinos
  doc.fontSize(16).text("Porcinos Asociados", { underline: true });
  datos.porcinos.forEach((p, i) => {
    doc.moveDown(0.5);
    doc.fontSize(12).text(
      `${i + 1}. Identificación: ${p.identificacion}, Raza: ${p.razaNombre}, Peso: ${p.peso}kg, Edad: ${p.edad} meses`
    );
    doc.text(`Alimentación: ${p.alimentacionId.descripcion} - ${p.alimentacionId.dosis}`);
  });

  doc.end();
};

module.exports = { generarPDFReporte };
