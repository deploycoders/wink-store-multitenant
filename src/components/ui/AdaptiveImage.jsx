"use client";

import Image from "next/image";
import { CldImage } from "next-cloudinary";
import { useState } from "react";

const isCloudinaryPublicId = (src) => {
  if (!src || typeof src !== "string") return false;
  const normalized = src.trim();
  if (normalized.startsWith("cloud://")) return true;
  // Si guardas solo public IDs de Cloudinary (ej: "my-folder/image-123")
  if (!normalized.startsWith("/") && !normalized.startsWith("http"))
    return true;
  return false;
};

export default function AdaptiveImage({ src, alt = "", ...props }) {
  const [failed, setFailed] = useState(false);

  if (!src) {
    return null;
  }

  const effectiveSrc = failed ? "/placeholder.jpg" : src;

  // Para URLs completas (incluyendo Cloudinary), usamos next/image.
  // Reservamos CldImage solo para public IDs.
  if (isCloudinaryPublicId(effectiveSrc)) {
    return (
      <CldImage
        src={effectiveSrc}
        alt={alt}
        onError={() => setFailed(true)}
        {...props}
      />
    );
  }

  return (
    <Image
      src={effectiveSrc}
      alt={alt}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
