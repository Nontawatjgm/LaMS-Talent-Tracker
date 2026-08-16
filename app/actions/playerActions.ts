"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/app/utils/supabase/server";

export async function createPlayer(formData: FormData) {
  const supabase = await createClient();

  const playerData = {
    name: formData.get("name") as string,
    position: formData.get("position") as string,
    nationality: formData.get("nationality") as string,
    flag_emoji: formData.get("flag_emoji") as string,
    date_of_birth: formData.get("date_of_birth") as string,
    lamasia_year: parseInt(formData.get("lamasia_year") as string),
    height: formData.get("height") ? parseInt(formData.get("height") as string) : null,
    jersey_number: formData.get("jersey_number") ? parseInt(formData.get("jersey_number") as string) : null,
    current_status: formData.get("current_status") as string,
    current_club: formData.get("current_club") as string || "FC Barcelona",
    description_th: formData.get("description_th") as string || null,
  };

  const { data, error } = await supabase
    .from("players")
    .insert([playerData])
    .select()
    .single();

  if (error) {
    console.error("Error creating player:", error);
    throw new Error("Failed to create player: " + error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/players");
  revalidatePath("/timeline");
  
  redirect("/admin/players");
}

export async function updatePlayer(id: string, formData: FormData) {
  const supabase = await createClient();

  const playerData = {
    name: formData.get("name") as string,
    position: formData.get("position") as string,
    nationality: formData.get("nationality") as string,
    flag_emoji: formData.get("flag_emoji") as string,
    date_of_birth: formData.get("date_of_birth") as string,
    lamasia_year: parseInt(formData.get("lamasia_year") as string),
    height: formData.get("height") ? parseInt(formData.get("height") as string) : null,
    jersey_number: formData.get("jersey_number") ? parseInt(formData.get("jersey_number") as string) : null,
    current_status: formData.get("current_status") as string,
    current_club: formData.get("current_club") as string || "FC Barcelona",
    description_th: formData.get("description_th") as string || null,
  };

  const { error } = await supabase
    .from("players")
    .update(playerData)
    .eq("id", id);

  if (error) {
    console.error("Error updating player:", error);
    throw new Error("Failed to update player: " + error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/players");
  revalidatePath(`/players/${id}`);
  revalidatePath("/timeline");
  
  redirect("/admin/players");
}

export async function deletePlayer(id: string) {
  const supabase = await createClient();

  // First delete pre_seasons because of foreign key constraint
  const { error: psError } = await supabase
    .from("pre_seasons")
    .delete()
    .eq("player_id", id);
    
  if (psError) {
    console.error("Error deleting pre_seasons:", psError);
    throw new Error("Failed to delete player stats: " + psError.message);
  }

  // Then delete player
  const { error } = await supabase
    .from("players")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting player:", error);
    throw new Error("Failed to delete player: " + error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/players");
  revalidatePath("/timeline");
}
