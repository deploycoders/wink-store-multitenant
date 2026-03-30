"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { createTenant } from "@/services/tenants";
import Swal from "sweetalert2";

export function NewTenantModal({ onTenantCreated }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    plan: "Bronze",
    whatsapp_number: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { tenant, invitation } = await createTenant(formData);

      onTenantCreated(tenant, invitation);
      setOpen(false);
      setFormData({ name: "", slug: "", plan: "Bronze", whatsapp_number: "" });

      Swal.fire({
        title: "¡Éxito!",
        text: `La tienda "${tenant.name}" ha sido creada.`,
        icon: "success",
        confirmButtonColor: "#3b82f6",
      });
    } catch (error) {
      console.error("Error creating tenant:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "No se pudo crear la tienda.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setFormData({ ...formData, name, slug });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Tienda
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 leading-tight">
            Registrar Nueva Tienda
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Configura los datos básicos para el nuevo ecosistema de ecommerce.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nombre de la Tienda
              </label>
              <Input
                placeholder="Ej. Mi Tienda Increíble"
                value={formData.name}
                onChange={handleNameChange}
                required
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Slug (URL)
              </label>
              <div className="flex items-center">
                <span className="bg-gray-50 border border-r-0 border-gray-300 px-3 py-2 text-sm text-gray-500 rounded-l-md">
                  https://
                </span>
                <Input
                  placeholder="mi-tienda"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  required
                  className="rounded-l-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="bg-gray-50 border border-l-0 border-gray-300 px-3 py-2 text-sm text-gray-500 rounded-r-md">
                  .tuplataforma.com
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Número de WhatsApp
              </label>
              <Input
                placeholder="58412..."
                value={formData.whatsapp_number}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp_number: e.target.value })
                }
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 font">
                Plan de Suscripción
              </label>
              <Select
                value={formData.plan}
                onChange={(e) =>
                  setFormData({ ...formData, plan: e.target.value })
                }
                className="border-gray-300 focus:ring-blue-500"
              >
                <option value="Bronze">Bronze (Básico)</option>
                <option value="Silver">Silver (Pro)</option>
                <option value="Gold">Gold (Enterprise)</option>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 h-11"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Finalizar Registro"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
