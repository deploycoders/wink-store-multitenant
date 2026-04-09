"use client";

import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Copy,
  Check,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { buildClientUrl } from "@/lib/url";
import { cn } from "@/lib/utils";
import Swal from "sweetalert2";
import { revokeInvitation } from "@/services/tenants";

export function InvitationLink({
  invitation,
  tenantName,
  tenantWhatsappNumber,
  onRevoked,
}) {
  const [copied, setCopied] = useState(false);

  if (!invitation) return null;

  const tenantWhatsapp =
    tenantWhatsappNumber || invitation.tenants?.whatsapp_number;
  const registrationLink = buildClientUrl(`/register?token=${invitation.id}`);
  const whatsappMessage = `¡Hola! Tu tienda ${tenantName} está lista. Regístrate aquí para comenzar a gestionar tu negocio: ${registrationLink}`;
  const cleanNumber = tenantWhatsapp
    ? String(tenantWhatsapp).replace(/\D/g, "")
    : "";

  const whatsappUrl = cleanNumber
    ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(whatsappMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  const copyLink = () => {
    navigator.clipboard.writeText(registrationLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = async () => {
    const result = await Swal.fire({
      title: "¿Cancelar invitación?",
      text: "El enlace dejará de ser válido y no se podrá usar.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#ef4444",
      customClass: {
        popup: "rounded-[2rem]",
        confirmButton: "rounded-xl uppercase text-xs tracking-widest px-8",
        cancelButton: "rounded-xl uppercase text-xs tracking-widest px-8",
      },
    });

    if (!result.isConfirmed) return;

    try {
      await revokeInvitation(invitation.id);
      onRevoked?.(invitation);
      Swal.fire({
        title: "Invitación cancelada",
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      Swal.fire("Error", "No se pudo cancelar la invitación.", "error");
    }
  };

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Header con Badge */}
      <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 rounded-md">
            <LinkIcon className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Invitación de Registro
          </span>
        </div>
        <Badge className="bg-amber-100 flex justify-center w-32 text-amber-700 border-amber-200 hover:bg-amber-100 shadow-none text-[10px]">
          UN SOLO USO
        </Badge>
      </div>

      <div className="p-4 space-y-4">
        <p className="text-xs text-slate-500 leading-relaxed">
          Comparte este enlace con el administrador de{" "}
          <span className="font-semibold text-slate-700">{tenantName}</span>{" "}
          para activar su cuenta.
        </p>

        {/* Input Falso para mostrar el link */}
        <div className="group relative flex items-center">
          <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-400 truncate pr-10 font-mono">
            {registrationLink}
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={copyLink}
            className={cn(
              "absolute right-1 h-7 w-7 transition-all",
              copied ? "text-green-600" : "text-slate-400 hover:text-blue-600",
            )}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        {/* Acciones principales */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            onClick={copyLink}
            variant="outline"
            className={cn(
              "h-9 text-xs cursor-pointer font-medium transition-all border-slate-200 w-full", // Añadido w-full
              copied &&
                "border-green-200 bg-green-50 text-green-700 hover:bg-green-50",
            )}
          >
            {copied ? (
              <span className="flex items-center justify-center">
                <Check className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                <span className="truncate">¡Copiado!</span>
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Copy className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                <span className="truncate">Copiar Enlace</span>
              </span>
            )}
          </Button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full" // CRÍTICO: block y w-full para que ocupe su celda del grid
          >
            <Button className="h-9 w-full text-xs cursor-pointer font-medium transition-all bg-[#25D366] hover:bg-[#20bd5a] flex items-center justify-center">
              <MessageCircle className="h-3.5 w-3.5 mr-1.5 shrink-0" />
              <span className="truncate">WhatsApp</span>{" "}
              {/* Usamos truncate por si el contenedor es muy pequeño */}
            </Button>
          </a>
        </div>

        <Button
          onClick={handleRevoke}
          variant="outline"
          className="h-9 w-full text-xs cursor-pointer font-medium transition-all border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          Cerrar invitación
        </Button>
      </div>
    </div>
  );
}
