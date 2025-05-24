import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Lu230148$", 10);

  await prisma.user.upsert({
    where: { email: "gabrielfabri@klfacilities.com.br" },
    update: {},
    create: {
      name: "Admin KL",
      email: "gabrielfabri@klfacilities.com.br",
      role: "ADMIN",
      // caso esteja usando senha diretamente
      password: passwordHash,
    },
  });

  console.log("Usuário admin criado com sucesso.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
