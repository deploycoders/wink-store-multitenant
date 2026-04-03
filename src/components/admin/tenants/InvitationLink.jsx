"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { buildClientUrl } from "@/lib/url";

export function InvitationLink({ invitation, tenantName }) {
  const [copied, setCopied] = useState(false);
  
  if (!invitation) return null;

  const tenantWhatsapp = invitation.tenants?.whatsapp_number;
  const registrationLink = buildClientUrl(`/register?token=${invitation.id}`);
  const whatsappMessage = `¡Hola! Tu tienda ${tenantName} está lista. Regístrate aquí para comenzar a gestionar tu negocio: ${registrationLink}`;
  
  // Si tenemos el número, lo usamos en la URL de WhatsApp
  const whatsappUrl = tenantWhatsapp 
    ? `https://wa.me/${tenantWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  const copyLink = () => {
    navigator.clipboard.writeText(registrationLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-500">REGISTRO PENDIENTE</Badge>
          <span className="text-sm font-medium text-blue-900">Link de Invitación generado</span>
        </div>
      </div>
      
      <p className="text-xs text-blue-700 leading-relaxed">
        Envía este enlace al nuevo administrador de la tienda para que complete su registro. 
        Este token es de un solo uso.
      </p>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button 
          onClick={copyLink} 
          variant="outline" 
          size="sm" 
          className="border-blue-200 hover:bg-blue-100 text-blue-700 flex-1"
        >
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
          {copied ? "¡Copiado!" : "Copiar Link"}
        </Button>
        <a 
          href={whatsappUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button 
            size="sm" 
            className="w-full bg-green-500 hover:bg-green-600 text-white shadow-sm"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
        </a>
      </div>
    </div>
  );
}
