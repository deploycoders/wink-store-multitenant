"use client";
import React, { useState } from "react";
import RolesManager from "@/components/admin/settings/RolesManager";
import SiteSettingsManager from "@/components/admin/settings/SiteSettingsManager";
import { Settings, Users } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("site");

  const tabs = [
    { id: "site", label: "CONFIGURACIÓN WEB", icon: <Settings size={16} /> },
    { id: "roles", label: "ROLES Y PERMISOS", icon: <Users size={16} /> },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
          Ajustes del Sistema
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 uppercase font-bold tracking-widest text-[10px]">
          Personaliza la apariencia y gestiona accesos
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-md w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-3 px-6 py-3 rounded-md transition-all font-black text-[10px] tracking-widest uppercase cursor-pointer
              ${
                activeTab === tab.id
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xl shadow-slate-200/50 dark:shadow-none -translate-y-0.5"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-8">
        {activeTab === "site" ? <SiteSettingsManager /> : <RolesManager />}
      </div>
    </div>
  );
}
