"use client";
import React from "react";
import Profile from "@/components/admin/profile/Profile";

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter">
          Mi Perfil
        </h1>
        <p className="text-slate-500 text-sm">
          Gestiona tu información personal y de contacto
        </p>
      </header>

      <Profile />
    </div>
  );
}
