"use client";

import { X } from "lucide-react";
import Image from "next/image";

type ImageModalProps = {
    src: string;
    onClose: () => void;
};

export function ImageModal({ src, onClose }: ImageModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
            <div className="relative max-w-4xl max-h-[90vh]">
                <Image
                    src={src}
                    alt="Image agrandie"
                    width={1200}
                    height={900}
                    className="object-contain max-w-full max-h-[90vh]"
                />
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition"
                >
                    <X className="h-6 w-6 text-white" />
                </button>
            </div>
        </div>
    );
}