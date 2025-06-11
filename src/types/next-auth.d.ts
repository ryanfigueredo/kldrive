import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
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
