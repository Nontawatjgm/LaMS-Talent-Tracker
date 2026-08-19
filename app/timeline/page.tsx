import { Suspense } from "react";
import { getPlayers } from "@/app/utils/supabase/queries";
import TimelineClient from "./TimelineClient";

export const metadata = {
  title: "Timeline - La Masia Rising Stars",
  description: "ลำดับการแจ้งเกิดของดาวรุ่ง La Masia ที่ขึ้นมาติดทีมชุดใหญ่ในช่วง Pre-Season",
};

export default async function TimelinePage() {
  const players = await getPlayers();
  
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 text-center text-white/50">กำลังโหลดข้อมูล...</div>}>
      <TimelineClient players={players} />
    </Suspense>
  );
}
