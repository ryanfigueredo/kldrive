import { LoginForm } from "@/components/login-form";
import Image from "next/image";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Image
        src="/logo.png"
        alt="KL Facilities"
        width={160}
        height={80}
        className="mb-6"
      />
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
