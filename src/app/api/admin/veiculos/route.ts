import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const veiculos = await prisma.vehicle.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(veiculos);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { placa, modelo, ano, tipoCombustivel } = body as {
      placa: string;
      modelo?: string;
      ano?: number;
      tipoCombustivel: string;
    };

    if (!placa || !tipoCombustivel) {
      return NextResponse.json(
        { error: "Placa e combustível são obrigatórios." },
        { status: 400 }
      );
    }

    const exists = await prisma.vehicle.findUnique({ where: { placa } });
    if (exists) {
      return NextResponse.json(
        { error: "Placa já cadastrada." },
        { status: 400 }
      );
    }

    const created = await prisma.vehicle.create({
      data: {
        placa,
        modelo,
        ano,
        tipoCombustivel:
          tipoCombustivel as import("@prisma/client").TipoCombustivel,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
