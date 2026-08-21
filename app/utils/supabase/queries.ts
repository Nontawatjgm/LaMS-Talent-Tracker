import { createClient } from "@supabase/supabase-js";
import type { Player } from "@/types/player";
import { unstable_cache } from "next/cache";
import { cache } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function fetchPlayersFromSupabase(): Promise<Player[]> {
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

  return players.map((p) => ({
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
    imageUrl: p.image_url,
    actionShotUrl: p.action_shot_url,
    preferredFoot: p.preferred_foot,
    marketValueM: p.market_value_m,
    firstTeamDebutDate: p.first_team_debut_date,
    firstTeamDebutMatch: p.first_team_debut_match,
    socialInstagram: p.social_instagram,
    preSeasons: (p.preSeasons || []).map((ps: any) => ({
      year: ps.year,
      season: ps.season,
      appearances: ps.appearances,
      minutesPlayed: ps.minutes_played,
      goals: ps.goals,
      assists: ps.assists,
      notes: ps.notes,
      tourLocation: ps.tour_location,
    })),
  })) as Player[];
}

export const getPlayers = cache(
  unstable_cache(fetchPlayersFromSupabase, ["players-list"], {
    tags: ["players"],
    revalidate: 60,
  })
);

