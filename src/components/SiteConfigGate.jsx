"use client";

import Preloader from "@/components/ui/Preloader";
import { useSiteConfig } from "@/context/SiteConfigContext";

export default function SiteConfigGate({ children }) {
  const { loading } = useSiteConfig();

  if (loading) {
    return <Preloader showBranding />;
  }

  return children;
}
