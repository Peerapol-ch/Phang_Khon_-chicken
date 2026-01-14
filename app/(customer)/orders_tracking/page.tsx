import { createClient } from "@/lib/supabase/server";
import OrderTrackingClient from "@/components/customer/orders/OrderTrackingClient";
import { cookies } from "next/headers";

export default async function OrderTrackingPage() {
  const supabase = await createClient();

  const cookieStore = await cookies();
  const tableSessionId = cookieStore.get("table_session_id")?.value;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let tableId = null;

  // 1. Try to link via Table Session (for guests/QR code users)
  if (tableSessionId) {
    const { data: session } = await supabase
      .from("table_sessions")
      .select("table_id")
      .eq("id", tableSessionId)
      .eq("status", "active")
      .single();

    if (session) {
      tableId = session.table_id;
    }
  }

  // If no identifying info is found, return empty state
  if (!tableId && !user) {
    return <OrderTrackingClient order={null} />;
  }

  // 2. Fetch order based on Table ID (Priority) or Customer ID
  let query = supabase
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
    .order("created_at", { ascending: false })
    .limit(1);

  if (tableId) {
    query = query.eq("table_id", tableId);
  } else if (user) {
    query = query.eq("customer_id", user.id);
  }

  const { data: orders, error } = await query;

  if (error) {
    console.error("Error fetching order for tracking:", error);
    return <OrderTrackingClient order={null} />;
  }

  const latestOrder = orders && orders.length > 0 ? orders[0] : null;

  return <OrderTrackingClient order={latestOrder} />;
}
