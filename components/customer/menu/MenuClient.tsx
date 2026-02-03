"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import MenuNavbar from "@/components/customer/layout/MenuNavbar";
import AddToCartModal from "../cart/AddToCartModal";
import { 
  Plus, 
  Minus, 
  LayoutGrid, 
  List, 
  Heart, 
  Clock, 
  Flame,
  Star,
  ShoppingCart,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: number;
  name: string;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  category_id: number;
  description?: string;
  is_popular?: boolean;
  is_new?: boolean;
  prep_time?: number;
  categories?: {
    name: string;
  };
}

interface MenuClientProps {
  categories: Category[];
  menuItems: MenuItem[];
}

export default function MenuClient({
  categories,
  menuItems,
}: Readonly<MenuClientProps>) {
  const [activeCategory, setActiveCategory] = useState<number>(
    categories[0]?.id || 0
  );
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // ✅ View Mode State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // ✅ Quick Add State
  const [quickAddQuantities, setQuickAddQuantities] = useState<Record<number, number>>({});
  
  // ✅ Liked Items
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());
  
  // ✅ Show Scroll to Top
  const [showScrollTop, setShowScrollTop] = useState(false);

  // ✅ Auto detect view mode based on screen size
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setViewMode(isMobile ? 'list' : 'grid');
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenModal = (item: MenuItem) => {
    setSelectedItem(item);
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
  const handleQuickAdd = (e: React.MouseEvent, itemId: number) => {
    e.stopPropagation();
    setQuickAddQuantities(prev => ({ ...prev, [itemId]: 1 }));
  };

  const handleIncrement = (e: React.MouseEvent, itemId: number) => {
    e.stopPropagation();
    setQuickAddQuantities(prev => ({ 
      ...prev, 
      [itemId]: (prev[itemId] || 0) + 1 
    }));
  };

  const handleDecrement = (e: React.MouseEvent, itemId: number) => {
    e.stopPropagation();
    setQuickAddQuantities(prev => {
      const newQty = (prev[itemId] || 0) - 1;
      if (newQty <= 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: newQty };
    });
  };

  const handleAddToCart = (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    const qty = quickAddQuantities[item.id] || 1;
    // TODO: Add to cart logic here
    toast.success(`เพิ่ม ${item.name} x${qty} ลงตะกร้าแล้ว`, { icon: '🛒' });
    setQuickAddQuantities(prev => {
      const { [item.id]: _, ...rest } = prev;
      return rest;
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = Number(entry.target.id.replace("category-", ""));
            if (!Number.isNaN(id)) {
              setActiveCategory(id);
            }
          }
        });
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      }
    );

    categories.forEach((category) => {
      const element = document.getElementById(`category-${category.id}`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [categories]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="relative w-full min-h-screen bg-brand-dark-red/50 backdrop-blur-sm text-white rounded-lg">
        <MenuNavbar
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={(id: number) => {
            setActiveCategory(id);
            const element = document.getElementById(`category-${id}`);
            if (element) {
              const isMobile = window.innerWidth < 768;
              const headerOffset = isMobile ? 140 : 180;
              
              const elementPosition = element.getBoundingClientRect().top;
              const offsetPosition =
                elementPosition + window.pageYOffset - headerOffset;

              window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
              });
            }
          }}
        />

        {/* Menu Content */}
        <main className="relative max-w-7xl mx-auto px-3 py-2 space-y-6 md:px-4 md:space-y-10 pb-24">
          {categories.map((category) => {
            const categoryItems = menuItems.filter(
              (item) => item.category_id === category.id
            );

            if (categoryItems.length === 0) return null;

            return (
              <section
                key={category.id}
                id={`category-${category.id}`}
              >
                {/* ✅ Category Header with View Toggle */}
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-brand-yellow to-amber-600 rounded-full" />
                    <h2 className="text-lg md:text-2xl font-black text-brand-yellow">
                      {category.name}
                    </h2>
                    <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded-full">
                      {categoryItems.length}
                    </span>
                  </div>
                  
                  {/* ✅ View Toggle */}
                  <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/10">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 sm:p-2 rounded-lg transition-all ${
                        viewMode === 'grid' 
                          ? 'bg-brand-yellow text-black shadow-md' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                      aria-label="Grid view"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 sm:p-2 rounded-lg transition-all ${
                        viewMode === 'list' 
                          ? 'bg-brand-yellow text-black shadow-md' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                      aria-label="List view"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* ✅ Grid View */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {categoryItems.map((item) => {
                      const isLiked = likedItems.has(item.id);
                      
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleOpenModal(item)}
                          className="relative bg-gradient-to-b from-[#252525] to-[#1a1a1a] rounded-2xl overflow-hidden shadow-lg group hover:ring-2 hover:ring-brand-yellow/50 transition-all flex flex-col text-left focus:outline-none focus:ring-2 focus:ring-brand-yellow active:scale-[0.98]"
                        >
                          {/* Image */}
                          <div className="relative aspect-[4/3] w-full overflow-hidden">
                            {item.image_url ? (
                              <Image
                                src={item.image_url}
                                alt={item.name}
                                fill
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                                <span className="text-4xl">🍽️</span>
                              </div>
                            )}
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                            {/* Badges */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                              {item.is_popular && (
                                <span className="flex items-center gap-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                  <Flame className="w-2.5 h-2.5" />
                                  ขายดี
                                </span>
                              )}
                              {item.is_new && (
                                <span className="flex items-center gap-0.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                  <Star className="w-2.5 h-2.5" />
                                  ใหม่
                                </span>
                              )}
                            </div>

                            {/* Like Button */}
                            <button
                              onClick={(e) => handleQuickLike(e, item.id)}
                              className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                                isLiked 
                                  ? 'bg-pink-500 shadow-lg shadow-pink-500/50' 
                                  : 'bg-black/50 backdrop-blur-sm'
                              }`}
                            >
                              <Heart className={`w-4 h-4 text-white ${isLiked ? 'fill-current' : ''}`} />
                            </button>

                            {/* Price Badge */}
                            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                              <span className="text-brand-yellow font-black text-sm">
                                ฿{item.price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="p-3 flex-1 flex flex-col justify-between">
                            <h3 className="text-sm md:text-base font-bold line-clamp-2 text-white group-hover:text-brand-yellow transition-colors mb-2">
                              {item.name}
                            </h3>
                            
                            <div className="flex justify-end">
                              <div className="w-9 h-9 bg-gradient-to-br from-brand-yellow to-amber-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-90 transition-all">
                                <Plus className="w-5 h-5 text-black" strokeWidth={3} />
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* ✅ List View */}
                {viewMode === 'list' && (
                  <div className="flex flex-col gap-3">
                    {categoryItems.map((item) => {
                      const isLiked = likedItems.has(item.id);
                      const quantity = quickAddQuantities[item.id] || 0;
                      
                      return (
                        <div
                          key={item.id}
                          className="group relative flex gap-3 p-3 bg-gradient-to-r from-[#1e1e1e] to-[#252525] rounded-2xl border border-white/5 hover:border-brand-yellow/20 transition-all"
                        >
                          {/* Image */}
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                          >
                            {item.image_url ? (
                              <Image
                                src={item.image_url}
                                alt={item.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                sizes="112px"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                                <span className="text-3xl">🍽️</span>
                              </div>
                            )}

                            {/* Badges */}
                            {item.is_popular && (
                              <div className="absolute top-1 left-1">
                                <span className="flex items-center gap-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                  <Flame className="w-2.5 h-2.5" />
                                </span>
                              </div>
                            )}

                            {/* Like Button */}
                            <button
                              onClick={(e) => handleQuickLike(e, item.id)}
                              className={`absolute top-1 right-1 w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                                isLiked ? 'bg-pink-500' : 'bg-black/50 backdrop-blur-sm'
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 text-white ${isLiked ? 'fill-current' : ''}`} />
                            </button>
                          </button>

                          {/* Content */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <div>
                              <button
                                onClick={() => handleOpenModal(item)}
                                className="text-left w-full focus:outline-none"
                              >
                                <h3 className="font-bold text-white text-base leading-tight line-clamp-1 group-hover:text-brand-yellow transition-colors">
                                  {item.name}
                                </h3>
                              </button>
                              
                              {item.description && (
                                <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                                  {item.description}
                                </p>
                              )}

                              {item.prep_time && (
                                <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{item.prep_time} นาที</span>
                                </div>
                              )}
                            </div>

                            {/* Bottom: Price & Actions */}
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-brand-yellow text-xl font-black">
                                ฿{item.price.toLocaleString()}
                              </span>

                              {/* Quick Add Controls */}
                              <div className="flex items-center gap-2">
                                {quantity > 0 ? (
                                  <>
                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1">
                                      <button
                                        onClick={(e) => handleDecrement(e, item.id)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-red-500/20 text-white transition-all active:scale-90"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </button>
                                      <span className="w-8 text-center font-black text-white">
                                        {quantity}
                                      </span>
                                      <button
                                        onClick={(e) => handleIncrement(e, item.id)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-yellow text-black transition-all active:scale-90"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    </div>

                                    {/* Confirm Button */}
                                    <button
                                      onClick={(e) => handleAddToCart(e, item)}
                                      className="h-8 px-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-sm rounded-xl flex items-center gap-1 shadow-lg active:scale-95"
                                    >
                                      <ShoppingCart className="w-4 h-4" />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={(e) => handleQuickAdd(e, item.id)}
                                    className="flex items-center gap-2 h-10 px-4 bg-gradient-to-r from-brand-yellow to-amber-500 rounded-xl font-bold text-black shadow-lg hover:scale-105 active:scale-95 transition-all"
                                  >
                                    <Plus className="w-5 h-5" strokeWidth={3} />
                                    <span className="text-sm">เพิ่ม</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </main>
      </div>

      {/* ✅ Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 z-40 w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-white/20 transition-all animate-in slide-in-from-bottom-4 active:scale-90"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}

      {/* Modal */}
      <AddToCartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
      />
    </div>
  );
}