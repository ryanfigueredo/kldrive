import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import ExcelJS from "exceljs";

const PDFDocument = require("pdfkit");

export const config = {
  api: { responseLimit: false },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { tipo, startDate, endDate, usuario, veiculo, formato } = req.query;

  const dateFilter: any = {};
  if (startDate) dateFilter.gte = new Date(startDate + "T00:00:00");
  if (endDate) dateFilter.lte = new Date(endDate + "T23:59:59");

  const userId = Array.isArray(usuario) ? usuario[0] : usuario;
  const vehicleId = Array.isArray(veiculo) ? veiculo[0] : veiculo;

  const filtros = {
    createdAt: Object.keys(dateFilter).length ? dateFilter : undefined,
    userId: userId || undefined,
    vehicleId: vehicleId || undefined,
  };

  let registros: any[] = [];

  if (!tipo || tipo === "KM") {
    const km = await prisma.kmRecord.findMany({
      where: filtros,
      include: { user: true, vehicle: true },
    });

    registros.push(
      ...km.map((r) => ({
        tipo: "KM",
        placa: r.vehicle?.placa ?? "",
        usuario: r.user?.email ?? "",
        valor: 0,
        km: r.km,
        data: r.createdAt.toLocaleString("pt-BR"),
      }))
    );
  }

  if (!tipo || tipo === "ABASTECIMENTO") {
    const fuel = await prisma.fuelRecord.findMany({
      where: filtros,
      include: { user: true, vehicle: true },
    });

    registros.push(
      ...fuel.map((r) => ({
        tipo: "ABASTECIMENTO",
        placa: r.vehicle?.placa ?? "",
        usuario: r.user?.email ?? "",
        valor: r.valor,
        km: r.kmAtual,
        data: r.createdAt.toLocaleString("pt-BR"),
      }))
    );
  }

  const filename = `registros_${Date.now()}.${formato}`;

  if (formato === "excel") {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Registros");

    sheet.columns = [
      { header: "Tipo", key: "tipo", width: 15 },
      { header: "Placa", key: "placa", width: 15 },
      { header: "Usuário", key: "usuario", width: 30 },
      { header: "Valor", key: "valor", width: 12 },
      { header: "KM", key: "km", width: 10 },
      { header: "Data", key: "data", width: 25 },
    ];

    sheet.addRows(registros);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    await workbook.xlsx.write(res);
    res.end();
  } else if (formato === "pdf") {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    const doc = new PDFDocument({ size: "A4", margin: 30 });
    doc.pipe(res);

    doc
      .fontSize(16)
      .text("Relatório de Registros", { align: "center" })
      .moveDown();

    registros.forEach((r) => {
      doc
        .fontSize(10)
        .text(`Tipo: ${r.tipo} | Placa: ${r.placa} | Usuário: ${r.usuario}`)
        .text(`Valor: R$ ${r.valor.toFixed(2)} | KM: ${r.km} | Data: ${r.data}`)
        .moveDown(0.5);
    });

    doc.end();
  } else {
    res.status(400).json({ error: "Formato inválido" });
  }
}
