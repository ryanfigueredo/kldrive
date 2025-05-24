import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full  max-w-sm">
        <div className="flex justify-center items-center bg-white p-4 rounded-md mb-6">
          <img
            src="/logo.svg"
            alt="KL Facilities"
            width={160}
            height={80}
            className=""
          />
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
