"use client";

import { useState } from "react";
import Image from "next/image";
import AddToCartModal, {
  MenuItem as CartMenuItem,
} from "../cart/AddToCartModal";
import { Plus, Star, Flame, Clock, Heart } from "lucide-react";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  image?: string | null;
  description?: string;
  is_popular?: boolean;
  is_new?: boolean;
  prep_time?: number;
}

interface RecommendedProps {
  menuItems: MenuItem[];
  title?: string;
  showBadges?: boolean;
}

export default function Recommended({ 
  menuItems, 
  title = "เมนูแนะนำ",
  showBadges = true 
}: Readonly<RecommendedProps>) {
  const [selectedItem, setSelectedItem] = useState<CartMenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());

  const handleOpenModal = (item: MenuItem) => {
    const mappedItem: CartMenuItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: (item.image_url || item.image) ?? null,
      description: item.description,
    };

    setSelectedItem(mappedItem);
    setIsModalOpen(true);
  };

  const handleQuickLike = (e: React.MouseEvent, itemId: number) => {
    e.stopPropagation();
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  return (
    <>
      {/* ✅ Section Header */}
      {title && (
        <div className="flex items-center justify-between px-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-brand-yellow to-amber-600 rounded-full" />
            <h2 className="text-xl sm:text-2xl font-black text-white">{title}</h2>
            <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
          </div>
          <span className="text-sm text-gray-400">{menuItems.length} รายการ</span>
        </div>
      )}

      {/* ✅ Grid - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 px-4">
        {menuItems.map((item, index) => {
          const isLiked = likedItems.has(item.id);
          
          return (
            <button
              type="button"
              key={item.id}
              className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer group bg-gradient-to-b from-[#252525] to-[#1a1a1a] border border-white/5 hover:border-brand-yellow/30 focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-yellow/10 active:scale-[0.98]"
              onClick={() => handleOpenModal(item)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* ✅ Image Container */}
              <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                    <span className="text-4xl sm:text-5xl">🍽️</span>
                  </div>
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />

                {/* ✅ Badges */}
                {showBadges && (
                  <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                    {item.is_popular && (
                      <span className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                        <Flame className="w-3 h-3" />
                        ขายดี
                      </span>
                    )}
                    {item.is_new && (
                      <span className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                        <Star className="w-3 h-3" />
                        ใหม่
                      </span>
                    )}
                  </div>
                )}

                {/* ✅ Like Button */}
                <button
                  onClick={(e) => handleQuickLike(e, item.id)}
                  className={`absolute top-2 right-2 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 ${
                    isLiked 
                      ? 'bg-pink-500 shadow-lg shadow-pink-500/50' 
                      : 'bg-black/50 backdrop-blur-sm hover:bg-pink-500/30'
                  }`}
                >
                  <Heart className={`w-4 h-4 sm:w-5 sm:h-5 text-white transition-all ${isLiked ? 'fill-current scale-110' : ''}`} />
                </button>

                {/* ✅ Prep Time Badge */}
                {item.prep_time && (
                  <div className="absolute bottom-12 sm:bottom-14 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[10px] sm:text-xs px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    {item.prep_time} นาที
                  </div>
                )}
              </div>

              {/* ✅ Content */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                {/* Name */}
                <h3 className="text-sm sm:text-base font-bold leading-tight line-clamp-2 text-white drop-shadow-lg mb-2 group-hover:text-brand-yellow transition-colors">
                  {item.name}
                </h3>

                {/* Price & Add Button Row */}
                <div className="flex justify-between items-center">
                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-brand-yellow text-base sm:text-lg font-black">
                      ฿{item.price.toLocaleString()}
                    </span>
                  </div>

                  {/* ✅ Add Button - ใหญ่ขึ้นสำหรับ touch */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-brand-yellow rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity" />
                    <div className="relative w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-brand-yellow to-amber-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-90 transition-all duration-300">
                      <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-black" strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ Hover Glow Effect */}
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl ring-2 ring-brand-yellow/0 group-hover:ring-brand-yellow/30 transition-all pointer-events-none" />
            </button>
          );
        })}
      </div>

      {/* ✅ Empty State */}
      {menuItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <span className="text-5xl">🍽️</span>
          </div>
          <p className="text-xl font-bold text-white mb-2">ไม่พบเมนู</p>
          <p className="text-gray-500 text-center">ลองค้นหาด้วยคำอื่นหรือเลือกหมวดหมู่อื่น</p>
        </div>
      )}

      {/* Modal */}
      <AddToCartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
      />
    </>
  );
}