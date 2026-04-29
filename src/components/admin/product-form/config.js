export const CLOUDINARY_CONFIG = {
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "winkstore_unsigned",
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_NAME || "dde0mvvks",
  uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME || "dde0mvvks"}/image/upload`,
};
