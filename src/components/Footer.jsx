"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Instagram, Facebook, Twitter } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSiteConfig } from "@/context/SiteConfigContext";
import {
  DEFAULT_COMMERCE_SETTINGS,
  DEFAULT_FOOTER_SETTINGS,
  normalizeCommerceSettings,
  normalizeFooterSettings,
  normalizeHeaderMenu,
  normalizeWhatsappNumber,
} from "@/lib/siteConfig";

const footerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: [0.19, 1, 0.22, 1],
      staggerChildren: 0.1,
    },
  },
};

const Footer = () => {
  const {
    site_name,
    header_menu,
    footer_settings,
    commerce_settings,
    tenant_slug,
  } = useSiteConfig();
  const baseUrl = tenant_slug ? `/${tenant_slug}` : "";
  const currentYear = new Date().getFullYear();
  const menuSlots = normalizeHeaderMenu(header_menu);
  const footer = normalizeFooterSettings(footer_settings || DEFAULT_FOOTER_SETTINGS);
  const commerce = normalizeCommerceSettings(
    commerce_settings || DEFAULT_COMMERCE_SETTINGS,
  );
  const whatsappNumber = normalizeWhatsappNumber(commerce.whatsapp_number);
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber}` : "#";

  const sections = [
    {
      title: "Comprar",
      links: [
        ...menuSlots.map((item) => ({
          name: item.label,
          href: item.target_id
            ? `/products?category=${encodeURIComponent(item.target_id)}`
            : `${baseUrl}/products`,
        })),
        { name: "Colecciones", href: `${baseUrl}/products` },
      ],
    },
    {
      title: "Ayuda",
      links: [
        { name: "Privacidad", href: `${baseUrl}/privacy` },
        { name: "Términos", href: `${baseUrl}/terms` },
        { name: "Contacto", href: whatsappHref },
      ],
    },
  ];

  const legalLinks = [
    { name: "Privacidad", href: "/privacy" },
    { name: "Términos", href: "/terms" },
    { name: "Admin", href: "/access" },
  ];

  return (
    <footer className="bg-[#09090b] text-zinc-400 pt-20 pb-10 border-t mt-10 border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* --- SECCIÓN PRINCIPAL --- */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 lg:gap-10 mb-8">
          {/* Brand & Social */}
          <div className="lg:col-span-5 space-y-8">
            <Link
              href={`${baseUrl}/`}
              className="text-2xl font-black tracking-[0.15em] text-white uppercase inline-block"
            >
              {site_name}
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-sm font-medium">
              {footer.description}
            </p>
            <div className="flex gap-6 text-zinc-500">
              {footer.instagram_url?.trim() ? (
                <Link
                  href={footer.instagram_url}
                  className="hover:text-white transition-all duration-300 transform hover:-translate-y-1"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Instagram size={20} strokeWidth={1.5} />
                </Link>
              ) : null}
              {footer.facebook_url?.trim() ? (
                <Link
                  href={footer.facebook_url}
                  className="hover:text-white transition-all duration-300 transform hover:-translate-y-1"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Facebook size={20} strokeWidth={1.5} />
                </Link>
              ) : null}
              {footer.twitter_url?.trim() ? (
                <Link
                  href={footer.twitter_url}
                  className="hover:text-white transition-all duration-300 transform hover:-translate-y-1"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Twitter size={20} strokeWidth={1.5} />
                </Link>
              ) : null}
            </div>
          </div>

          {/* Links Desktop */}
          <div className="hidden md:grid grid-cols-2 lg:col-span-4 gap-8">
            {sections.map((section) => (
              <div key={section.title}>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-200 mb-8">
                  {section.title}
                </h3>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        target={link.name === "Contacto" ? "_blank" : undefined}
                        rel={link.name === "Contacto" ? "noreferrer noopener" : undefined}
                        className="text-sm hover:text-white transition-colors duration-200 font-light"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Acordeón Móvil */}
          <div className="md:hidden pt-4">
            <Accordion type="single" collapsible className="w-full">
              {sections.map((section, idx) => (
                <AccordionItem
                  key={idx}
                  value={`item-${idx}`}
                  className="border-zinc-800"
                >
                  <AccordionTrigger className="text-[10px] font-bold uppercase tracking-widest text-zinc-200 py-6">
                    {section.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-500">
                    <ul className="space-y-4 pb-4">
                      {section.links.map((link) => (
                        <li key={link.name}>
                          <Link
                            href={link.href}
                            target={link.name === "Contacto" ? "_blank" : undefined}
                            rel={link.name === "Contacto" ? "noreferrer noopener" : undefined}
                            className="text-sm"
                          >
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* --- BARRA INFERIOR --- */}
        <div className="pt-10 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
            <p className="text-[9px] text-zinc-600 uppercase tracking-[0.25em]">
              © {currentYear} {site_name}
            </p>
            <span className="hidden md:block w-px h-3 bg-zinc-800" />
            <p className="text-[9px] text-zinc-700 uppercase tracking-[0.25em]">
              Desarrollado por <span className="text-zinc-500">Deploy</span>
            </p>
          </div>

          <div className="flex gap-10">
            {legalLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[9px] text-zinc-600 hover:text-white active:text-white uppercase tracking-[0.25em] transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
