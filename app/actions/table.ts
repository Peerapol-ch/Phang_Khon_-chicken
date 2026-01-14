"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function startTableSession(tableId: number) {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // 1. Check if there's already an active session for this table
  const { data: existingSession } = await supabase
    .from("table_sessions")
    .select("*")
    .eq("table_id", tableId)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .single();

  let sessionId = existingSession?.id;

  // 2. If no active session, create a new one
  if (!sessionId) {
    const { data: newSession, error } = await supabase
      .from("table_sessions")
      .insert({
        table_id: tableId,
        status: "active",
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        token: crypto.randomUUID(), // Generate a fake token since we are bypassing scan
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating session:", error);
      throw new Error("Failed to create session");
    }

    sessionId = newSession.id;
  }

  // 3. Set cookie
  cookieStore.set("table_session_id", sessionId, {
    httpOnly: true,
    maxAge: 60 * 60 * 2, // 2 hours
  });

  // 4. Redirect to menu
  redirect("/menu");
}
