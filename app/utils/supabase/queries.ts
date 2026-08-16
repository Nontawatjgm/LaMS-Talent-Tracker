import { createClient } from "@supabase/supabase-js";
import type { Player } from "@/types/player";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getPlayers(): Promise<Player[]> {
  const { data: playersData, error } = await supabase
    .from("players")
    .select(`
      *,
      preSeasons:pre_seasons(*)
    `);

  if (error) {
    console.error("Error fetching players:", error);
    return [];
  }

  const players = (playersData || []) as any[];

  return players.map(p => ({
    id: p.id,
    name: p.name,
    position: p.position,
    nationality: p.nationality,
    lamasiaYear: p.lamasia_year,
    dateOfBirth: p.date_of_birth,
    flagEmoji: p.flag_emoji,
    currentStatus: p.current_status,
    descriptionTH: p.description_th,
    height: p.height,
    jerseyNumber: p.jersey_number,
    currentClub: p.current_club,
    preSeasons: (p.preSeasons || []).map((ps: any) => ({
      year: ps.year,
      season: ps.season,
      appearances: ps.appearances,
      minutesPlayed: ps.minutes_played,
      goals: ps.goals,
      assists: ps.assists,
      notes: ps.notes
    }))
  })) as Player[];
}
