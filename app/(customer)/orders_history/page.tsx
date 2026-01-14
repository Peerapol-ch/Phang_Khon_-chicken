import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OrdersList from "@/components/customer/orders/OrdersList";

export default async function OrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch orders with items
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        *,
        menu_items (name, image_url)
      )
    `
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", JSON.stringify(error, null, 2));
    return <div>Error loading orders</div>;
  }

  return <OrdersList orders={orders || []} />;
}
