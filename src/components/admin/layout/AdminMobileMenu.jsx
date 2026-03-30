"use client";
import React from "react";

export default function AdminMobileMenu({ isMobileOpen, setIsMobileOpen }) {
  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm z-60 lg:hidden transition-opacity duration-500"
      onClick={() => setIsMobileOpen(false)}
    />
  );
}
