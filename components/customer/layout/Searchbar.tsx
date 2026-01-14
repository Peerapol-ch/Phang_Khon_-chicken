"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import Image from "next/image";
import { getSearchSuggestions } from "@/lib/menu/actions";

interface SearchSuggestion {
  id: number;
  name: string;
  image_url: string | null;
  price: number;
}

export default function Searchbar() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleClearSearch = () => {
    setSearch("");
    setShowSuggestions(false);
    router.push(`/menu`);
  };

  useEffect(() => {
    let isMounted = true;

    const timer = setTimeout(async () => {
      if (search.length >= 2) {
        try {
          const results = await getSearchSuggestions(search);
          if (isMounted) {
            setSuggestions(results || []);
            if (document.activeElement === inputRef.current) {
              setShowSuggestions(true);
            }
          }
        } catch (error) {
          if (isMounted) console.error("Error fetching suggestions:", error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    router.push(`/menu?q=${encodeURIComponent(search)}`);
  };

  const handleSuggestionClick = (name: string) => {
    setSearch(name);
    setShowSuggestions(false);
    router.push(`/menu?q=${encodeURIComponent(name)}`);
  };

  return (
    <div className="relative flex-1 w-full mx-2 sm:mx-4 z-50">
      <form onSubmit={handleSubmit} className="flex items-center w-full">
        <div className="relative w-full mr-2">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => {
              if (search.length >= 2 && suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            // Delay hiding to allow click event on suggestions
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search..."
            className="border border-white rounded-md pl-2 pr-8 py-1 w-full bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-yellow text-white font-medium transition-colors hover:bg-white/10"
          />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="bg-transparent border border-white transition hover:bg-brand-yellow/80 text-white font-medium py-[4px] px-2 sm:px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow active:scale-95 flex items-center gap-2 shrink-0"
        >
          <Search className="w-6 h-6" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg overflow-hidden border border-gray-200">
          <div className="max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
            {suggestions.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => handleSuggestionClick(item.name)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3 text-gray-800 transition-colors focus:outline-none focus:bg-gray-100"
              >
                {item.image_url && (
                  <div className="relative w-8 h-8 rounded overflow-hidden shrink-0">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{item.name}</span>
                  <span className="text-xs text-gray-500">{item.price} ฿</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
