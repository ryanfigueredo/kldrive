import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client";

interface CreateUserBody {
  name: string;
  email: string;
  role: Role;
  vehicleId?: string;
  password: string;
}

export async function POST(req: Request) {
  try {
    const body: CreateUserBody = await req.json();
    const { name, email, role, vehicleId, password } = body;

    // Validar campos obrigatórios
    if (!email || !role || !password) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios ausentes." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verifica se o email já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new Response(JSON.stringify({ error: "E-mail já cadastrado." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário no banco, incluindo o nome
    const user = await prisma.user.create({
      data: {
        name, // aqui o name é inserido no banco
        email,
        role,
        password: hashedPassword,
        vehicles: vehicleId ? { connect: { id: vehicleId } } : undefined,
      },
    });

    return new Response(JSON.stringify(user), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Erro interno." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
