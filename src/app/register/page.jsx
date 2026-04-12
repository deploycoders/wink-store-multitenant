"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getInvitation } from "@/services/tenants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  AlertCircle,
  User,
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  Store,
} from "lucide-react";
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
        confirmButtonColor: "#0f172a", // Slate 900
      });
      return;
    }

    setRegistering(true);
    try {
      const response = await fetch("/api/auth/register-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, token }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Error al registrar");

      const tenantName =
        result?.tenant?.nombre || invitation?.tenants?.name || "tu tienda";

      Swal.fire({
        title: "¡Bienvenido!",
        text: `La cuenta para ${tenantName} ha sido activada.`,
        icon: "success",
        confirmButtonColor: "#0f172a",
      }).then(() => router.push("/admin/login"));
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.message,
        icon: "error",
        confirmButtonColor: "#0f172a",
      });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-slate-900" />
        <p className="text-slate-500 font-medium text-sm tracking-tight">
          Preparando tu acceso...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10 bg-white border border-slate-200 rounded-3xl shadow-sm max-w-md w-full animate-in zoom-in-95 duration-300">
        <AlertCircle className="h-12 w-12 text-slate-900 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Enlace no válido
        </h2>
        <p className="text-slate-500 mt-2 text-sm leading-relaxed">{error}</p>
        <Button
          className="mt-8 w-full rounded-lg h-12 border-slate-900 text-slate-900 hover:bg-slate-50 transition-all font-bold"
          variant="outline"
          onClick={() => router.push("/")}
        >
          Volver al inicio
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white mb-6 shadow-sm">
          <Store className="h-3.5 w-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {invitation?.tenants?.name || "Nueva Tienda"}
          </span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
          CREA TU CUENTA
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          Ingresa tus credenciales para administrar la tienda.
        </p>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            {/* Input Wrapper Component Style */}
            {[
              {
                label: "Nombre Completo",
                id: "full_name",
                type: "text",
                icon: User,
                placeholder: "Tu nombre",
              },
              {
                label: "Email",
                id: "email",
                type: "email",
                icon: Mail,
                placeholder: "correo@ejemplo.com",
              },
              {
                label: "Contraseña",
                id: "password",
                type: "password",
                icon: Lock,
                placeholder: "••••••••",
              },
              {
                label: "Confirmar",
                id: "confirm_password",
                type: "password",
                icon: ShieldCheck,
                placeholder: "••••••••",
              },
            ].map((field) => (
              <div key={field.id} className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  {field.label}
                </label>
                <div className="relative group">
                  <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                  <Input
                    type={field.type}
                    className="pl-12 h-12 bg-white border-slate-200 rounded-lg focus:border-slate-900 focus:ring-0 transition-all placeholder:text-slate-300 text-sm font-medium"
                    placeholder={field.placeholder}
                    value={formData[field.id]}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.id]: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <Button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white h-14 rounded-lg font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 group mt-4 cursor-pointer"
            disabled={registering}
          >
            {registering ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <>
                Confirmar Registro
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </form>
      </div>

      <p className="text-center mt-10 text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
        The Digital Atelier — v1.0 <br />
        <span className="text-slate-300">Soporte Técnico Especializado</span>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6">
      <Suspense fallback={<Loader2 className="animate-spin text-slate-900" />}>
        <RegisterContent />
      </Suspense>
    </div>
  );
}
