"use server";

import { createClient } from "@/lib/supabase/server";

export async function getRecommendedMenus(categoryKeyword: string) {
  const supabase = await createClient();

  // Use the RPC function to get best-selling items by category
  const { data: menuItems, error } = await supabase.rpc(
    "get_best_selling_menu_items",
    {
      category_keyword: categoryKeyword,
    }
  );

  if (error) {
    console.error("Error fetching chatbot menu:", error);
    return [];
  }

  return menuItems || [];
}
