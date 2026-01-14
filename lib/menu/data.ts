// ฟังก์ชันดึงข้อมูล: getCategories, getMenuItems
// lib/menu/data.ts
import { createClient } from "../supabase/server";

// ฟังก์ชันดึงหมวดหมู่
export async function getCategories() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return categories;
}

// ฟังก์ชันดึงเมนูทั้งหมด พร้อมหมวดหมู่
export async function getMenuItems(query?: string) {
  const supabase = await createClient();

  let queryBuilder = supabase
    .from("menu_items")
    .select(
      `
      *,
      categories (name)
    `
    )
    .eq("is_available", true);

  if (query) {
    const cleanQuery = decodeURIComponent(query).trim().replaceAll(/\s+/g, " ");
    if (cleanQuery) {
      const searchPattern = `%${cleanQuery}%`;
      // Search in name OR description
      queryBuilder = queryBuilder.or(
        `name.ilike.${searchPattern},description.ilike.${searchPattern}`
      );
    }
  }

  const { data: menu_items, error } = await queryBuilder.order("id", {
    ascending: true,
  });

  if (error) {
    console.error("Error fetching menu items:", error);
    return [];
  }

  return menu_items;
}

// ฟังก์ชันดึงเมนูตามหมวดหมู่และจำกัดจำนวน
export async function getMenuItemsByCategory() {
  const supabase = await createClient();

  const { data: menu_items, error } = await supabase
    .from("menu_items")
    .select(
      `
      *
    `
    )
    .eq("is_available", true)
    .eq("is_recommended", true)
    .order("id", { ascending: true });

  if (error) {
    console.error(`Error fetching menu items for category:`, error);
    return [];
  }
  return menu_items;
}
