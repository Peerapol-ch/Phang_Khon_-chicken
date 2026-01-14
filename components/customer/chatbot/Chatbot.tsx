"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, MapPin, Phone, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getRecommendedMenus } from "@/lib/chatbot/actions"; // We will create this

type MessageType = "text" | "carousel" | "action";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  description: string | null;
}

interface Message {
  id: string;
  sender: "user" | "bot";
  type: MessageType;
  content: string | React.ReactNode;
  data?: MenuItem[];
}

const QUICK_OPTIONS = [
  { label: "📖 เมนูแนะนำ", value: "recommend" },
  { label: "🚚 ตามออเดอร์", value: "tracking" },
  { label: "ℹ️ ข้อมูลร้าน", value: "info" },
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      type: "text",
      content:
        "สวัสดีครับ! ร้านไก่ย่างพังโคน ยินดีให้บริการ วันนี้รับอะไรดีครับ?",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Toggle body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  const addMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleOptionClick = async (
    optionValue: string,
    optionLabel: string
  ) => {
    // 1. User Message
    addMessage({
      id: Date.now().toString(),
      sender: "user",
      type: "text",
      content: optionLabel,
    });

    setIsTyping(true);

    // Simulate Network Delay
    setTimeout(async () => {
      let botResponse: Message | null = null;

      switch (optionValue) {
        case "recommend":
          // Ask for specific category
          botResponse = {
            id: Date.now().toString() + "_bot",
            sender: "bot",
            type: "text",
            content: (
              <div className="flex flex-col gap-2">
                <p>อยากทานแนวไหนดีครับ?</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    onClick={() =>
                      handleCategorySelect("เมนูส้มตำ", "🥗 ส้มตำ")
                    }
                    className="bg-brand-yellow/20 text-brand-yellow px-3 py-1.5 rounded-lg text-sm hover:bg-brand-yellow/30 transition-colors"
                  >
                    🥗 ส้มตำ
                  </button>
                  <button
                    onClick={() =>
                      handleCategorySelect("เมนูลาบ-ก้อย", "🥩 ลาบ-ก้อย")
                    }
                    className="bg-brand-yellow/20 text-brand-yellow px-3 py-1.5 rounded-lg text-sm hover:bg-brand-yellow/30 transition-colors"
                  >
                    🥩 ลาบ-ก้อย
                  </button>
                  <button
                    onClick={() =>
                      handleCategorySelect("เมนูลวกจิ้ม", "🍢 ลวกจิ้ม")
                    }
                    className="bg-brand-yellow/20 text-brand-yellow px-3 py-1.5 rounded-lg text-sm hover:bg-brand-yellow/30 transition-colors"
                  >
                    🍢 ลวกจิ้ม
                  </button>
                  <button
                    onClick={() => handleCategorySelect("เมนูต้ม", "🍲 ต้ม")}
                    className="bg-brand-yellow/20 text-brand-yellow px-3 py-1.5 rounded-lg text-sm hover:bg-brand-yellow/30 transition-colors"
                  >
                    🍲 ต้ม
                  </button>
                  <button
                    onClick={() => handleCategorySelect("เมนูยำ", "🌶️ ยำ")}
                    className="bg-brand-yellow/20 text-brand-yellow px-3 py-1.5 rounded-lg text-sm hover:bg-brand-yellow/30 transition-colors"
                  >
                    🌶️ ยำ
                  </button>
                  <button
                    onClick={() =>
                      handleCategorySelect("เมนูไก่", "🍗 เมนูไก่")
                    }
                    className="bg-brand-yellow/20 text-brand-yellow px-3 py-1.5 rounded-lg text-sm hover:bg-brand-yellow/30 transition-colors"
                  >
                    🍗 ไก่
                  </button>
                </div>
              </div>
            ),
          };
          break;

        case "tracking":
          botResponse = {
            id: Date.now().toString() + "_bot",
            sender: "bot",
            type: "action",
            content: "เช็คสถานะออเดอร์ล่าสุดได้ที่นี่เลยครับ 👇",
          };
          break;

        case "info":
          botResponse = {
            id: Date.now().toString() + "_bot",
            sender: "bot",
            type: "text",
            content: (
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-brand-yellow mt-0.5 shrink-0" />
                  <p>
                    ร้านไก่ย่างพังโคน 126/30 หมู่ 3 ต.บ่อวิน อ.ศรีราชา จ.ชลบุรี
                    20230
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-yellow shrink-0" />
                  <p>089-5710103</p>
                </div>
              </div>
            ),
          };
          break;

        default:
          botResponse = {
            id: Date.now().toString() + "_bot",
            sender: "bot",
            type: "text",
            content: "ขออภัยครับ ผมไม่เข้าใจคำสั่ง",
          };
      }

      if (botResponse) {
        addMessage(botResponse);
      }
      setIsTyping(false);
    }, 800);
  };

  const handleCategorySelect = async (
    categoryKeyword: string,
    label: string
  ) => {
    // User selected category
    addMessage({
      id: Date.now().toString(),
      sender: "user",
      type: "text",
      content: label,
    });

    setIsTyping(true);

    const items = await getRecommendedMenus(categoryKeyword); // Fetch from server

    setIsTyping(false);

    if (items.length > 0) {
      addMessage({
        id: Date.now().toString() + "_bot",
        sender: "bot",
        type: "carousel",
        content: "เมนูยอดฮิตตามนี้เลยครับ! 😋",
        data: items,
      });
    } else {
      addMessage({
        id: Date.now().toString() + "_bot",
        sender: "bot",
        type: "text",
        content: "ขออภัยครับ ไม่พบเมนูในหมวดนี้",
      });
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 z-40 flex items-center justify-center w-14 h-14 bg-brand-yellow rounded-full shadow-[0_4px_20px_rgba(251,191,36,0.4)] hover:scale-110 active:scale-95 transition-all animate-bounce-slow"
        >
          <div className="relative">
            <MessageCircle className="w-7 h-7 text-black" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-[#202020]" />
          </div>
        </button>
      )}

      {/* Backdrop */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity border-0 cursor-default"
          onClick={() => setIsOpen(false)}
          aria-label="Close chatbot"
        />
      )}

      {/* Chat Window */}
      <div
        className={`fixed z-50 bg-[#1a1a1a] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col
          bottom-0 left-0 right-0 rounded-t-3xl max-h-[85vh] h-[85vh]
          md:top-auto md:bottom-24 md:right-6 md:left-auto md:h-[600px] md:w-[380px] md:rounded-3xl border border-white/10
          ${
            isOpen
              ? "translate-y-0 md:translate-y-0"
              : "translate-y-full md:translate-y-[120%]"
          }`}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#202020] border-b border-white/10 flex justify-between items-center shrink-0 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-yellow p-1 shadow-inner">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                {/* Placeholder Avatar */}
                <span className="text-xl">🤖</span>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-none">
                ร้านไก่ย่างพังโคน
              </h2>
              <span className="text-xs text-brand-yellow flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span>Online</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "bot" && (
                <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center mr-2 shrink-0 mt-1">
                  <span className="text-sm">🤖</span>
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.sender === "user"
                    ? "bg-brand-yellow text-black rounded-tr-none"
                    : "bg-[#2a2a2a] text-white rounded-tl-none border border-white/5"
                }`}
              >
                {typeof msg.content === "string" ? (
                  <p className="whitespace-pre-line">{msg.content}</p>
                ) : (
                  msg.content
                )}

                {/* Carousel for Menu Items */}
                {msg.type === "carousel" && msg.data && (
                  <div className="mt-3 -mx-2 flex gap-3 overflow-x-auto pb-2 px-2 snap-x [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
                    {msg.data.map((item) => (
                      <div
                        key={item.id}
                        className="snap-center shrink-0 w-40 bg-[#151515] rounded-xl overflow-hidden border border-white/10"
                      >
                        <div className="aspect-square relative">
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-gray-500">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="font-bold text-white text-xs truncate">
                            {item.name}
                          </p>
                          <p className="text-brand-yellow text-xs font-bold mt-1">
                            {item.price} ฿
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Button for Tracking */}
                {msg.type === "action" && (
                  <div className="mt-2">
                    <Link
                      href="/orders_tracking"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 w-full bg-brand-yellow text-black font-bold py-2 rounded-lg hover:bg-yellow-400 transition-colors"
                    >
                      <Truck className="w-4 h-4" />
                      Track Order
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center mr-2 shrink-0">
                <span className="text-sm">🤖</span>
              </div>
              <div className="bg-[#2a2a2a] rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions (Footer) */}
        {!isTyping && (
          <div className="p-4 bg-[#202020] border-t border-white/10">
            <p className="text-xs text-gray-400 mb-2 px-1">เมนูยอดฮิต</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleOptionClick(opt.value, opt.label)}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm px-3 py-2 rounded-xl transition-all active:scale-95"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
