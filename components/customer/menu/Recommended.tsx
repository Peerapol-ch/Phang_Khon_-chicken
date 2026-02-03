"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AddToCartModal, {
  MenuItem as CartMenuItem,
} from "../cart/AddToCartModal";
import { useCart } from "@/context/CartContext";
import { 
  Plus, 
  Minus,
  Star, 
  Flame, 
  Clock, 
  Heart,
  ShoppingCart,
  Sparkles,
  Check
} from "lucide-react";
import { toast } from "sonner";

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
  const { addToCart } = useCart();
  const [selectedItem, setSelectedItem] = useState<CartMenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());
  
  // ✅ Quick Add State
  const [quickAddId, setQuickAddId] = useState<number | null>(null);
  const [quickAddQty, setQuickAddQty] = useState(1);
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set());

  // ✅ Close quick add when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (quickAddId !== null) {
        setQuickAddId(null);
        setQuickAddQty(1);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [quickAddId]);

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
        toast.success("ลบออกจากรายการโปรด", { icon: '💔' });
      } else {
        newSet.add(itemId);
        toast.success("เพิ่มในรายการโปรด", { icon: '❤️' });
      }
      return newSet;
    });
  };

  // ✅ Quick Add Functions
  const handleQuickAddClick = (e: React.MouseEvent, itemId: number) => {
    e.stopPropagation();
    if (quickAddId === itemId) {
      setQuickAddId(null);
      setQuickAddQty(1);
    } else {
      setQuickAddId(itemId);
      setQuickAddQty(1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickAddQty(prev => prev + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickAddQty(prev => Math.max(1, prev - 1));
  };

  const handleConfirmAdd = (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: quickAddQty,
      image: item.image_url || item.image || null,
      note: "",
    });
    
    // Show success animation
    setAddedItems(prev => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }, 1500);
    
    toast.success(`เพิ่ม ${item.name} x${quickAddQty}`, { icon: '🛒' });
    
    setQuickAddId(null);
    setQuickAddQty(1);
  };

  return (
    <>
      {/* ✅ Section Header */}
      {title && (
        <div className="flex items-center justify-between px-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-7 bg-gradient-to-b from-brand-yellow via-amber-500 to-orange-500 rounded-full" />
            <h2 className="text-xl sm:text-2xl font-black text-white">{title}</h2>
            <Sparkles className="w-5 h-5 text-brand-yellow animate-pulse" />
          </div>
          <span className="text-xs sm:text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full">
            {menuItems.length} รายการ
          </span>
        </div>
      )}

      {/* ✅ Horizontal Scroll for Mobile */}
      <div className="relative">
        <div className="flex gap-3 px-4 pb-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
          {menuItems.map((item, index) => {
            const isLiked = likedItems.has(item.id);
            const isQuickAdd = quickAddId === item.id;
            const isAdded = addedItems.has(item.id);
            
            return (
              <div
                key={item.id}
                className="snap-start shrink-0 w-[160px] sm:w-[200px]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`relative w-full overflow-hidden rounded-2xl cursor-pointer group bg-gradient-to-b from-[#252525] to-[#1a1a1a] border transition-all duration-300 ${
                    isQuickAdd 
                      ? 'border-brand-yellow shadow-lg shadow-brand-yellow/20 scale-[1.02]' 
                      : 'border-white/5 hover:border-brand-yellow/30'
                  } ${isAdded ? 'ring-2 ring-emerald-500' : ''}`}
                  onClick={() => !isQuickAdd && handleOpenModal(item)}
                >
                  {/* ✅ Image */}
                  <div className="relative aspect-square overflow-hidden">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className={`object-cover transition-all duration-500 ${
                          isQuickAdd ? 'scale-110 brightness-75' : 'group-hover:scale-105'
                        }`}
                        sizes="200px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                        <span className="text-5xl">🍽️</span>
                      </div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity ${
                      isQuickAdd ? 'opacity-90' : 'opacity-70'
                    }`} />

                    {/* ✅ Success Animation */}
                    {isAdded && (
                      <div className="absolute inset-0 bg-emerald-500/80 flex items-center justify-center animate-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                          <Check className="w-10 h-10 text-emerald-500" strokeWidth={3} />
                        </div>
                      </div>
                    )}

                    {/* ✅ Badges */}
                    {showBadges && !isQuickAdd && (
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {item.is_popular && (
                          <span className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                            <Flame className="w-3 h-3" />
                            ขายดี
                          </span>
                        )}
                        {item.is_new && (
                          <span className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                            <Star className="w-3 h-3" />
                            ใหม่
                          </span>
                        )}
                      </div>
                    )}

                    {/* ✅ Like Button */}
                    {!isQuickAdd && (
                      <button
                        onClick={(e) => handleQuickLike(e, item.id)}
                        className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                          isLiked 
                            ? 'bg-pink-500 shadow-lg shadow-pink-500/50' 
                            : 'bg-black/40 backdrop-blur-sm'
                        }`}
                      >
                        <Heart className={`w-4 h-4 text-white ${isLiked ? 'fill-current' : ''}`} />
                      </button>
                    )}

                    {/* ✅ Prep Time */}
                    {item.prep_time && !isQuickAdd && (
                      <div className="absolute bottom-14 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        {item.prep_time}น.
                      </div>
                    )}

                    {/* ✅ Quick Add Panel */}
                    {isQuickAdd && (
                      <div 
                        className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black via-black/95 to-transparent animate-in slide-in-from-bottom duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p className="text-white font-bold text-sm text-center mb-3 line-clamp-1">
                          {item.name}
                        </p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <button
                            onClick={handleDecrement}
                            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition-all active:scale-90"
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                          <span className="w-12 text-center text-2xl font-black text-white">
                            {quickAddQty}
                          </span>
                          <button
                            onClick={handleIncrement}
                            className="w-10 h-10 bg-brand-yellow hover:bg-yellow-400 rounded-xl flex items-center justify-center text-black transition-all active:scale-90"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                        
                        {/* Price & Confirm */}
                        <button
                          onClick={(e) => handleConfirmAdd(e, item)}
                          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          <span>฿{(item.price * quickAddQty).toLocaleString()}</span>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* ✅ Content */}
                  {!isQuickAdd && (
                    <div className="p-3">
                      <h3 className="text-sm font-bold text-white line-clamp-2 mb-2 min-h-[2.5rem] group-hover:text-brand-yellow transition-colors">
                        {item.name}
                      </h3>

                      <div className="flex justify-between items-center">
                        <span className="text-brand-yellow text-lg font-black">
                          ฿{item.price.toLocaleString()}
                        </span>

                        {/* ✅ Add Button */}
                        <button
                          onClick={(e) => handleQuickAddClick(e, item.id)}
                          className="relative w-10 h-10 bg-gradient-to-br from-brand-yellow to-amber-500 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                        >
                          <Plus className="w-6 h-6 text-black" strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ✅ Scroll Indicator */}
        {menuItems.length > 2 && (
          <div className="flex justify-center gap-1 mt-2">
            {Array.from({ length: Math.min(5, Math.ceil(menuItems.length / 2)) }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/20" />
            ))}
          </div>
        )}
      </div>

      {/* ✅ Grid View for larger content (optional - below scroll) */}
      {menuItems.length > 6 && (
        <div className="mt-6 px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {menuItems.slice(6).map((item) => {
              const isLiked = likedItems.has(item.id);
              
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleOpenModal(item)}
                  className="relative bg-gradient-to-b from-[#252525] to-[#1a1a1a] rounded-2xl overflow-hidden border border-white/5 hover:border-brand-yellow/30 transition-all text-left active:scale-[0.98]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <span className="text-3xl">🍽️</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    
                    {/* Like */}
                    <button
                      onClick={(e) => handleQuickLike(e, item.id)}
                      className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center ${
                        isLiked ? 'bg-pink-500' : 'bg-black/40'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 text-white ${isLiked ? 'fill-current' : ''}`} />
                    </button>

                    {/* Price */}
                    <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded">
                      <span className="text-brand-yellow font-bold text-sm">
                        ฿{item.price}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-2.5">
                    <h3 className="text-xs font-bold text-white line-clamp-2 min-h-[2rem]">
                      {item.name}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ✅ Empty State */}
      {menuItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">🍽️</span>
          </div>
          <p className="text-lg font-bold text-white mb-1">ไม่พบเมนู</p>
          <p className="text-sm text-gray-500 text-center">ลองค้นหาด้วยคำอื่น</p>
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