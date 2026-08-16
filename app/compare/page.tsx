import { getPlayers } from "@/app/utils/supabase/queries";
import CompareClient from "./CompareClient";

export const metadata = {
  title: "เปรียบเทียบนักเตะ - La Masia Rising Stars",
  description: "เปรียบเทียบสถิติและข้อมูลของนักเตะดาวรุ่งจาก La Masia แบบตัวต่อตัว",
};

export default async function ComparePage() {
  const players = await getPlayers();
  
  return <CompareClient players={players} />;
}
