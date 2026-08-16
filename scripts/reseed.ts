import { createClient } from '@supabase/supabase-js';
import playersData from '../data/players.json';
import WebSocket from 'ws';
global.WebSocket = WebSocket as any;

import { loadEnvConfig } from '@next/env';
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('Starting reseed...');
  let successCount = 0;
  for (const player of playersData) {
    if (player.preSeasons && player.preSeasons.length > 0) {
      // Delete existing to avoid duplicates if any
      await supabase.from('pre_seasons').delete().eq('player_id', player.id);
      
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
        } else {
          successCount++;
        }
      }
    }
  }
  console.log(`Inserted ${successCount} pre-season records.`);
}

main().catch(console.error);
