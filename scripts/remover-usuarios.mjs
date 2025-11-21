import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const emailsParaRemover = [
  "joabe.soares@klfacilities.com.br",
  "antonio.carvalho@klfacilities.com.br",
];

async function removerUsuarios() {
  try {
    console.log("Buscando usuários para remover...");

    for (const email of emailsParaRemover) {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        console.log(`Usuário com email ${email} não encontrado.`);
        continue;
      }

      console.log(`Removendo usuário: ${user.name} (${user.email})`);

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

      console.log(`✓ Usuário ${user.name} removido com sucesso.`);
    }

    console.log("\nProcesso concluído!");
  } catch (error) {
    console.error("Erro ao remover usuários:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

removerUsuarios();

