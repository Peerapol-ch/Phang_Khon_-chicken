// app/scan/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("t");

  if (!token) return NextResponse.redirect(new URL("/", request.url));

  // 1. เช็ค DB ว่า Token นี้ใช้ได้ไหม / หมดอายุยัง
  const { data: session } = await supabase
    .from("table_sessions")
    .select("*")
    .eq("token", token)
    .single();

  // 2. ตรวจสอบเงื่อนไข (หมดอายุ? จ่ายเงินแล้ว?)
  if (
    !session ||
    new Date() > new Date(session.expires_at) ||
    session.status !== "active"
  ) {
    return NextResponse.redirect(new URL("/error/expired", request.url)); // ไปหน้าแจ้งเตือน
  }

  // 3. ถ้าผ่าน! สร้าง Response พร้อมฝัง Cookie
  const response = NextResponse.redirect(new URL("/main", request.url));

  // ฝัง Cookie เพื่อให้ลูกค้ารีเฟรชหน้าเว็บได้โดยไม่ต้องสแกนใหม่
  response.cookies.set("table_session_id", session.id, {
    httpOnly: true,
    maxAge: 60 * 60 * 2, // 2 ชั่วโมง
  });

  return response;
}
