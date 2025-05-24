import { LoginForm } from "@/components/login-form";
import Image from "next/image";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full  max-w-sm">
        <Image
          src="/logo.svg"
          alt="KL Facilities"
          width={160}
          height={80}
          className="mb-6"
        />
        <LoginForm />
      </div>
    </div>
  );
}
