import { startTableSession } from "@/app/actions/table";
import { getMenuItemsByCategory } from "@/lib/menu/data";
import Recommended from "@/components/customer/menu/Recommended";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const menuItems = await getMenuItemsByCategory();
  const cookieStore = await cookies();
  const tableSessionId = cookieStore.get("table_session_id")?.value;

  if (!tableSessionId) {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: sessionData, error } = await supabase
    .from("table_sessions")
    .select("table_id")
    .eq("id", tableSessionId)
    .single();

  if (error || !sessionData) {
    console.error("Error fetching table session:", error);
    // If session is invalid, might want to clear cookie or redirect
    redirect("/");
  }

  const tableNumber = sessionData.table_id;

  return (
    <div className="flex justify-center items-center">
      {/* Main Content */}
      <main className="relative z-10 flex w-full max-w-lg  flex-col items-center p-4 bg-brand-dark-red">
        {/* Table Info Card */}
        <div className="w-full">
          <div className="flex flex-col items-center justify-center rounded-xl bg-black/40 backdrop-blur-md p-8 text-center shadow-2xl border border-white/10">
            <p className="text-white text-2xl font-bold leading-tight">
              {Number(tableNumber) === 9
                ? "สั่งกลับบ้าน"
                : `คุณกำลังนั่งที่โต๊ะ : ${tableNumber}`}
            </p>
          </div>
          <div className="w-full py-2">
            <form
              action={startTableSession.bind(null, tableNumber)}
              className="w-full"
            >
              <button
                type="submit"
                className="w-full h-14 rounded-xl bg-brand-yellow text-black text-lg font-bold shadow-[0_4px_14px_0_rgba(251,191,36,0.39)] transition active:scale-95 hover:brightness-105 hover:scale-105 transform duration-200"
              >
                ดูเมนู / เริ่มสั่งอาหาร
              </button>
            </form>
          </div>
        </div>

        {/* recommended */}
        <div className="w-full">
          <h3 className="text-2xl font-bold px-4 pb-6 text-white">เมนูแนะนำ</h3>
          <Recommended menuItems={menuItems} />
        </div>
      </main>
    </div>
  );
}
