import { Suspense } from "react";
import { getPlayers } from "@/app/utils/supabase/queries";
import CompareClient from "./CompareClient";

export const metadata = {
  title: "เปรียบเทียบนักเตะ - La Masia Rising Stars",
  description: "เปรียบเทียบสถิติและข้อมูลของนักเตะดาวรุ่งจาก La Masia แบบตัวต่อตัว",
};

export default async function ComparePage() {
  const players = await getPlayers();
  
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 text-center text-[#64748B]">กำลังโหลดข้อมูลเปรียบเทียบ...</div>}>
      <CompareClient players={players} />
    </Suspense>
  );
}
