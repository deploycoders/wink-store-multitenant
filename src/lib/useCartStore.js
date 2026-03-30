import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, size = null, variantData = null) => {
        const { items } = get();
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

        if (existingItemIndex > -1) {
          const newItems = [...items];
          newItems[existingItemIndex].quantity += quantity;
          newItems[existingItemIndex].price = finalUnitPrice;
          newItems[existingItemIndex].base_price = basePrice;
          newItems[existingItemIndex].regular_price = regularPrice;
          newItems[existingItemIndex].discount_price = hasActiveOffer
            ? discountPrice
            : null;
          newItems[existingItemIndex].is_on_sale = hasActiveOffer;
          set({ items: newItems });
        } else {
          set({
            items: [
              ...items,
              {
                ...product,
                quantity,
                variant: normalizedSize,
                variant_name: variantData?.name || null,
                base_price: basePrice,
                price_adjustment: priceAdjustment,
                price: finalUnitPrice,
                regular_price: regularPrice,
                discount_price: hasActiveOffer ? discountPrice : null,
                is_on_sale: hasActiveOffer,
              },
            ],
          });
        }
      },

      removeItem: (productId, variant = null) => {
        const normalizedVariant = variant || null;
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                String(item.id) === String(productId) &&
                (item.variant || null) === normalizedVariant
              ),
          ),
        }));
      },

      updateQuantity: (productId, quantity, variant = null) => {
        if (quantity < 1) return;
        const normalizedVariant = variant || null;
        set((state) => ({
          items: state.items.map((item) =>
            String(item.id) === String(productId) &&
            (item.variant || null) === normalizedVariant
              ? { ...item, quantity }
              : item,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0,
        );
      },
    }),
    {
      name: "cart-storage",
    },
  ),
);
