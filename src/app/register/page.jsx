"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getInvitation } from "@/services/tenants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Store, User, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";

function RegisterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  useEffect(() => {
    if (!token) {
      setError("No se proporcionó un token de invitación.");
      setLoading(false);
      return;
    }

    const validateToken = async () => {
      try {
        const data = await getInvitation(token);
        if (!data) {
          setError("La invitación es inválida, expiró o ya fue utilizada.");
        } else {
          setInvitation(data);
        }
      } catch (err) {
        setError("Error al validar la invitación.");
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      Swal.fire({
        title: "Error",
        text: "Las contraseñas no coinciden",
        icon: "error",
      });
      return;
    }

    setRegistering(true);

    try {
      const response = await fetch("/api/auth/register-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          token,
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Error al registrar");

      Swal.fire({
        title: "¡Bienvenido!",
        text: `Tu cuenta para la tienda "${result.tenant_name}" ha sido creada con éxito.`,
        icon: "success",
        confirmButtonColor: "#3b82f6",
      }).then(() => {
        router.push("/admin/login");
      });
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error" });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-500 mt-4 text-sm">Validando invitación...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 border border-red-100 rounded-3xl max-w-md w-full">
        <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-900">Acceso Denegado</h2>
        <p className="text-red-700 mt-2">{error}</p>
        <Button
          className="mt-6"
          variant="outline"
          onClick={() => router.push("/")}
        >
          Volver al Inicio
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-100">
          Invitación para {invitation.tenants?.name}
        </Badge>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Crea tu Cuenta Administradora
        </h1>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Nombre Completo
            </label>
            <Input
              placeholder="Ej. Juan Pérez"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Correo Electrónico
            </label>
            <Input
              type="email"
              placeholder="juan@ejemplo.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Contraseña
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Confirmar Contraseña
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={formData.confirm_password}
              onChange={(e) =>
                setFormData({ ...formData, confirm_password: e.target.value })
              }
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white hover:bg-blue-700 h-12"
            disabled={registering}
          >
            {registering ? (
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
            ) : (
              "Comenzar Ahora"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Suspense fallback={<Loader2 className="animate-spin" />}>
        <RegisterContent />
      </Suspense>
    </div>
  );
}
