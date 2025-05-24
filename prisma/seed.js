import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin", 10);

  await prisma.user.upsert({
    where: { email: "" },
    update: {},
    create: {
      name: "Admin KL",
      email: "",
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
