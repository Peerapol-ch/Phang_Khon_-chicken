"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { X, ShoppingBag, Trash2 } from "lucide-react";
import { createOrder } from "@/lib/orders/actions";
import { toast } from "sonner";

export default function CartSheet() {
  const {
    cartItems,
    removeFromCart,
    updateCartItem,
    cartCount,
    cartTotal,
    clearCart,
  } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleOrder = async () => {
    try {
      setIsLoading(true);
      const result = await createOrder(cartItems);

      if (result.success) {
        toast.success(result.message); // Ideally replace with a toast
        clearCart(); // Use clearCart from context to empty the cart
        setIsOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Order failed", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle body scroll when sheet is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-16 h-16 bg-brand-yellow rounded-full shadow-[0_4px_20px_rgba(251,191,36,0.4)] hover:scale-105 active:scale-95 transition-all"
      >
        <div className="relative">
          <Image
            src="/images/grocery-store.png"
            alt="Cart"
            width={24}
            height={24}
          />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-[#202020]">
              {cartCount}
            </span>
          )}
        </div>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity border-0 cursor-default"
          onClick={() => setIsOpen(false)}
          aria-label="Close cart"
        />
      )}

      {/* Bottom Sheet */}
      <div
        className={`fixed z-50 bg-[#202020] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col
          bottom-0 left-0 right-0 rounded-t-3xl max-h-[85vh]
          md:top-0 md:right-0 md:bottom-auto md:left-auto md:h-full md:w-[400px] md:rounded-l-3xl md:rounded-tr-none md:max-h-full
          ${
            isOpen
              ? "translate-y-0 md:translate-x-0"
              : "translate-y-full md:translate-x-full md:translate-y-0"
          }`}
      >
        {/* Handle bar for visual cue - Mobile only */}
        <button
          type="button"
          className="w-full flex justify-center pt-3 pb-1 md:hidden focus:outline-none"
          onClick={() => setIsOpen(false)}
          aria-label="Close cart sheet"
        >
          <div className="w-12 h-1.5 bg-gray-600 rounded-full cursor-pointer" />
        </button>

        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-white">Your Order</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg">Your cart is empty</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={`${item.id}-${item.note}`}
                className="flex gap-4 bg-black/20 p-4 rounded-xl border border-white/5"
              >
                {/* Item Image */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-800">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs text-gray-500">No Image</span>
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white truncate pr-2">
                      {item.name}
                    </h3>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {item.note && (
                    <p className="text-sm text-gray-400 italic mt-1 line-clamp-1">
                      &quot;{item.note}&quot;
                    </p>
                  )}

                  <div className="flex justify-between items-end mt-3">
                    <p className="text-brand-yellow font-bold">
                      {(item.price * item.quantity).toFixed(2)} ฿
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 bg-white/5 rounded-lg p-1">
                      <button
                        onClick={() =>
                          updateCartItem(
                            item.id,
                            Math.max(0, item.quantity - 1)
                          )
                        }
                        className="w-6 h-6 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateCartItem(item.id, item.quantity + 1)
                        }
                        className="w-6 h-6 flex items-center justify-center rounded bg-brand-yellow text-black hover:bg-brand-yellow/80 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout */}
        {cartItems.length > 0 && (
          <div className="p-6 bg-[#202020] border-t border-white/10 shrink-0 safe-area-bottom">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400">Total</span>
              <span className="text-2xl font-bold text-white">
                {cartTotal.toFixed(2)} ฿
              </span>
            </div>
            <button
              onClick={handleOrder}
              disabled={isLoading}
              className="w-full py-4 bg-brand-yellow text-black font-bold text-lg rounded-xl hover:bg-white transition-all shadow-[0_4px_20px_rgba(251,191,36,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Order Now"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
