"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { X, Heart } from "lucide-react";
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
      checkFavoriteStatus();
    }
  }, [isOpen, item, checkFavoriteStatus]);

  if (!isOpen || !item) return null;

  const handleAddToCart = () => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: quantity,
      image: item.image_url,
      note: note,
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
        // Remove from favorites
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("menu_item_id", item.id);

        if (error) throw error;
        setIsFavorite(false);
        toast.success("ลบออกจากรายการโปรดเรียบร้อยแล้ว");
      } else {
        // Add to favorites
        const { error } = await supabase.from("favorites").insert({
          user_id: user.id,
          menu_item_id: item.id,
        });

        if (error) throw error;
        setIsFavorite(true);
        toast.success("เพิ่มรายการโปรดเรียบร้อยแล้ว");
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#202020] rounded-2xl shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-white hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Header */}
        <div className="relative h-48 w-full">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#202020] to-transparent"></div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{item.name}</h2>
            <p className="text-brand-yellow text-xl font-bold">
              {item.price} ฿
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between bg-black/30 p-3 rounded-xl">
            <span className="text-gray-300 font-medium">Quantity</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                -
              </button>
              <span className="text-xl font-bold text-white w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-brand-yellow text-black hover:bg-brand-yellow/80 flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Note Input */}
          <div className="space-y-2">
            <label
              htmlFor="note-input"
              className="text-sm text-gray-400 font-medium"
            >
              Special Instructions (Optional)
            </label>
            <textarea
              id="note-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="E.g., No onions, extra spicy..."
              className="w-full h-24 bg-black/30 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow resize-none"
            />
          </div>

          {/* Add Button */}
          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={handleAddToCart}
              className="col-span-3 w-full py-4 bg-brand-yellow text-black font-bold text-lg rounded-xl hover:bg-white transition-all active:scale-95 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
            >
              Add to Cart - {(item.price * quantity).toFixed(2)} ฿
            </button>
            <button
              onClick={handleAddToFavorite}
              className="col-span-1 w-full py-4 bg-pink-500 text-black font-bold text-lg rounded-xl hover:bg-white transition-all active:scale-95 shadow-[0_0_20px_rgba(236,72,153,0.3)] flex items-center justify-center"
            >
              <Heart
                className={`w-6 h-6 transition-all ${
                  isFavorite ? "fill-black" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
