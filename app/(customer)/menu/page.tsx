import { getCategories, getMenuItems } from "@/lib/menu/data";
import MenuClient from "@/components/customer/menu/MenuClient";

export const revalidate = 0;

export default async function MenuPage(
  props: Readonly<{ searchParams: Promise<{ [key: string]: string | string[] | undefined }> }>
) {
  const searchParams = await props.searchParams;
  const q = searchParams.q;
  const query = typeof q === "string" ? q : undefined;

  const categories = await getCategories();
  const menuItems = await getMenuItems(query);

  return (
    <MenuClient categories={categories || []} menuItems={menuItems || []} />
  );
}
