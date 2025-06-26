import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      role: string;
      image: string;
      vehicle?: {
        id: string;
        placa: string;
        modelo: string | null;
      } | null;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string;
    vehicle?: {
      id: string;
      placa: string;
      modelo: string | null;
    } | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string;
    vehicle?: {
      id: string;
      placa: string;
      modelo: string | null;
    } | null;
  }
}
