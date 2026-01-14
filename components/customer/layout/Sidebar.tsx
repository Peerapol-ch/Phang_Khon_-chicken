"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { X, Pen, Check, Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { Input } from "@/components/ui/Input";

interface Profile {
  id: string;
  avatar_url?: string;
  username?: string;
  points?: number;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: Readonly<SidebarProps>) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();

  // Edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile?.username) {
      setNewUsername(profile.username);
    }
  }, [profile]);

  // Prevent scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          setProfile(profile);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    if (isOpen) {
      getUser();
    }
  }, [isOpen]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    onClose();
    router.refresh();
  };

  const handleUpdateUsername = async () => {
    if (!user || !newUsername.trim()) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ username: newUsername })
        .eq("id", user.id);

      if (error) throw error;

      setProfile((prev) => (prev ? { ...prev, username: newUsername } : null));
      setIsEditingName(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating username:", error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;

    const file = e.target.files[0];
    setUploading(true);

    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profiles_avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("profiles_avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));
      router.refresh();
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      {/* Overlay */}
      <button
        type="button"
        className={`fixed inset-0 bg-black/5 z-[100] transition-opacity duration-300 w-full h-full border-0 cursor-default ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
        aria-label="Close sidebar overlay"
      />

      {/* Sidebar Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-brand-dark-red shadow-2xl z-[110] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>

          {/* User Icon */}
          <div className="flex flex-col items-center mt-8 mb-8">
            <div className="relative w-20 h-20">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              <button
                type="button"
                className="w-full h-full rounded-full overflow-hidden border-2 border-brand-yellow relative group cursor-pointer"
                onClick={() => {
                  if (user && !uploading) fileInputRef.current?.click();
                }}
              >
                <Image
                  src={profile?.avatar_url || "/images/usericon.png"}
                  alt="User"
                  fill
                  className="object-cover transition-opacity group-hover:opacity-75"
                />
                {user && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity bg-black/30">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                )}
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2 justify-center w-full px-4">
              {isEditingName ? (
                <div className="flex items-center gap-2 w-full max-w-[200px]">
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="h-7 text-sm bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    placeholder="Username"
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={handleUpdateUsername}
                      className="p-1 hover:bg-brand-yellow/20 rounded-full text-brand-yellow transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false);
                        setNewUsername(profile?.username || "");
                      }}
                      className="p-1 hover:bg-red-500/20 rounded-full text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-white font-medium truncate max-w-[150px]">
                    {profile?.username || user?.email?.split("@")[0] || "Guest"}
                  </p>
                  {user && (
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-white/70 hover:text-brand-yellow transition-colors"
                    >
                      <Pen className="w-3 h-3" />
                    </button>
                  )}
                </>
              )}
            </div>
            {user && (
              <p className="text-xs text-brand-yellow mt-1">
                {profile?.points || 0} Points
              </p>
            )}
          </div>

          {/* Menu Items */}
          <nav className="flex flex-col space-y-2">
            {user ? (
              <>
                <Link
                  href="/orders_tracking"
                  className="flex items-center px-4 py-3 text-white hover:bg-brand-yellow/10 hover:text-brand-yellow rounded-lg transition-colors"
                  onClick={onClose}
                >
                  <span className="font-medium">Order Tracking</span>
                </Link>
                <Link
                  href="/orders_history"
                  className="flex items-center px-4 py-3 text-white hover:bg-brand-yellow/10 hover:text-brand-yellow rounded-lg transition-colors"
                  onClick={onClose}
                >
                  <span className="font-medium">Order History</span>
                </Link>
                <Link
                  href="/favorites"
                  className="flex items-center px-4 py-3 text-white hover:bg-brand-yellow/10 hover:text-brand-yellow rounded-lg transition-colors"
                  onClick={onClose}
                >
                  <span className="font-medium">Favorites</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center px-4 py-3 text-white hover:bg-brand-yellow/10 hover:text-brand-yellow rounded-lg transition-colors"
                  onClick={onClose}
                >
                  <span className="font-medium">Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-3 text-red-500 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors w-full text-left mt-4 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                >
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="flex items-center px-4 py-3 text-white hover:bg-brand-yellow/10 hover:text-brand-yellow rounded-lg transition-colors"
                  onClick={onClose}
                >
                  <span className="font-medium">Login</span>
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="flex items-center px-4 py-3 text-white hover:bg-brand-yellow/10 hover:text-brand-yellow rounded-lg transition-colors"
                  onClick={onClose}
                >
                  <span className="font-medium">Register</span>
                </Link>
                <Link
                  href="/orders_tracking"
                  className="flex items-center px-4 py-3 text-white hover:bg-brand-yellow/10 hover:text-brand-yellow rounded-lg transition-colors"
                  onClick={onClose}
                >
                  <span className="font-medium">Order Tracking</span>
                </Link>
              </>
            )}

            <div className="h-px bg-white/10 my-2" />

            <Link
              href="/contact"
              className="flex items-center px-4 py-3 text-white hover:bg-brand-yellow/10 hover:text-brand-yellow rounded-lg transition-colors"
              onClick={onClose}
            >
              <span className="font-medium">Contact</span>
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
