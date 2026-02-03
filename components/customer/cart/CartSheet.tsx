"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingCart,
  Sparkles,
  ChevronRight,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
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
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleOrder = async () => {
    try {
      setIsLoading(true);
      const result = await createOrder(cartItems);

      if (result.success) {
        setOrderSuccess(true);
        toast.success(result.message, { icon: '🎉' });
        
        // แสดงหน้าสำเร็จ 2 วินาที แล้วปิด
        setTimeout(() => {
          clearCart();
          setOrderSuccess(false);
          setIsOpen(false);
        }, 2000);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Order failed", error);
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCart = () => {
    if (confirm('ต้องการล้างตะกร้าทั้งหมด?')) {
      clearCart();
      toast.success('ล้างตะกร้าแล้ว', { icon: '🗑️' });
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
      {/* ✅ Floating Cart Button - ปรับขนาดให้ใหญ่ขึ้น */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 group"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-brand-yellow rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
        
        {/* Button */}
        <div className="relative flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-brand-yellow via-yellow-400 to-amber-400 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all">
          <div className="relative">
            <ShoppingCart className="w-6 h-6 text-black" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[22px] h-[22px] px-1 bg-red-500 text-white text-xs font-black rounded-full border-2 border-black animate-bounce">
                {cartCount}
              </span>
            )}
          </div>
          
          {/* แสดงยอดรวมบนปุ่ม */}
          {cartTotal > 0 && (
            <span className="font-black text-black text-lg hidden sm:block">
              ฿{cartTotal.toLocaleString()}
            </span>
          )}
        </div>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ✅ Bottom Sheet / Side Panel */}
      <div
        className={`fixed z-50 bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] shadow-2xl transform transition-all duration-300 ease-out flex flex-col
          bottom-0 left-0 right-0 rounded-t-[2rem] max-h-[90vh]
          md:top-0 md:right-0 md:bottom-0 md:left-auto md:h-full md:w-[420px] md:rounded-l-[2rem] md:rounded-tr-none md:max-h-full
          ${
            isOpen
              ? "translate-y-0 md:translate-x-0"
              : "translate-y-full md:translate-x-full md:translate-y-0"
          }`}
      >
        {/* ✅ Handle bar - Mobile only */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div 
            className="w-14 h-1.5 bg-white/30 rounded-full cursor-pointer hover:bg-white/50 transition-colors" 
            onClick={() => setIsOpen(false)}
          />
        </div>

        {/* ✅ Order Success Animation */}
        {orderSuccess && (
          <div className="absolute inset-0 z-10 bg-gradient-to-br from-emerald-500 to-green-600 flex flex-col items-center justify-center animate-in zoom-in duration-300">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 animate-bounce">
                <CheckCircle2 className="w-14 h-14 text-emerald-500" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-300 animate-spin" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">สั่งอาหารสำเร็จ!</h2>
            <p className="text-emerald-100 text-lg">กำลังเตรียมอาหารให้คุณ...</p>
          </div>
        )}

        {/* ✅ Header */}
        <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-yellow to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-yellow/30">
              <ShoppingBag className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">ตะกร้าของคุณ</h2>
              <p className="text-xs text-gray-400">{cartCount} รายการ</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Clear Cart Button */}
            {cartItems.length > 0 && (
              <button
                onClick={handleClearCart}
                className="p-2.5 bg-red-500/10 rounded-xl text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all active:scale-95"
                title="ล้างตะกร้า"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-all active:scale-95"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* ✅ Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <div className="relative mb-6">
                <div className="w-28 h-28 bg-white/5 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-14 h-14 opacity-30" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border-4 border-[#1a1a1a]">
                  <AlertCircle className="w-5 h-5 text-gray-500" />
                </div>
              </div>
              <p className="text-xl font-bold text-white mb-2">ตะกร้าว่างเปล่า</p>
              <p className="text-sm text-gray-500 text-center">เลือกเมนูที่ชอบแล้วเพิ่มลงตะกร้าเลย!</p>
              
              <button
                onClick={() => setIsOpen(false)}
                className="mt-6 px-6 py-3 bg-brand-yellow text-black font-bold rounded-xl hover:bg-white transition-all flex items-center gap-2"
              >
                เลือกเมนู
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            cartItems.map((item, index) => (
              <div
                key={`${item.id}-${item.note}`}
                className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] p-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex gap-4">
                  {/* ✅ Item Image */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-gray-800">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl">🍽️</span>
                      </div>
                    )}
                    
                    {/* Price Badge */}
                    <div className="absolute bottom-1 left-1 right-1 bg-black/70 backdrop-blur-sm rounded-lg py-1 text-center">
                      <span className="text-brand-yellow font-bold text-sm">
                        ฿{item.price}
                      </span>
                    </div>
                  </div>

                  {/* ✅ Item Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-white text-base sm:text-lg line-clamp-2 leading-tight">
                          {item.name}
                        </h3>
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 -mr-1 -mt-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all active:scale-90"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Note */}
                      {item.note && (
                        <p className="text-xs text-gray-400 italic mt-1.5 line-clamp-1 bg-white/5 px-2 py-1 rounded-lg inline-block">
                          📝 {item.note}
                        </p>
                      )}
                    </div>

                    {/* ✅ Bottom Row - Price & Quantity */}
                    <div className="flex justify-between items-center mt-3">
                      {/* Total Price */}
                      <div>
                        <p className="text-brand-yellow font-black text-lg sm:text-xl">
                          ฿{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>

                      {/* ✅ Quantity Controls - ปรับขนาดใหญ่ขึ้น */}
                      <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
                        <button
                          onClick={() =>
                            updateCartItem(item.id, Math.max(0, item.quantity - 1))
                          }
                          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-white transition-all active:scale-90"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 sm:w-12 text-center text-lg font-black text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartItem(item.id, item.quantity + 1)}
                          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-brand-yellow hover:bg-yellow-300 text-black transition-all active:scale-90"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ✅ Footer / Checkout - Sticky */}
        {cartItems.length > 0 && (
          <div className="shrink-0 border-t border-white/10 bg-gradient-to-t from-black/50 to-transparent">
            {/* Order Summary */}
            <div className="p-4 sm:p-5 space-y-3">
              {/* Items Count */}
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  จำนวนรายการ
                </span>
                <span>{cartCount} รายการ</span>
              </div>
              
              {/* Estimated Time */}
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  เวลาโดยประมาณ
                </span>
                <span>15-20 นาที</span>
              </div>
              
              {/* Divider */}
              <div className="border-t border-white/10 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-medium">ยอดรวมทั้งหมด</span>
                  <div className="text-right">
                    <span className="text-3xl sm:text-4xl font-black text-white">
                      ฿{cartTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ Order Button */}
            <div className="px-4 sm:px-5 pb-4 sm:pb-5">
              <button
                onClick={handleOrder}
                disabled={isLoading}
                className={`w-full py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] ${
                  isLoading
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-brand-yellow via-yellow-400 to-amber-400 text-black shadow-xl shadow-brand-yellow/30 hover:shadow-brand-yellow/50 hover:scale-[1.02]'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-black/30 border-t-black rounded-full animate-spin" />
                    กำลังสั่งอาหาร...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    สั่งอาหารเลย
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
              
              {/* Safe Area for iPhone */}
              <div className="h-safe-area-inset-bottom" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}