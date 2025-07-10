import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

interface CreateUserBody {
  name: string;
  email: string;
  role: Role;
  vehicleId?: string;
  password: string;
}

export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      vehicleId: true,
    },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateUserBody = await req.json();
    const { name, email, role, vehicleId, password } = body;

    if (!email || !role || !password) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios ausentes." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new Response(JSON.stringify({ error: "E-mail já cadastrado." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
        vehicleId: vehicleId || undefined,
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
