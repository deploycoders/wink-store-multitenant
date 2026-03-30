"use client";

import { useEffect, useState } from "react";
import { getTenants } from "@/services/tenants";
import { TenantTable } from "@/components/admin/tenants/TenantTable";
import { NewTenantModal } from "@/components/admin/tenants/NewTenantModal";
import { InvitationLink } from "@/components/admin/tenants/InvitationLink";
import {
  Building2,
  Store,
  Users,
  BarChart3,
  Search,
  PlusCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastInvitation, setLastInvitation] = useState(null);
  const [lastTenantName, setLastTenantName] = useState("");

  const fetchTenants = async () => {
    setLoading(true);
    const data = await getTenants();
    setTenants(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleTenantCreated = (newTenant, invitation) => {
    setTenants([newTenant, ...tenants]);
    setLastInvitation(invitation);
    setLastTenantName(newTenant.nombre || newTenant.name);
  };

  const handleTenantUpdated = (updatedTenant) => {
    setTenants(prev => prev.map(t => 
      t.tenant_id === updatedTenant.tenant_id ? updatedTenant : t
    ));
  };

  const filteredTenants = tenants.filter((t) => {
    const nameMatch = t.nombre
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Usamos "slug" con protección por si acaso
    const slugMatch = t.slug?.toLowerCase().includes(searchTerm.toLowerCase());

    return nameMatch || slugMatch;
  });

  const stats = [
    {
      label: "Total Tiendas",
      value: tenants.length,
      icon: Store,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Tiendas Activas",
      value: tenants.filter((t) => t.status === "Active").length,
      icon: Building2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Plan Gold",
      value: tenants.filter((t) => t.plan === "Gold").length,
      icon: BarChart3,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Usuarios Totales",
      value: 0,
      icon: Users,
      color: "text-slate-600",
      bg: "bg-slate-50",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 min-h-screen bg-transparent">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Gestión de Tenants
          </h1>
          <p className="text-gray-500 mt-1">
            Administra y monitorea todas las tiendas en la plataforma SaaS.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NewTenantModal onTenantCreated={handleTenantCreated} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`p-5 rounded-2xl border border-white/40 shadow-sm ${stat.bg} flex items-center gap-4 transition-all hover:shadow-md hover:translate-y-[-2px]`}
          >
            <div className={`p-3 rounded-xl bg-white shadow-sm ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 leading-none mt-1">
                {loading ? "..." : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-gray-800">
                Listado de Tiendas
              </h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar tienda..."
                  className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <TenantTable 
              tenants={filteredTenants} 
              loading={loading} 
              onTenantUpdated={handleTenantUpdated}
            />
          </div>
        </div>

        {/* Sidebar / Last Invitation */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800">Panel de Acción</h2>
            <p className="text-sm text-gray-500 mt-1">
              Asignar invitaciones y configurar límites.
            </p>

            {lastInvitation ? (
              <InvitationLink
                invitation={lastInvitation}
                tenantName={lastTenantName}
              />
            ) : (
              <div className="mt-6 p-10 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center text-center">
                <div className="bg-gray-50 p-3 rounded-full mb-3">
                  <PlusCircle className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">
                  Crea una tienda para generar un enlace de registro.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
