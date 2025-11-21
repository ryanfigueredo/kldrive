import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const emailsParaRemover = [
  "joabe.soares@klfacilities.com.br",
  "antonio.carvalho@klfacilities.com.br",
];

export async function POST() {
  try {
    const resultados = [];

    for (const email of emailsParaRemover) {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        resultados.push({
          email,
          status: "não encontrado",
        });
        continue;
      }

      // Deleta os registros relacionados primeiro
      await prisma.$transaction(async (tx) => {
        // Deleta registros de quilometragem
        await tx.kmRecord.deleteMany({
          where: { userId: user.id },
        });

        // Deleta registros de rota
        await tx.rotaRecord.deleteMany({
          where: { userId: user.id },
        });

        // Deleta registros de abastecimento
        await tx.fuelRecord.deleteMany({
          where: { userId: user.id },
        });

        // Remove o vínculo com veículo
        await tx.user.update({
          where: { id: user.id },
          data: { vehicleId: null },
        });

        // Deleta o usuário
        await tx.user.delete({
          where: { id: user.id },
        });
      });

      resultados.push({
        email,
        nome: user.name,
        status: "removido",
      });
    }

    return NextResponse.json({
      success: true,
      resultados,
    });
  } catch (error) {
    console.error("[POST /remover-usuarios-especificos]", error);
    return NextResponse.json(
      { error: "Erro ao remover usuários." },
      { status: 500 }
    );
  }
}

