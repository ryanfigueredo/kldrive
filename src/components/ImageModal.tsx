import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  subtitle?: string;
}

export function ImageModal({
  isOpen,
  onClose,
  imageUrl,
  title,
  subtitle,
}: ImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-100">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </DialogHeader>
        <div className="flex justify-center">
          <Image
            src={imageUrl}
            alt={title}
            width={600}
            height={400}
            className="rounded-lg object-contain max-h-96"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
