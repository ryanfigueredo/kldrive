"use client";

import Image from "next/image";

export default function Header() {
  return (
    <header className="hidden md:flex fixed top-0 left-16 right-0 h-16 bg-white shadow-md text-white  items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <Image src="/logo-kl.svg" alt="KL Facilities" width={80} height={40} />
      </div>
    </header>
  );
}
