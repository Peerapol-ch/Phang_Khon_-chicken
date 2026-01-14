"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import MenuNavbar from "@/components/customer/layout/MenuNavbar";
import AddToCartModal from "../cart/AddToCartModal";
import { Plus } from "lucide-react";

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

  const handleOpenModal = (item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
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
              // ปรับ offset ตามขนาดหน้าจอ (มือถือ header เล็กกว่า)
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
        <main className="relative max-w-7xl mx-auto px-3 py-2 space-y-8 md:px-4 md:space-y-12">
          {categories.map((category) => {
            const categoryItems = menuItems.filter(
              (item) => item.category_id === category.id
            );

            if (categoryItems.length === 0) return null;

            return (
              <section
                key={category.id}
                id={`category-${category.id}`}
                className=""
              >
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-brand-yellow border-b border-gray-700 pb-2">
                  {category.name}
                </h2>
                
                {/* --- จุดที่แก้ไขหลัก --- */}
                {/* เปลี่ยน grid-cols-1 เป็น grid-cols-2 ตั้งแต่เริ่ม และลด gap เหลือ gap-3 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-black/40 rounded-xl md:rounded-2xl overflow-hidden shadow-lg group hover:ring-2 hover:ring-brand-yellow/50 transition-all flex flex-col"
                    >
                      <div className="relative aspect-[4/3] w-full">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-400 text-xs md:text-base">No Image</span>
                          </div>
                        )}
                      </div>
                      
                      {/* ปรับ Padding ให้อนุรักษ์พื้นที่บนมือถือ */}
                      <div className="p-3 md:p-4 z-20 flex flex-col flex-grow justify-between">
                        {/* ปรับขนาดตัวอักษรชื่ออาหารให้อ่านง่ายในช่องแคบๆ */}
                        <h3 className="relative text-sm md:text-lg font-semibold line-clamp-2 md:line-clamp-1 z-20 mb-1 h-10 md:h-auto">
                          {item.name}
                        </h3>
                        
                        <div className="flex justify-between items-end mt-auto">
                          {/* ปรับขนาดราคา */}
                          <span className="text-brand-yellow text-base md:text-lg font-bold">
                            {item.price} ฿
                          </span>
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="bg-brand-yellow text-black p-1.5 md:p-2 rounded-lg hover:bg-white transition-colors shrink-0"
                          >
                            {/* ปรับขนาดไอคอนบวกให้เล็กลงนิดหน่อยบนมือถือ */}
                            <Plus className="w-5 h-5 md:w-6 md:h-6" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </main>
      </div>
      <AddToCartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
      />
    </div>
  );
}