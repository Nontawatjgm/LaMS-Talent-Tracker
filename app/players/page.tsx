import { Suspense } from "react";
import { getPlayers } from "@/app/utils/supabase/queries";
import PlayersClient from "./PlayersClient";

export const metadata = {
  title: "ทำเนียบนักเตะทั้งหมด - La Masia Rising Stars",
  description: "รายชื่อนักเตะดาวรุ่งจากสถาบัน La Masia ของ FC Barcelona ทั้งหมด พร้อมระบบค้นหาและฟิลเตอร์สถานะ",
};

export default async function PlayersPage() {
  const players = await getPlayers();

  return (
    <Suspense fallback={<div className="min-h-screen pt-24 text-center text-white/50">กำลังโหลดข้อมูลนักเตะ...</div>}>
      <PlayersClient players={players} />
    </Suspense>
  );
}
