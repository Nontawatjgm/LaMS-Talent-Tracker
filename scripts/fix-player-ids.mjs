#!/usr/bin/env node
// Fix corrupted player IDs and names in Supabase
// Run with: node scripts/fix-player-ids.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually
const envPath = resolve(__dirname, '../.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const m = line.trim().match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Only the 2 remaining players that failed due to FK constraint
const fixes = [
  { oldId: 'iker-rodr-guez',    newId: 'iker-rodriguez',       name: 'Iker Rodríguez' },
  { oldId: 'ron-yaakobishvili', newId: 'oron-yaakobishvili',   name: 'Oron Yaakobishvili' },
];

async function fixPlayerIds() {
  console.log('🔧 Starting player ID/name fix...\n');
  let fixed = 0;
  let errors = 0;

  for (const fix of fixes) {
    // Step 1: Check if the broken ID exists
    const { data: existing } = await supabase
      .from('players')
      .select('id, name')
      .eq('id', fix.oldId)
      .single();

    if (!existing) {
      console.log(`⚠️  Skip: "${fix.oldId}" not found in DB`);
      continue;
    }

    console.log(`🔄 Fixing: "${fix.oldId}" (${existing.name}) → "${fix.newId}" (${fix.name})`);

    // Step 2: Update pre_seasons foreign key first
    // First try to delete pre_seasons, then re-insert after fixing ID
    const { data: existingSeasons } = await supabase
      .from('pre_seasons')
      .select('*')
      .eq('player_id', fix.oldId);

    if (existingSeasons && existingSeasons.length > 0) {
      await supabase.from('pre_seasons').delete().eq('player_id', fix.oldId);
    }

    // Step 3: Update the player's name first (ID stays same for now)
    const { error: nameError } = await supabase
      .from('players')
      .update({ name: fix.name })
      .eq('id', fix.oldId);

    if (nameError) {
      console.error(`  ❌ Failed to update name for ${fix.oldId}:`, nameError.message);
      errors++;
      continue;
    }

    // Step 4: Insert new row with correct ID
    const { data: oldRow } = await supabase.from('players').select('*').eq('id', fix.oldId).single();
    if (oldRow) {
      const { error: insertError } = await supabase.from('players').insert({ ...oldRow, id: fix.newId, name: fix.name });
      if (insertError && !insertError.message.includes('duplicate')) {
        console.error(`  ❌ Failed to insert new ID ${fix.newId}:`, insertError.message);
        errors++;
        continue;
      }

      // Step 5: Re-insert pre_seasons with new player_id
      if (existingSeasons && existingSeasons.length > 0) {
        for (const season of existingSeasons) {
          const { id: _id, player_id: _pid, ...seasonData } = season;
          await supabase.from('pre_seasons').insert({ ...seasonData, player_id: fix.newId });
        }
        console.log(`  🔁 Re-inserted ${existingSeasons.length} pre_seasons`);
      }

      // Step 6: Delete old row
      await supabase.from('players').delete().eq('id', fix.oldId);
    }

    console.log(`  ✅ Fixed: "${fix.oldId}" → "${fix.newId}"`);
    fixed++;
  }

  console.log(`\n✨ Done! Fixed: ${fixed}, Errors: ${errors}`);
}

fixPlayerIds().catch(console.error);
