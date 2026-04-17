"use client";
import React from "react";
import Profile from "@/components/admin/profile/Profile";

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 p-4 sm:p-0">
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
          Mi Perfil
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
          Gestiona tu información personal y de contacto
        </p>
      </header>

      <Profile />
    </div>
  );
}
