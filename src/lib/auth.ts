import { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

// Handler para App Router
const handler = (req: NextApiRequest, res: NextApiResponse) => {
  return NextAuth(authOptions)(req, res);
};

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { vehicle: true }, // veículo vinculado
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.avatarUrl ?? "",
          vehicle: user.vehicle
            ? {
                id: user.vehicle.id,
                placa: user.vehicle.placa,
                modelo: user.vehicle.modelo ?? null,
              }
            : null,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.image = user.image;
        token.vehicle = user.vehicle ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.image = token.image as string;
      session.user.vehicle =
        token.vehicle &&
        typeof token.vehicle === "object" &&
        "id" in token.vehicle &&
        "placa" in token.vehicle
          ? {
              id: (token.vehicle as any).id,
              placa: (token.vehicle as any).placa,
              modelo: (token.vehicle as any).modelo ?? null,
            }
          : null;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default handler;
