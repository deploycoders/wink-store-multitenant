"use client";
import React from "react";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Tags, 
  BarChart3, 
  Users, 
  History, 
  Settings, 
  LogOut, 
  ChevronRight, 
  ChevronLeft, 
  X 
} from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigContext";
import AdminNavLink from "./AdminNavLink";

export default function AdminSidebar({
  isCollapsed,
  toggleSidebar,
  isMobileOpen,
  setIsMobileOpen,
  canAccess,
  handleLogout,
}) {
  const { site_name } = useSiteConfig();

  const navItems = [
    { href: "/admin", icon: <LayoutDashboard size={20} />, label: "Panel", permission: "Panel" },
    { href: "/admin/products", icon: <ShoppingBag size={20} />, label: "Productos", permission: "Productos" },
    { href: "/admin/categories", icon: <Tags size={20} />, label: "Categorías", permission: "Categorías" },
    { href: "/admin/orders", icon: <BarChart3 size={20} />, label: "Ventas", permission: "Ventas" },
    { href: "/admin/customers", icon: <Users size={20} />, label: "Clientes", permission: "Clientes" },
    { href: "/admin/history", icon: <History size={20} />, label: "Bitácora", permission: "Bitácora" },
    { href: "/admin/settings", icon: <Settings size={20} />, label: "Ajustes", permission: "Ajustes" },
  ];

  return (
    <aside
      className={`
        fixed h-full z-70 bg-white dark:bg-slate-900 border-r border-zinc-100 dark:border-slate-800 flex flex-col
        transition-all duration-500 ease-in-out shadow-[10px_0_30px_rgba(0,0,0,0.01)] dark:shadow-none
        ${isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"}
        ${isCollapsed ? "lg:w-20" : "lg:w-64"}
      `}
    >
      {/* BOTÓN COLAPSO (Desktop) */}
      <button
        onClick={toggleSidebar}
        className="hidden lg:flex absolute -right-3 top-18 bg-slate-900 dark:bg-slate-700 text-white rounded-full p-1.5 shadow-xl z-50 border-2 border-white dark:border-slate-800 cursor-pointer hover:scale-110 transition-transform"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* BOTÓN CERRAR (Móvil) */}
      <button
        onClick={() => setIsMobileOpen(false)}
        className="lg:hidden absolute right-4 top-4 text-zinc-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"
      >
        <X size={24} />
      </button>

      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden h-full scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent pr-1">
        {/* LOGO */}
        <div
          className={`flex px-8 py-10 transition-all duration-500 overflow-hidden ${isCollapsed ? "justify-center px-0 w-20" : "justify-start px-8 w-full"}`}
        >
          <h2 className="font-black tracking-tighter text-2xl uppercase whitespace-nowrap text-slate-900 dark:text-white">
            <span className="hidden lg:block truncate">
              {isCollapsed
                ? site_name.substring(0, 1).toUpperCase()
                : site_name.toUpperCase()}
            </span>
            <span className="lg:hidden truncate">{site_name.toUpperCase()}</span>
          </h2>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="flex-1 px-6 space-y-4">
          {navItems.map((item) => (
            canAccess(item.permission) && (
              <AdminNavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isCollapsed={isCollapsed}
                onClick={() => setIsMobileOpen(false)}
              />
            )
          ))}
        </nav>

        {/* SALIR */}
        <div className="p-6 border-t border-zinc-50 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-4 p-4 w-full rounded-2xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-all group font-bold text-xs uppercase tracking-widest"
          >
            <LogOut size={20} />
            {(!isCollapsed || isMobileOpen) && <span>Salir</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
