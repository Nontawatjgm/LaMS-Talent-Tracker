"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/app/utils/supabase/server";
import { validatePreSeasonForm } from "@/app/utils/validation";

export async function createPreSeason(playerId: string, formData: FormData) {
  const validation = validatePreSeasonForm(formData);
  if (!validation.isValid) {
    const errorMsg = Object.values(validation.errors).join(", ");
    throw new Error(`ข้อมูลสถิติไม่ถูกต้อง: ${errorMsg}`);
  }

  const supabase = await createClient();

  const data = {
    player_id: playerId,
    season: (formData.get("season") as string).trim(),
    year: parseInt(formData.get("year") as string),
    appearances: formData.get("appearances") ? parseInt(formData.get("appearances") as string) : 0,
    minutes_played: formData.get("minutes_played") ? parseInt(formData.get("minutes_played") as string) : 0,
    goals: formData.get("goals") ? parseInt(formData.get("goals") as string) : 0,
    assists: formData.get("assists") ? parseInt(formData.get("assists") as string) : 0,
    notes: (formData.get("notes") as string)?.trim() || null,
    tour_location: (formData.get("tour_location") as string)?.trim() || null,
  };

  const { error } = await supabase
    .from("pre_seasons")
    .insert([data]);

  if (error) {
    console.error("Error creating pre-season:", error);
    throw new Error("Failed to create pre-season record: " + error.message);
  }

  revalidatePath("/");
  revalidatePath(`/players/${playerId}`);
  revalidatePath("/compare");
  revalidatePath("/timeline");
  revalidatePath(`/admin/players/${playerId}/stats`);
  
  redirect(`/admin/players/${playerId}/stats?toast=stat_created&season=${encodeURIComponent(data.season)}`);
}

export async function deletePreSeason(playerId: string, statId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("pre_seasons")
    .delete()
    .eq("id", statId);

  if (error) {
    console.error("Error deleting pre-season:", error);
    throw new Error("Failed to delete pre-season record: " + error.message);
  }

  revalidatePath("/");
  revalidatePath(`/players/${playerId}`);
  revalidatePath("/compare");
  revalidatePath("/timeline");
  revalidatePath(`/admin/players/${playerId}/stats`);
}
