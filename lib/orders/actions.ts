"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

export async function createOrder(items: CartItem[]) {
  const cookieStore = await cookies();
  const supabase = await createClient();
  const tableSessionId = cookieStore.get("table_session_id")?.value;

  if (!tableSessionId) {
    return {
      success: false,
      message: "No active session found. Please scan QR code again.",
    };
  }

  try {
    // 1. Validate session and get table_id
    const { data: session, error: sessionError } = await supabase
      .from("table_sessions")
      .select("table_id, status")
      .eq("id", tableSessionId)
      .single();

    if (sessionError || session?.status !== "active") {
      return {
        success: false,
        message: "Session expired or invalid. Please scan QR code again.",
      };
    }

    // 2. Get current user (if logged in)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 3. Check for existing active order
    const { data: latestOrder } = await supabase
      .from("orders")
      .select("id, total_amount, status, payment_status, order_id") // Fetch order_id
      .eq("table_id", session.table_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let orderId: string;

    const activeOrder =
      latestOrder?.payment_status === "unpaid" &&
      latestOrder.status !== "cancelled" &&
      latestOrder.status !== "completed"
        ? latestOrder
        : null;

    if (activeOrder) {
      orderId = activeOrder.order_id;
    } else {
      orderId = await generateOrderId(supabase);

      // Create new Order with temporary 0 total, we will update it after inserting items
      const { error: orderError } = await supabase
        .from("orders")
        .insert({
          table_id: session.table_id,
          customer_id: user?.id || null,
          total_amount: 0, // Will update this shortly
          status: "pending",
          payment_status: "unpaid",
          order_id: orderId,
        })
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);
        return {
          success: false,
          message: "Failed to create order. Please try again.",
        };
      }
    }

    // 4. Create Order Items
    const orderItems = items.map((item) => ({
      order_id: orderId,
      menu_item_id: item.id,
      quantity: item.quantity,
      price: item.price,
      notes: item.note || null,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      // Optional: Cleanup order if items fail? preserving for now for debugging
      return { success: false, message: "Failed to add items to order." };
    }

    // 5. Recalculate and update Order Total
    // Fetch all items for this order to ensure we have the correct total
    const { data: allItems, error: fetchItemsError } = await supabase
      .from("order_items")
      .select("price, quantity")
      .eq("order_id", orderId);

    if (fetchItemsError) {
      console.error(
        "Error fetching order items for total calculation:",
        fetchItemsError
      );
      // Don't fail the request, but log it. The total might be 0 until next update or manual fix.
    } else {
      console.log("Recalculating total for Order ID:", orderId);
      console.log("Items found:", allItems?.length, allItems);

      const grandTotal = allItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      console.log("Calculated Grand Total:", grandTotal);

      const { error: finalUpdateError } = await supabase
        .from("orders")
        .update({
          total_amount: grandTotal,
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", orderId);

      if (finalUpdateError) {
        console.error("Error updating final order total:", finalUpdateError);
      }
    }

    return {
      success: true,
      message: "Order placed successfully!",
      orderId: orderId,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateOrderId(supabase: any) {
  const now = new Date();
  // Use Thai time for the date prefix
  const thaiDate: Date = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" })
  );
  const day = String(thaiDate.getDate()).padStart(2, "0");
  const month = String(thaiDate.getMonth() + 1).padStart(2, "0");
  const year = String(thaiDate.getFullYear()).slice(-2);
  const datePrefix = `OR-${day}${month}${year}`;

  const { data: lastOrderData } = await supabase
    .from("orders")
    .select("order_id")
    .ilike("order_id", `${datePrefix}-%`)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let nextRunNumber = 1;
  if (lastOrderData?.order_id) {
    const parts = lastOrderData.order_id.split("-");
    const lastNum = Number.parseInt(parts[parts.length - 1]);
    if (!Number.isNaN(lastNum)) {
      nextRunNumber = lastNum + 1;
    }
  }

  return `${datePrefix}-${String(nextRunNumber).padStart(4, "0")}`;
}
