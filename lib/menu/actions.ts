// สำหรับการค้นหาเมนูในหน้า menu ช่อง searchbar
"use server";

import { createClient } from "../supabase/server";

export async function getSearchSuggestions(query: string) {
  if (!query || query.length < 2) return [];

  const supabase = await createClient();
  const cleanQuery = decodeURIComponent(query).trim().replaceAll(/\s+/g, " ");
  const searchPattern = `%${cleanQuery}%`;

  const { data, error } = await supabase
    .from("menu_items")
    .select("id, name, image_url, price")
    .eq("is_available", true)
    .or(`name.ilike.${searchPattern},description.ilike.${searchPattern}`)
    .limit(50);

  if (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }

  return data;
}
