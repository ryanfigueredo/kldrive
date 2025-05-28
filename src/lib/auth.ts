import { NextApiRequest, NextApiResponse } from "next";
import NextAuth, {
  AuthOptions,
  User as NextAuthUser,
  Session as NextAuthSession,
} from "next-auth";
import type { JWT } from "next-auth/jwt";

import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  return NextAuth(authOptions)(req, res);
};

declare module "next-auth" {
  interface Session {
    user: {
      image: string;
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

interface AuthUser extends NextAuthUser {
  role?: string;
  vehicles?: {
    id: string;
    placa: string;
    modelo: string | null;
  }[];
}

interface SessionUser {
  role?: string;
  vehicles?: {
    id: string;
    placa: string;
    modelo: string | null;
  }[];
  name?: string | null;
  email?: string | null;
}

interface CustomSession extends Omit<NextAuthSession, "user"> {
  user: SessionUser;
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials): Promise<AuthUser | null> {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { vehicles: true },
        });

        if (!user) return null;

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValidPassword) return null;

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
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: AuthUser }) {
      if (user) {
        token.role = user.role;
        token.vehicles = user.vehicles ?? [];
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: NextAuthSession;
      token: JWT;
    }) {
      const customSession = session as CustomSession;

      if (customSession.user) {
        customSession.user.role = token.role as string;
        customSession.user.vehicles = Array.isArray(token.vehicles)
          ? token.vehicles
          : [];
      }
      return customSession;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default handler;
