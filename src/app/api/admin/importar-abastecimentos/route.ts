import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Util: normaliza placa
function normalizePlaca(placaRaw: unknown): string | null {
  if (placaRaw == null) return null;
  const str = String(placaRaw).trim().toUpperCase();
  if (!str) return null;
  return str.replace(/[^A-Z0-9]/g, "");
}

// Util: converte número/pt-BR para float
function toFloat(value: unknown): number | null {
  if (value == null) return null;
  // If Excel already provides a numeric cell, keep the decimal separator
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  const raw = String(value).trim();
  if (!raw) return null;
  // Remove spaces that may be used as thousands separators
  const noSpaces = raw.replace(/\s+/g, "");
  // pt-BR style: 1.234,56 → 1234.56 , 113,16 → 113.16
  const normalized = noSpaces.includes(",")
    ? noSpaces.replace(/\./g, "").replace(",", ".")
    : noSpaces;
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

// Util: converte diferentes formatos de data do Excel para Date
function toDate(value: unknown): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return value;
  if (typeof value === "number") {
    // Excel serial date
    // Excel epoch starts at 1899-12-30
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const ms = Math.round(value * 24 * 60 * 60 * 1000);
    return new Date(excelEpoch.getTime() + ms);
  }
  const str = String(value).trim();
  if (!str) return null;
  // Normaliza espaços duplicados
  const normalized = str.replace(/\s+/g, " ");
  // Expectativa: dd/MM/yyyy HH:mm[:ss]
  const match = normalized.match(
    /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/
  );
  if (match) {
    const [, dd, MM, yyyy, HH, mm, ss] = match;
    const date = new Date(
      Number(yyyy),
      Number(MM) - 1,
      Number(dd),
      Number(HH),
      Number(mm),
      ss ? Number(ss) : 0
    );
    return date;
  }
  // Tenta parsear ISO
  const iso = new Date(normalized);
  return isNaN(iso.getTime()) ? null : iso;
}

type ImportSummary = {
  processed: number;
  inserted: number;
  duplicates: number;
  invalid: number;
  notFoundVehicle: number;
  details: {
    row: number;
    placa?: string;
    reason: string;
  }[];
  insertedItems: {
    row: number;
    placa: string;
    data: string;
    litros: number;
    valor: number;
    kmAtual: number;
  }[];
};

type TokenPayload = {
  email?: string;
  role?: "ADMIN" | "SUPERVISOR" | "COLABORADOR" | string;
};

export async function POST(req: NextRequest) {
  const token = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })) as TokenPayload | null;
  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Opcional: restringe ao ADMIN
  if (token.role && token.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    const sheet = workbook.worksheets[0];
    if (!sheet) {
      return NextResponse.json({ error: "Planilha vazia" }, { status: 400 });
    }

    const summary: ImportSummary = {
      processed: 0,
      inserted: 0,
      duplicates: 0,
      invalid: 0,
      notFoundVehicle: 0,
      details: [],
      insertedItems: [],
    };

    // Para dedupe local: set de chave "placa|timestamp"
    const seen = new Set<string>();

    // Começa na linha 2 assumindo cabeçalho
    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
      const row = sheet.getRow(rowNumber);
      summary.processed++;

      const dataTransacao = toDate(row.getCell(5 /* E */).value as unknown);
      const placa = normalizePlaca(row.getCell(6 /* F */).value as unknown);
      const litros = toFloat(row.getCell(15 /* O */).value as unknown);
      const kmAtual = toFloat(row.getCell(17 /* Q */).value as unknown);
      const valor = toFloat(row.getCell(20 /* T */).value as unknown);

      if (
        !dataTransacao ||
        !placa ||
        litros == null ||
        kmAtual == null ||
        valor == null
      ) {
        summary.invalid++;
        summary.details.push({
          row: rowNumber,
          placa: placa ?? undefined,
          reason: "Dados obrigatórios ausentes/invalidos",
        });
        continue;
      }

      const key = `${placa}|${dataTransacao.getTime()}`;
      if (seen.has(key)) {
        summary.duplicates++;
        summary.details.push({
          row: rowNumber,
          placa,
          reason: "Duplicado na própria planilha",
        });
        continue;
      }
      seen.add(key);

      const vehicle = await prisma.vehicle.findUnique({ where: { placa } });
      if (!vehicle) {
        summary.notFoundVehicle++;
        summary.details.push({
          row: rowNumber,
          placa,
          reason: "Veículo não encontrado",
        });
        continue;
      }

      // Checa duplicidade já existente no BD por placa (vehicleId) + timestamp igual
      const exists = await prisma.fuelRecord.findFirst({
        where: { vehicleId: vehicle.id, createdAt: dataTransacao },
        select: { id: true },
      });
      if (exists) {
        summary.duplicates++;
        summary.details.push({
          row: rowNumber,
          placa,
          reason: "Duplicado no banco",
        });
        continue;
      }

      const created = await prisma.fuelRecord.create({
        data: {
          litros,
          valor,
          kmAtual,
          situacaoTanque: "CHEIO",
          photoUrl: "",
          observacao: "Importado XLSX",
          createdAt: dataTransacao,
          user: { connect: { email: token.email! } },
          vehicle: { connect: { id: vehicle.id } },
        },
      });
      summary.inserted++;
      summary.insertedItems.push({
        row: rowNumber,
        placa,
        data: created.createdAt.toISOString(),
        litros,
        valor,
        kmAtual,
      });
    }

    return NextResponse.json(summary, { status: 200 });
  } catch (err) {
    console.error("Erro ao importar abastecimentos:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
