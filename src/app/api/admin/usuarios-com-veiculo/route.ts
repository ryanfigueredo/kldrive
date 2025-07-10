import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        vehicle: true,
        fuelRecords: {
          select: { valor: true },
        },
      },
    });

    const resultado = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      vehicle: u.vehicle ? { placa: u.vehicle.placa } : null,
      totalAbastecido: u.fuelRecords.reduce((acc, fr) => acc + fr.valor, 0),
      ativo: true,
    }));

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("[GET /usuarios-com-veiculo]", error);
    return new Response("Erro ao buscar usuários", { status: 500 });
  }
}
