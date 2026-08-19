"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/app/utils/supabase/server";

import { getFlagEmoji } from "@/app/utils/flags";
import { validatePlayerForm } from "@/app/utils/validation";

export async function createPlayer(formData: FormData) {
  const validation = validatePlayerForm(formData);
  if (!validation.isValid) {
    const errorMsg = Object.values(validation.errors).join(", ");
    throw new Error(`ข้อมูลไม่ถูกต้อง: ${errorMsg}`);
  }

  const supabase = await createClient();

  const name = (formData.get("name") as string).trim();
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const nationality = formData.get("nationality") as string;
  const flag_emoji = getFlagEmoji(nationality);

  const heightStr = formData.get("height") as string;
  const jerseyStr = formData.get("jersey_number") as string;
  const marketValueStr = formData.get("market_value_m") as string;

  const safeParseInt = (str: string) => {
    const val = parseInt(str);
    return isNaN(val) ? null : val;
  };
  
  const safeParseFloat = (str: string) => {
    const val = parseFloat(str);
    return isNaN(val) ? null : val;
  };

  const parseDateToISO = (dateStr: string | null | undefined): string | null => {
    if (!dateStr || !dateStr.trim() || dateStr.trim() === "-") return null;
    const str = dateStr.trim();
    // Match DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
    const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, "0");
      const month = dmyMatch[2].padStart(2, "0");
      const year = dmyMatch[3];
      return `${year}-${month}-${day}`;
    }
    // Match YYYY-MM-DD
    const ymdMatch = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
    if (ymdMatch) {
      const year = ymdMatch[1];
      const month = ymdMatch[2].padStart(2, "0");
      const day = ymdMatch[3].padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    return str;
  };

  const playerData = {
    id,
    name,
    position: formData.get("position") as string,
    nationality,
    flag_emoji,
    date_of_birth: parseDateToISO(formData.get("date_of_birth") as string) || "2000-01-01",
    lamasia_year: parseInt(formData.get("lamasia_year") as string),
    height: safeParseInt(heightStr),
    jersey_number: safeParseInt(jerseyStr),
    current_status: formData.get("current_status") as string,
    current_club: (formData.get("current_club") as string)?.trim() || "FC Barcelona",
    description_th: (formData.get("description_th") as string)?.trim() || null,
    image_url: (formData.get("image_url") as string)?.trim() || null,
    action_shot_url: (formData.get("action_shot_url") as string)?.trim() || null,
    preferred_foot: (formData.get("preferred_foot") as string)?.trim() || null,
    market_value_m: safeParseFloat(marketValueStr),
    first_team_debut_date: parseDateToISO(formData.get("first_team_debut_date") as string),
    first_team_debut_match: (formData.get("first_team_debut_match") as string)?.trim() || null,
    social_instagram: (formData.get("social_instagram") as string)?.trim() || null,
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
  
  redirect(`/admin/players?toast=created&name=${encodeURIComponent(name)}`);
}

export async function updatePlayer(id: string, formData: FormData) {
  const validation = validatePlayerForm(formData);
  if (!validation.isValid) {
    const errorMsg = Object.values(validation.errors).join(", ");
    throw new Error(`ข้อมูลไม่ถูกต้อง: ${errorMsg}`);
  }

  const supabase = await createClient();

  const nationality = formData.get("nationality") as string;
  const flag_emoji = getFlagEmoji(nationality);

  const heightStr = formData.get("height") as string;
  const jerseyStr = formData.get("jersey_number") as string;
  const marketValueStr = formData.get("market_value_m") as string;

  const safeParseInt = (str: string) => {
    const val = parseInt(str);
    return isNaN(val) ? null : val;
  };
  
  const safeParseFloat = (str: string) => {
    const val = parseFloat(str);
    return isNaN(val) ? null : val;
  };

  const parseDateToISO = (dateStr: string | null | undefined): string | null => {
    if (!dateStr || !dateStr.trim() || dateStr.trim() === "-") return null;
    const str = dateStr.trim();
    const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, "0");
      const month = dmyMatch[2].padStart(2, "0");
      const year = dmyMatch[3];
      return `${year}-${month}-${day}`;
    }
    const ymdMatch = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
    if (ymdMatch) {
      const year = ymdMatch[1];
      const month = ymdMatch[2].padStart(2, "0");
      const day = ymdMatch[3].padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    return str;
  };

  const playerData = {
    name: (formData.get("name") as string).trim(),
    position: formData.get("position") as string,
    nationality,
    flag_emoji,
    date_of_birth: parseDateToISO(formData.get("date_of_birth") as string) || "2000-01-01",
    lamasia_year: parseInt(formData.get("lamasia_year") as string),
    height: safeParseInt(heightStr),
    jersey_number: safeParseInt(jerseyStr),
    current_status: formData.get("current_status") as string,
    current_club: (formData.get("current_club") as string)?.trim() || "FC Barcelona",
    description_th: (formData.get("description_th") as string)?.trim() || null,
    image_url: (formData.get("image_url") as string)?.trim() || null,
    action_shot_url: (formData.get("action_shot_url") as string)?.trim() || null,
    preferred_foot: (formData.get("preferred_foot") as string)?.trim() || null,
    market_value_m: safeParseFloat(marketValueStr),
    first_team_debut_date: parseDateToISO(formData.get("first_team_debut_date") as string),
    first_team_debut_match: (formData.get("first_team_debut_match") as string)?.trim() || null,
    social_instagram: (formData.get("social_instagram") as string)?.trim() || null,
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
  
  redirect(`/admin/players?toast=updated&name=${encodeURIComponent(playerData.name)}`);
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
