import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token)
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const tokenRole = (token as unknown as { role?: string }).role;
  if (tokenRole && tokenRole !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { vehicleId, litros, valor, kmAtual, observacao, dataHora } =
      body as {
        vehicleId?: string;
        litros?: number | string;
        valor?: number | string;
        kmAtual?: number | string;
        observacao?: string;
        dataHora?: string; // ISO 8601
      };

    if (!vehicleId || litros == null || valor == null || kmAtual == null) {
      return NextResponse.json(
        { error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      );
    }

    const toNumber = (v: unknown) => {
      if (typeof v === "number") return v;
      if (typeof v === "string") {
        const n = Number(v.replace(/\./g, "").replace(",", "."));
        return Number.isFinite(n) ? n : NaN;
      }
      return NaN;
    };

    const litrosNum = toNumber(litros);
    const valorNum = toNumber(valor);
    const kmNum = toNumber(kmAtual);
    if ([litrosNum, valorNum, kmNum].some((n) => Number.isNaN(n))) {
      return NextResponse.json(
        { error: "Valores numéricos inválidos" },
        { status: 400 }
      );
    }

    const createdAt = dataHora ? new Date(dataHora) : new Date();
    if (Number.isNaN(createdAt.getTime())) {
      return NextResponse.json(
        { error: "Data/Hora inválida" },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });
    if (!vehicle) {
      return NextResponse.json(
        { error: "Veículo não encontrado" },
        { status: 404 }
      );
    }

    const exists = await prisma.fuelRecord.findFirst({
      where: { vehicleId: vehicle.id, createdAt },
      select: { id: true },
    });
    if (exists) {
      return NextResponse.json(
        { error: "Registro duplicado para este horário" },
        { status: 409 }
      );
    }

    const registro = await prisma.fuelRecord.create({
      data: {
        litros: litrosNum,
        valor: valorNum,
        kmAtual: kmNum,
        situacaoTanque: "CHEIO",
        photoUrl: "/placeholder.jpg",
        observacao: observacao ?? "Criado manualmente pelo ADMIN",
        createdAt,
        user: { connect: { email: token.email! } },
        vehicle: { connect: { id: vehicle.id } },
      },
    });

    return NextResponse.json(registro, { status: 201 });
  } catch (err) {
    console.error("Erro ao registrar abastecimento manual:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
