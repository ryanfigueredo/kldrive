import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Verificar se é admin
  if (token.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { kmSaida } = await req.json();

  if (!kmSaida || isNaN(Number(kmSaida))) {
    return NextResponse.json(
      { error: "Quilometragem inválida" },
      { status: 400 }
    );
  }

  try {
    const rotaAtualizada = await prisma.rotaRecord.update({
      where: { id: params.id },
      data: { kmSaida: Number(kmSaida) },
    });

    return NextResponse.json({ success: true, rota: rotaAtualizada });
  } catch (error) {
    console.error("Erro ao atualizar rota:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
