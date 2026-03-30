import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollStop";
import SiteConfigGate from "@/components/SiteConfigGate";
import TenantBrandingLayout from "@/components/tenant/TenantBrandingLayout";

export default async function TenantLayout({ children, params }) {
  const { tenant } = await params;

  return (
    <TenantBrandingLayout tenant={tenant}>
      <SiteConfigGate>
        <div className="flex flex-col min-h-screen">
          <ScrollToTop />
          <Header />
          <main className="grow bg-white">{children}</main>
          <Footer />
        </div>
      </SiteConfigGate>
    </TenantBrandingLayout>
  );
}

