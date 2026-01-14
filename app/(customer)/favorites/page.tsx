import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FavoritesClient from "@/components/customer/favorites/FavoritesClient";
import { MenuItem } from "@/components/customer/cart/AddToCartModal";

export default async function FavoritesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch favorites with related menu items
  const { data: favorites, error } = await supabase
    .from("favorites")
    .select(
      `
      menu_item_id,
      menu_items (*)
    `
    )
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching favorites:", error);
    return <div>Error loading favorites</div>;
  }

  // Transform data to match MenuItem interface expected by Client
  const formattedFavorites = favorites
    .map((item) => item.menu_items)
    .filter((item) => item !== null) as unknown as MenuItem[];

  return <FavoritesClient initialFavorites={formattedFavorites} />;
}
