"use client";
import React, { useState, useEffect } from "react";
import { X, Loader2, Save } from "lucide-react";
import Swal from "sweetalert2";

// UI Components (Shadcn & Custom)
import { Button } from "@/components/ui/button";

// Product Form Sub-components
import MainInfo from "./product-form/MainInfo";
import PricingStock from "./product-form/PricingStock";
import MediaAndStatus from "./product-form/MediaAndStatus";
import VariantManager from "./product-form/VariantManager";
import { CLOUDINARY_CONFIG } from "./product-form/config";
import { useSiteConfig } from "@/context/SiteConfigContext";

const ProductForm = ({
  show,
  onClose,
  onSave,
  editingProduct = null,
  readOnly = false,
}) => {
  const sanitizeVariants = (variants = []) =>
    variants.map((v) => ({
      ...v,
      name: String(v.name || v.attribute_name || "Talla").trim(),
      value: String(v.value || v.attribute_value || "").trim(),
      stock_adjustment: Number(v.stock_adjustment ?? v.stock_quantity) || 0,
      price_adjustment: Number(v.price_adjustment ?? v.price_override) || 0,
    }));

  const calculateTotalStock = (variants = [], fallbackStock = 0) =>
    variants.length > 0
      ? variants.reduce((acc, v) => acc + (Number(v.stock_adjustment) || 0), 0)
      : Number(fallbackStock) || 0;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [newImageFiles, setNewImageFiles] = useState([]); // [{ file, blobUrl }]
  const { tenant_id: tenantId, tenant_slug: tenantSlug } = useSiteConfig();

  const [formData, setFormData] = useState({
    name: "",
    short_description: "",
    description: "",
    price: "",
    discount_price: "",
    stock: "",
    category_ids: [], // Soporte para múltiples categorías
    subcategory_id: "",
    images: [],
    status: "draft",
    featured: false,
    slug: "",
    variants: [],
  });

  useEffect(() => {
    if (show) {
      setNewImageFiles([]);
      fetchCategories();
      if (editingProduct) {
        console.log("Editando producto:", editingProduct);
        // Extraer IDs de categorías si vienen de la tabla pivot
        // Ahora nos aseguramos de que el query traiga category_id
        const initialCategoryIds =
          editingProduct.product_categories?.map((pc) => pc.category_id) ||
          (editingProduct.category_id ? [editingProduct.category_id] : []);
        const uniqueInitialCategoryIds = [
          ...new Set(initialCategoryIds.filter(Boolean)),
        ];

        console.log("IDs de categorías iniciales:", uniqueInitialCategoryIds);

        const initialVariants = sanitizeVariants(
          editingProduct.variants || editingProduct.product_variants || [],
        );

        setFormData({
          ...editingProduct,
          short_description: editingProduct.short_description || "",
          description: editingProduct.description || "",
          discount_price: editingProduct.discount_price || "",
          subcategory_id: editingProduct.subcategory_id || "",
          category_ids: uniqueInitialCategoryIds,
          variants: initialVariants,
          stock: calculateTotalStock(
            initialVariants,
            editingProduct.stock || 0,
          ),
        });
      } else {
        resetForm();
      }
    }
  }, [show, editingProduct]);

  // Effect to handle subcategories when category_ids change or categories are loaded
  useEffect(() => {
    if (formData.category_ids?.length > 0 && categories.length > 0) {
      const merged = categories
        .filter((c) => formData.category_ids.includes(c.id))
        .flatMap((c) => c.subcategories || []);

      const uniqueById = Array.from(
        new Map(merged.map((sub) => [sub.id, sub])).values(),
      );
      setSubcategories(uniqueById);
    } else {
      setSubcategories([]);
    }
  }, [formData.category_ids, categories]);

  const resetForm = () => {
    // Revocar todos los blobs actuales para evitar memory leaks
    newImageFiles.forEach((f) => URL.revokeObjectURL(f.blobUrl));
    setNewImageFiles([]);

    setFormData({
      name: "",
      short_description: "",
      description: "",
      price: "",
      discount_price: "",
      stock: "",
      category_ids: [],
      subcategory_id: "",
      images: [],
      status: "draft",
      featured: false,
      slug: "",
      variants: [],
    });
    setSubcategories([]);
  };

  // Cleanup blobs on unmount
  useEffect(() => {
    return () => {
      newImageFiles.forEach((f) => URL.revokeObjectURL(f.blobUrl));
    };
  }, [newImageFiles]);

  const fetchCategories = async () => {
    try {
      const resp = await fetch("/api/categories");
      const result = await resp.json();
      console.log("Categorías obtenidas:", result);
      if (result.success) setCategories(result.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleCategoryChange = (catId) => {
    setFormData((prev) => {
      const currentIds = prev.category_ids || [];
      const isSelected = currentIds.includes(catId);
      const newIds = isSelected
        ? currentIds.filter((id) => id !== catId)
        : [...currentIds, catId];

      return { ...prev, category_ids: newIds, subcategory_id: "" };
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newFilesWithUrls = files.map((file) => ({
      file,
      blobUrl: URL.createObjectURL(file),
    }));

    setNewImageFiles((prev) => [...prev, ...newFilesWithUrls]);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newFilesWithUrls.map((f) => f.blobUrl)],
    }));
  };

  const removeImage = (index) => {
    const imageUrlToRemove = formData.images[index];

    // Si es un blob URL, revocarlo y quitarlo de newImageFiles
    if (imageUrlToRemove.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrlToRemove);
      setNewImageFiles((prev) =>
        prev.filter((f) => f.blobUrl !== imageUrlToRemove),
      );
    }

    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const uploadNewImages = async () => {
    if (newImageFiles.length === 0) return [];

    setUploading(true);
    try {
      const safeSlug = String(
        tenantSlug || `tenant-${tenantId || "general"}`,
      ).replace(/[^a-zA-Z0-9_-]/g, "-");

      const uploadPromises = newImageFiles.map(async ({ file }) => {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
        data.append("cloud_name", CLOUDINARY_CONFIG.cloudName);
        data.append("folder", `tenants/${safeSlug}/products`);

        const resp = await fetch(CLOUDINARY_CONFIG.uploadUrl, {
          method: "POST",
          body: data,
        });

        if (!resp.ok) {
          const errorData = await resp.json();
          throw new Error(
            errorData.error?.message || "Error al subir a Cloudinary",
          );
        }

        const resJson = await resp.json();
        return resJson.secure_url;
      });

      return await Promise.all(uploadPromises);
    } catch (err) {
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Subir imágenes nuevas primero
      const newUrls = await uploadNewImages();

      // 2. Limpiar y validar variantes (Aseguramos que stock_adjustment sea número)
      const cleanedVariants = sanitizeVariants(formData.variants || []);

      // 3. CALCULAR STOCK TOTAL: Si hay variantes, sumamos sus stocks.
      // Si no hay variantes, usamos el stock general del formulario.
      const totalStock = calculateTotalStock(cleanedVariants, formData.stock);

      // 4. Filtrar URLs de blobs y combinar con las nuevas URLs reales de Cloudinary
      const finalImages = [
        ...formData.images.filter((url) => !url.startsWith("blob:")),
        ...newUrls,
      ];

      // 5. Construir objeto final para enviar
      const finalFormData = {
        ...formData,
        category_ids: [
          ...new Set((formData.category_ids || []).filter(Boolean)),
        ],
        images: finalImages,
        variants: cleanedVariants, // Enviamos variantes limpias
        stock: totalStock, // Enviamos el stock real calculado
        tenant_id: tenantId || formData.tenant_id || null,
      };

      // Generar slug si no existe
      if (!finalFormData.slug) {
        finalFormData.slug = finalFormData.name
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "");
      }

      const method = editingProduct ? "PUT" : "POST";
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";

      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalFormData),
      });

      const result = await resp.json();
      if (result.success) {
        Swal.fire({
          icon: "success",
          title: editingProduct ? "¡Actualizado!" : "¡Creado!",
          text: `El producto se ha ${editingProduct ? "actualizado" : "guardado"} correctamente. Stock total: ${totalStock}`,
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "rounded-[2rem]" },
        });
        onSave();
        onClose();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Ups...",
        text: err.message,
        customClass: { popup: "rounded-[2rem]" },
      });
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  const variantsPreview = sanitizeVariants(formData.variants || []);
  const isAutoStock = variantsPreview.length > 0;
  const effectiveStock = calculateTotalStock(variantsPreview, formData.stock);

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xl z-100 flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-[3rem] shadow-2xl relative border border-white/20 dark:border-slate-700/50 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header Elegante */}
        <div className="p-8 pb-6 flex justify-between items-center border-b border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-slate-900 shadow-xl shadow-slate-200 dark:shadow-none">
              <span className="font-black text-xl">W</span>
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
                {readOnly
                  ? "Detalles del Producto"
                  : editingProduct
                    ? "Editar Producto"
                    : "Nuevo Producto"}
              </h3>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-[0.2em]">
                Configuración de Catálogo e Inventario
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-300 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X size={24} />
          </Button>
        </div>

        {/* Cuerpo del Formulario con Grid */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          {/* Reemplazo de ScrollArea por div estándar con overflow-y-auto */}
          <div className="flex-1 overflow-y-auto p-8 min-h-0 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Columna Principal (Información y Precios) */}
              <div className="lg:col-span-8 space-y-10">
                <MainInfo
                  formData={formData}
                  setFormData={setFormData}
                  readOnly={readOnly}
                />

                <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                  <PricingStock
                    formData={formData}
                    setFormData={setFormData}
                    readOnly={readOnly}
                    effectiveStock={effectiveStock}
                    autoCalculated={isAutoStock}
                  />
                </div>
              </div>

              {/* Columna Lateral (Media y Categorías) */}
              <div className="lg:col-span-4 space-y-8 lg:border-l lg:border-slate-50 dark:lg:border-slate-800 lg:pl-8">
                <MediaAndStatus
                  formData={formData}
                  setFormData={setFormData}
                  categories={categories}
                  subcategories={subcategories}
                  uploading={uploading}
                  handleImageUpload={handleImageUpload}
                  handleCategoryChange={handleCategoryChange}
                  removeImage={removeImage}
                  readOnly={readOnly}
                />
              </div>

              {/* Sección Inferior (Variantes) */}
              <div className="lg:col-span-12 pt-8 border-t border-slate-100 dark:border-slate-800 mt-4">
                <VariantManager
                  formData={formData}
                  setFormData={setFormData}
                  readOnly={readOnly}
                />
              </div>
            </div>
          </div>
          {/* Footer de Acciones */}
          <div className="p-8 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-2xl px-8 h-12 cursor-pointer text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:bg-white dark:hover:bg-slate-700 transition-all"
            >
              {/* Cambio dinámico del texto según readOnly */}
              {readOnly ? "Cerrar" : "Cancelar y Salir"}
            </Button>

            {!readOnly && (
              <Button
                disabled={loading || uploading}
                className="bg-slate-900 cursor-pointer dark:bg-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-200 text-white rounded-2xl px-10 h-14 font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-slate-200 dark:shadow-none transition-all disabled:opacity-50 gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Procesando...
                  </>
                ) : (
                  <>
                    <Save size={18} />{" "}
                    {editingProduct ? "Actualizar Producto" : "Crear Producto"}
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
