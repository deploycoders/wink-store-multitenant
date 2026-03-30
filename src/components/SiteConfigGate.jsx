"use client";

import { Loader2 } from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigContext";

export default function SiteConfigGate({ children }) {
  const { loading } = useSiteConfig();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-300" size={44} />
      </div>
    );
  }

  return children;
}
