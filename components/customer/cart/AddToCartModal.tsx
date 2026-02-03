"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { 
  X, 
  Heart, 
  Minus, 
  Plus, 
  ShoppingBag, 
  MessageSquare,
  Sparkles,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  description?: string;
}

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
}

export default function AddToCartModal({
  isOpen,
  onClose,
  item,
}: Readonly<AddToCartModalProps>) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const checkFavoriteStatus = useCallback(async () => {
    if (!item) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .eq("menu_item_id", item.id)
        .single();

      setIsFavorite(!!data);
    } else {
      setIsFavorite(false);
    }
  }, [item]);

  useEffect(() => {
    if (isOpen && item) {
      setQuantity(1);
      setNote("");
      setShowNoteInput(false);
      checkFavoriteStatus();
    }
  }, [isOpen, item, checkFavoriteStatus]);

  // ✅ ป้องกัน scroll เมื่อ modal เปิด
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 300));
    
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: quantity,
      image: item.image_url,
      note: note,
    });
    
    setIsAdding(false);
    toast.success(`เพิ่ม ${item.name} x${quantity} แล้ว`, {
      icon: '🛒',
    });
    onClose();
  };

  const handleAddToFavorite = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบก่อนเพิ่มรายการโปรด");
      return;
    }

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("menu_item_id", item.id);

        if (error) throw error;
        setIsFavorite(false);
        toast.success("ลบออกจากรายการโปรดแล้ว", { icon: '💔' });
      } else {
        const { error } = await supabase.from("favorites").insert({
          user_id: user.id,
          menu_item_id: item.id,
        });

        if (error) throw error;
        setIsFavorite(true);
        toast.success("เพิ่มรายการโปรดแล้ว", { icon: '❤️' });
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  };

  // ✅ Quick quantity buttons
  const quickQuantities = [1, 2, 3, 5];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full sm:w-[480px] sm:max-w-[95vw] bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] sm:rounded-3xl rounded-t-3xl shadow-2xl border border-white/10 max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300 sm:animate-in sm:zoom-in-95">
        
        {/* ✅ Drag Handle (Mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-white/30 rounded-full" />
        </div>

        {/* ✅ Header with Image */}
        <div className="relative">
          {/* Image */}
          <div className="relative h-44 sm:h-56 w-full overflow-hidden">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <span className="text-6xl">🍽️</span>
              </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
            
            {/* Price Badge */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20">
              <span className="text-brand-yellow font-black text-lg sm:text-xl">
                ฿{item.price.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            {/* Favorite Button */}
            <button
              onClick={handleAddToFavorite}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 ${
                isFavorite 
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/50' 
                  : 'bg-black/60 backdrop-blur-xl text-white border border-white/20 hover:bg-pink-500/20'
              }`}
            >
              <Heart className={`w-5 h-5 sm:w-6 sm:h-6 transition-all ${isFavorite ? 'fill-current scale-110' : ''}`} />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-11 h-11 sm:w-12 sm:h-12 bg-black/60 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white hover:text-black transition-all duration-300 active:scale-90"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* ✅ Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-224px)]">
          
          {/* Title & Description */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {item.name}
            </h2>
            {item.description && (
              <p className="text-gray-400 text-sm sm:text-base mt-2 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>

          {/* ✅ Quick Quantity Selector */}
          <div className="space-y-3">
            <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-yellow" />
              เลือกจำนวน
            </label>
            <div className="flex gap-2 flex-wrap">
              {quickQuantities.map((q) => (
                <button
                  key={q}
                  onClick={() => setQuantity(q)}
                  className={`min-w-[3.5rem] h-12 sm:h-14 px-4 rounded-2xl font-bold text-lg transition-all duration-200 active:scale-95 ${
                    quantity === q
                      ? 'bg-brand-yellow text-black shadow-lg shadow-brand-yellow/30'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}
                >
                  {q}
                </button>
              ))}
              
              {/* Custom Quantity */}
              <div className={`flex items-center gap-1 px-2 rounded-2xl transition-all ${
                !quickQuantities.includes(quantity) 
                  ? 'bg-brand-yellow shadow-lg shadow-brand-yellow/30' 
                  : 'bg-white/10 border border-white/10'
              }`}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                    !quickQuantities.includes(quantity) ? 'text-black hover:bg-black/10' : 'text-white hover:bg-white/10'
                  }`}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className={`w-10 text-center font-black text-xl ${
                  !quickQuantities.includes(quantity) ? 'text-black' : 'text-white'
                }`}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                    !quickQuantities.includes(quantity) ? 'text-black hover:bg-black/10' : 'text-white hover:bg-white/10'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* ✅ Note Section - Collapsible */}
          <div className="space-y-3">
            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                showNoteInput || note
                  ? 'bg-brand-yellow/10 border-2 border-brand-yellow/30'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  showNoteInput || note ? 'bg-brand-yellow text-black' : 'bg-white/10 text-white'
                }`}>
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className={`font-semibold ${showNoteInput || note ? 'text-brand-yellow' : 'text-white'}`}>
                    หมายเหตุพิเศษ
                  </p>
                  <p className="text-xs text-gray-500">
                    {note ? note.substring(0, 30) + (note.length > 30 ? '...' : '') : 'เช่น ไม่ใส่หอม, เผ็ดน้อย'}
                  </p>
                </div>
              </div>
              {note && <Check className="w-5 h-5 text-brand-yellow" />}
            </button>

            {showNoteInput && (
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="พิมพ์หมายเหตุที่นี่..."
                className="w-full h-24 bg-black/40 border-2 border-white/10 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 resize-none text-base transition-all"
                autoFocus
              />
            )}
          </div>
        </div>

        {/* ✅ Bottom Action Bar - Fixed */}
        <div className="sticky bottom-0 p-4 sm:p-5 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d] to-transparent pt-6">
          {/* Total Display */}
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-gray-400 font-medium">ยอดรวม</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black text-white">
                ฿{(item.price * quantity).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`w-full py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] ${
              isAdding
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-brand-yellow via-yellow-400 to-amber-400 text-black shadow-xl shadow-brand-yellow/30 hover:shadow-brand-yellow/50 hover:scale-[1.02]'
            }`}
          >
            {isAdding ? (
              <>
                <div className="w-6 h-6 border-3 border-black/30 border-t-black rounded-full animate-spin" />
                กำลังเพิ่ม...
              </>
            ) : (
              <>
                <ShoppingBag className="w-6 h-6" />
                เพิ่มลงตะกร้า
                <span className="ml-1 opacity-70">({quantity})</span>
              </>
            )}
          </button>

          {/* Safe Area for Mobile */}
          <div className="h-safe-area-inset-bottom" />
        </div>
      </div>
    </div>
  );
}