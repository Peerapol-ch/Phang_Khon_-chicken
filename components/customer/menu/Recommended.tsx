"use client";

import { useState } from "react";
import Image from "next/image";
import AddToCartModal, {
  MenuItem as CartMenuItem,
} from "../cart/AddToCartModal";
import { Plus } from "lucide-react";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  image?: string | null;
}

interface RecommendedProps {
  menuItems: MenuItem[];
}

export default function Recommended({ menuItems }: Readonly<RecommendedProps>) {
  const [selectedItem, setSelectedItem] = useState<CartMenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (item: MenuItem) => {
    // Map item to match AddToCartModal expectation if needed
    // AddToCartModal expects: id, name, price, image
    // page.tsx items have: image_url
    const mappedItem: CartMenuItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: (item.image_url || item.image) ?? null,
    };

    setSelectedItem(mappedItem);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4 px-4">
        {menuItems.map((item) => (
          <button
            type="button"
            key={item.id}
            className="relative w-full overflow-hidden rounded-xl cursor-pointer group shadow-md bg-[#202020] focus:outline-none focus:ring-2 focus:ring-brand-yellow text-left"
            onClick={() => handleOpenModal(item)}
          >
            <div className="relative aspect-square">
              {item.image_url && (
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none"></div>
            </div>
            <div className="absolute bottom-0 left-0 w-full p-3">
              <p className="text-sm sm:text-base font-bold leading-tight line-clamp-2 drop-shadow-md text-white">
                {item.name}
              </p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-brand-yellow text-sm font-bold">
                  {item.price} ฿
                </p>
                <div className="bg-brand-yellow rounded-full p-1">
                  <Plus className="w-4 h-4 text-black" />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      <AddToCartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
      />
    </>
  );
}
