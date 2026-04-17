import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create()(
  persist(
    (set, get) => ({
      // Estructura: { [tenantSlug]: [items...] }
      carts: {},

      /**
       * Agrega un item al carrito de un tenant específico
       */
      addItem: (tenantSlug, product, quantity = 1, size = null, variantData = null) => {
        if (!tenantSlug) return;
        const { carts } = get();
        const items = carts[tenantSlug] || [];
        
        const normalizedSize = size || null;
        const regularPrice = Number(product.price) || 0;
        const discountPrice = Number(product.discount_price) || 0;
        const hasActiveOffer =
          discountPrice > 0 && discountPrice < regularPrice;
        const basePrice = hasActiveOffer ? discountPrice : regularPrice;
        const priceAdjustment = Number(variantData?.price_adjustment) || 0;
        const finalUnitPrice = basePrice + priceAdjustment;

        const existingItemIndex = items.findIndex(
          (item) =>
            String(item.id) === String(product.id) &&
            (item.variant || null) === normalizedSize,
        );

        let newItems;
        if (existingItemIndex > -1) {
          newItems = [...items];
          newItems[existingItemIndex].quantity += quantity;
          newItems[existingItemIndex].price = finalUnitPrice;
          newItems[existingItemIndex].base_price = basePrice;
          newItems[existingItemIndex].regular_price = regularPrice;
          newItems[existingItemIndex].discount_price = hasActiveOffer
            ? discountPrice
            : null;
          newItems[existingItemIndex].is_on_sale = hasActiveOffer;
        } else {
          newItems = [
            ...items,
            {
              ...product,
              quantity,
              variant: normalizedSize,
              variant_id: variantData?.id || null,
              variant_name: variantData?.name || null,
              base_price: basePrice,
              price_adjustment: priceAdjustment,
              price: finalUnitPrice,
              regular_price: regularPrice,
              discount_price: hasActiveOffer ? discountPrice : null,
              is_on_sale: hasActiveOffer,
            },
          ];
        }

        set({
          carts: {
            ...carts,
            [tenantSlug]: newItems,
          },
        });
      },

      /**
       * Elimina un item del carrito de un tenant específico
       */
      removeItem: (tenantSlug, productId, variant = null) => {
        if (!tenantSlug) return;
        const { carts } = get();
        const items = carts[tenantSlug] || [];
        const normalizedVariant = variant || null;

        set({
          carts: {
            ...carts,
            [tenantSlug]: items.filter(
              (item) =>
                !(
                  String(item.id) === String(productId) &&
                  (item.variant || null) === normalizedVariant
                ),
            ),
          },
        });
      },

      /**
       * Actualiza la cantidad de un item en un tenant específico
       */
      updateQuantity: (tenantSlug, productId, quantity, variant = null) => {
        if (!tenantSlug || quantity < 1) return;
        const { carts } = get();
        const items = carts[tenantSlug] || [];
        const normalizedVariant = variant || null;

        set({
          carts: {
            ...carts,
            [tenantSlug]: items.map((item) =>
              String(item.id) === String(productId) &&
              (item.variant || null) === normalizedVariant
                ? { ...item, quantity }
                : item,
            ),
          },
        });
      },

      /**
       * Limpia el carrito de un tenant específico
       */
      clearCart: (tenantSlug) => {
        if (!tenantSlug) return;
        const { carts } = get();
        set({
          carts: {
            ...carts,
            [tenantSlug]: [],
          },
        });
      },

      /**
       * Obtiene los items de un tenant específico (Helper interno)
       */
      getTenantItems: (tenantSlug) => {
        return get().carts[tenantSlug] || [];
      },

      /**
       * Obtiene el total de items para un tenant específico
       */
      getTotalItems: (tenantSlug) => {
        const items = get().carts[tenantSlug] || [];
        return items.reduce((acc, item) => acc + item.quantity, 0);
      },

      /**
       * Obtiene el precio total para un tenant específico
       */
      getTotalPrice: (tenantSlug) => {
        const items = get().carts[tenantSlug] || [];
        return items.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0,
        );
      },
    }),
    {
      name: "cart-storage-v2", // Nueva versión para evitar conflictos con la anterior
    },
  ),
);

/**
 * Hook de conveniencia para usar el carrito de un tenant específico
 */
export function useTenantCart(tenantSlug) {
  const store = useCartStore();

  return {
    items: store.carts[tenantSlug] || [],
    addItem: (product, quantity, size, variantData) =>
      store.addItem(tenantSlug, product, quantity, size, variantData),
    removeItem: (productId, variant) =>
      store.removeItem(tenantSlug, productId, variant),
    updateQuantity: (productId, quantity, variant) =>
      store.updateQuantity(tenantSlug, productId, quantity, variant),
    clearCart: () => store.clearCart(tenantSlug),
    getTotalItems: () => store.getTotalItems(tenantSlug),
    getTotalPrice: () => store.getTotalPrice(tenantSlug),
  };
}
