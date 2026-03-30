"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Swal from "sweetalert2";
import { SiteConfigProvider } from "@/context/SiteConfigContext";

// Sub-componentes refactorizados
import AdminHeader from "@/components/admin/layout/AdminHeader";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import AdminMobileMenu from "@/components/admin/layout/AdminMobileMenu";

const ROLE_PERMISSIONS = {
  super_admin: [
    "Panel",
    "Productos",
    "Categorías",
    "Ventas",
    "Clientes",
    "Bitácora",
    "Ajustes",
  ],
  editor: ["Panel", "Productos", "Categorías", "Ventas"],
  viewer: ["Panel", "Ventas"],
};

export default function AdminLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Sidebar & Theme Initialization
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Theme Sync
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "unset";
  }, [isMobileOpen]);

  // Auth & Roles logic
  useEffect(() => {
    if (pathname === "/access") {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push("/access");
          return;
        }

        const { data: profile, error } = await supabase
          .from("staff_profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error || !profile) {
          setUserRole("viewer");
        } else {
          setUserRole(profile.role);
          setUserProfile(profile);
        }
      } catch (err) {
        console.error("Auth error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname, supabase]);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
  };

  const handleLogout = () => {
    Swal.fire({
      title: "¿CERRAR SESIÓN?",
      text: "Se finalizará tu sesión actual en este dispositivo.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#f44336",
      confirmButtonText: "SÍ, SALIR",
      cancelButtonText: "CANCELAR",
      reverseButtons: true,
      background: "#ffffff",
      customClass: {
        popup: "rounded-[30px] border border-zinc-100",
        title: "font-black tracking-tighter text-2xl",
        confirmButton: "rounded-xl font-bold text-[10px] tracking-[0.2em] px-8 py-3",
        cancelButton: "rounded-xl font-bold text-[10px] tracking-[0.2em] px-8 py-3",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        await supabase.auth.signOut();
        setUserRole(null);
        setUserProfile(null);
        setLoading(true);
        router.push("/access");
        router.refresh();
      }
    });
  };

  const canAccess = (label) => {
    // 1. Si es super_admin, tiene acceso total siempre
    if (userRole === "super_admin") return true;

    // 2. Si tiene permisos específicos definidos
    if (userProfile?.permissions?.length > 0) {
      if (userProfile.permissions.includes("all")) return true;
      return userProfile.permissions.includes(label);
    }

    // 3. Fallback a los permisos predefinidos por rol
    return userRole && ROLE_PERMISSIONS[userRole]?.includes(label);
  };

  if (pathname === "/access") {
    return <SiteConfigProvider>{children}</SiteConfigProvider>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBFB] dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SiteConfigProvider>
      <div className="flex min-h-screen bg-[#FBFBFB] dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-all duration-500">
        <AdminHeader
          isCollapsed={isCollapsed}
          setIsMobileOpen={setIsMobileOpen}
          toggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
          userProfile={userProfile}
          userRole={userRole}
          pathname={pathname}
        />

        <AdminMobileMenu 
          isMobileOpen={isMobileOpen} 
          setIsMobileOpen={setIsMobileOpen} 
        />

        <AdminSidebar
          isCollapsed={isCollapsed}
          toggleSidebar={toggleSidebar}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          canAccess={canAccess}
          handleLogout={handleLogout}
        />

        <main
          className={`
            flex-1 p-4 lg:p-6 pt-24 lg:pt-28 transition-all duration-500
            ${isCollapsed ? "lg:ml-20" : "lg:ml-64"}
            ml-0 w-full max-w-full overflow-x-hidden
          `}
        >
          {children}
        </main>
      </div>
    </SiteConfigProvider>
  );
}
