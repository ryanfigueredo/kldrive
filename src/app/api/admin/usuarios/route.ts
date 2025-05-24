import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role?: string;
      vehicles?: {
        id: string;
        placa: string;
        modelo: string | null;
      }[];
      name?: string | null;
      email?: string | null;
    };
  }

  interface User {
    role?: string;
    vehicles?: {
      id: string;
      placa: string;
      modelo: string | null;
    }[];
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            vehicles: true,
          },
        });

        if (!user) return null;

        // Comparar senha fornecida com a hash salva no banco
        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          vehicles: user.vehicles.map((v) => ({
            id: v.id,
            placa: v.placa,
            modelo: v.modelo,
          })),
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
        token.role = user.role;
        token.vehicles = (user as any).vehicles;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.vehicles = Array.isArray(token.vehicles)
          ? token.vehicles
          : [];
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
