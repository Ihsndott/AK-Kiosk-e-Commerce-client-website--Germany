"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "ak_kiosk_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // Ignore storage read errors
    }
    setHydrated(true);
  }, []);

  // Persist cart to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage write errors
    }
  }, [items, hydrated]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Normalize product ID — MongoDB products use _id, static products use id
  const getItemKey = (product) => {
    if (!product) return "";
    return String(product._id || product.id || "");
  };

  /**
   * Add a product to the cart with strict stock validation.
   */
  const addToCart = (product, quantity = 1) => {
    const productKey = getItemKey(product);
    if (!productKey) return { success: false, message: "Invalid product identifier." };

    const availableStock =
      typeof product.stock === "number" ? product.stock : Infinity;

    if (availableStock <= 0) {
      setNotification(`"${product.name}" is currently out of stock.`);
      setTimeout(() => setNotification(null), 3000);
      return { success: false, message: `"${product.name}" is currently out of stock.` };
    }

    let added = true;
    let feedback = "";

    setItems((prev) => {
      const existing = prev.find((item) => getItemKey(item) === productKey);

      if (existing) {
        const potentialQty = existing.quantity + quantity;
        if (potentialQty > availableStock) {
          if (existing.quantity >= availableStock) {
            added = false;
            feedback = `Cannot add more. You already have all ${availableStock} available unit${availableStock === 1 ? "" : "s"} in your bag.`;
            return prev;
          }
          const maxAddable = availableStock - existing.quantity;
          feedback = `Added ${maxAddable} unit${maxAddable === 1 ? "" : "s"} (maximum available in stock).`;
          return prev.map((item) =>
            getItemKey(item) === productKey
              ? { ...item, quantity: availableStock, stock: availableStock, price: product.price }
              : item
          );
        }

        return prev.map((item) =>
          getItemKey(item) === productKey
            ? { ...item, quantity: potentialQty, stock: availableStock, price: product.price }
            : item
        );
      }

      const initialQty = Math.min(quantity, availableStock);
      return [
        ...prev,
        {
          ...product,
          _id: product._id || product.id,
          id: product.id || product._id,
          quantity: initialQty,
          stock: availableStock,
        },
      ];
    });

    if (added) {
      setNotification(feedback || `${product.name} added to bag`);
      setTimeout(() => setNotification(null), 3000);
      return { success: true, message: feedback || `${product.name} added to bag` };
    } else {
      setNotification(feedback);
      setTimeout(() => setNotification(null), 3500);
      return { success: false, message: feedback };
    }
  };

  const removeFromCart = (id) => {
    const targetKey = String(id);
    setItems((prev) => prev.filter((item) => getItemKey(item) !== targetKey));
  };

  const updateQuantity = (id, delta) => {
    const targetKey = String(id);
    setItems((prev) =>
      prev
        .map((item) => {
          if (getItemKey(item) === targetKey) {
            const newQty = item.quantity + delta;
            const maxQty = typeof item.stock === "number" ? item.stock : Infinity;
            if (newQty < 1) return null;
            return { ...item, quantity: Math.min(newQty, maxQty) };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => setItems([]);

  /**
   * Refreshes and validates cart items against live MongoDB server data.
   * Updates prices and stock, removes deleted items, and clamps excessive quantities.
   */
  const refreshCartWithServer = useCallback(async () => {
    if (items.length === 0) return { valid: true, changes: [] };

    try {
      const res = await fetch("/api/products");
      if (!res.ok) return { valid: true, changes: [] };

      const json = await res.json();
      if (!json.success || !Array.isArray(json.data)) return { valid: true, changes: [] };

      const serverProducts = new Map(
        json.data.map((p) => [String(p._id), p])
      );

      const changes = [];
      const updatedItems = [];

      for (const item of items) {
        const itemKey = getItemKey(item);
        const live = serverProducts.get(itemKey);

        if (!live) {
          changes.push(`"${item.name}" is no longer available and was removed from your bag.`);
          continue;
        }

        const liveStock = typeof live.stock === "number" ? live.stock : 0;
        if (liveStock <= 0) {
          changes.push(`"${live.name}" is now out of stock and was removed.`);
          continue;
        }

        let newQty = item.quantity;
        if (newQty > liveStock) {
          newQty = liveStock;
          changes.push(`"${live.name}" quantity adjusted to ${liveStock} (available stock limit).`);
        }

        if (live.price !== item.price) {
          changes.push(`"${live.name}" price updated to €${Number(live.price).toFixed(2)}.`);
        }

        updatedItems.push({
          ...item,
          name: live.name,
          price: live.price,
          stock: liveStock,
          image: live.image || item.image,
          quantity: newQty,
        });
      }

      setItems(updatedItems);
      return { valid: changes.length === 0, changes };
    } catch {
      return { valid: true, changes: [] };
    }
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        isOpen,
        setIsOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCartWithServer,
        notification,
        hydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
