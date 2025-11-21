import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID do usuário não fornecido." },
        { status: 400 }
      );
    }

    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    // Deleta os registros relacionados primeiro (KmRecord, RotaRecord, FuelRecord)
    // e depois o usuário
    await prisma.$transaction(async (tx) => {
      // Deleta registros de quilometragem
      await tx.kmRecord.deleteMany({
        where: { userId: id },
      });

      // Deleta registros de rota
      await tx.rotaRecord.deleteMany({
        where: { userId: id },
      });

      // Deleta registros de abastecimento
      await tx.fuelRecord.deleteMany({
        where: { userId: id },
      });

      // Remove o vínculo com veículo (set vehicleId para null)
      await tx.user.update({
        where: { id },
        data: { vehicleId: null },
      });

      // Deleta o usuário
      await tx.user.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /usuarios/[id]]", error);
    return NextResponse.json(
      { error: "Erro ao excluir usuário." },
      { status: 500 }
    );
  }
}

