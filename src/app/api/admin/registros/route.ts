import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token)
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo");

  const registros: {
    id: string;
    tipo: "KM" | "ABASTECIMENTO";
    placa: string;
    usuario: string;
    valor: number;
    km: number;
    imagem: string;
    data: Date;
  }[] = [];

  if (!tipo || tipo === "KM") {
    const km = await prisma.kmRecord.findMany({
      include: { user: true, vehicle: true },
      orderBy: { createdAt: "desc" },
    });

    registros.push(
      ...km.map((r) => ({
        id: r.id,
        tipo: "KM" as const,
        placa: r.vehicle?.placa ?? "—",
        usuario: r.user?.email ?? "—",
        valor: 0,
        km: r.km,
        imagem: r.photoUrl ?? "", // garantido string
        data: r.createdAt,
      }))
    );
  }

  if (!tipo || tipo === "ABASTECIMENTO") {
    const fuel = await prisma.fuelRecord.findMany({
      include: { user: true, vehicle: true },
      orderBy: { createdAt: "desc" },
    });

    registros.push(
      ...fuel.map((r) => ({
        id: r.id,
        tipo: "ABASTECIMENTO" as const,
        placa: r.vehicle?.placa ?? "—",
        usuario: r.user?.email ?? "—",
        valor: r.valor,
        km: r.kmAtual,
        imagem: r.photoUrl ?? "", // garantido string
        data: r.createdAt,
      }))
    );
  }

  return NextResponse.json(registros);
}
