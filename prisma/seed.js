import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.vehicle.createMany({
    data: [
      {
        id: "VEICULO_01",
        placa: "KL-0001",
        modelo: "Modelo 1",
        ano: 2020,
        tipoCombustivel: "FLEX",
      },
      {
        id: "VEICULO_02",
        placa: "EMO-1F59",
        modelo: "UNO",
        ano: 2021,
        tipoCombustivel: "FLEX",
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(() => {
    console.log("Veículos cadastrados.");
  })
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
