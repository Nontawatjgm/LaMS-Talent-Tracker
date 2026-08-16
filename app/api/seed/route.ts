import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import playersData from '@/data/players.json';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    const results = [];
    
    // Seed Players
    for (const player of playersData) {
      // 1. Insert into players table
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .upsert({
          id: player.id,
          name: player.name,
          position: player.position,
          nationality: player.nationality,
          lamasia_year: player.lamasiaYear,
          date_of_birth: player.dateOfBirth,
          flag_emoji: player.flagEmoji,
          current_status: player.currentStatus,
          description_th: player.descriptionTH,
          height: player.height || null,
          jersey_number: player.jerseyNumber || null,
          current_club: player.currentClub || 'FC Barcelona'
        }, { onConflict: 'id' });

      if (playerError) {
        console.error('Error inserting player:', player.name, playerError);
        return NextResponse.json({ error: playerError }, { status: 500 });
      }

      // 2. Insert into pre_seasons table if they have preSeason stats
      if (player.preSeasons && player.preSeasons.length > 0) {
        for (const season of player.preSeasons) {
          const { error: seasonError } = await supabase
            .from('pre_seasons')
            .insert({
              player_id: player.id,
              year: season.year,
              season: season.season,
              appearances: season.appearances,
              minutes_played: season.minutesPlayed,
              goals: season.goals,
              assists: season.assists,
              notes: season.notes || null
            });

          if (seasonError) {
            console.error('Error inserting season for:', player.name, seasonError);
          }
        }
      }
      
      results.push(`Seeded: ${player.name}`);
    }

    return NextResponse.json({ success: true, message: 'Database seeded successfully!', results });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
