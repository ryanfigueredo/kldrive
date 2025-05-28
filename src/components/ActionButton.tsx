// src/components/ActionButton.tsx
import Link from "next/link";

interface ActionButtonProps {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

export default function ActionButton({ href, label, icon }: ActionButtonProps) {
  return (
    <Link href={href}>
      <div className="bg-violet-600  p-4 rounded-2xl shadow-md text-center flex items-center justify-center gap-2 text-lg w-full hover:bg-violet-700 transition">
        {icon}
        {label}
      </div>
    </Link>
  );
}
