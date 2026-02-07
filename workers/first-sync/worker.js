import { createClient } from '@supabase/supabase-js';

/**
 * Cloudflare Worker - BarçaLive Data Sync
 * 
 * Purpose: Fetches data from n8n API and stores in Supabase
 * Triggers:
 *   - Scheduled: Daily at 23:01 UTC (00:01 CET winter)
 *   - Manual: POST request with SYNC_SECRET in header
 */

export default {
    /**
     * Performs data synchronization
     */
    async performSync(env) {
        // Validate environment variables
        console.log('[Sync] Validating environment...');
        if (!env.SUPABASE_URL) {
            console.error('[Sync] ERROR: SUPABASE_URL is not defined');
            return { success: false, error: 'Missing SUPABASE_URL environment variable' };
        }
        if (!env.SUPABASE_SERVICE_ROLE) {
            console.error('[Sync] ERROR: SUPABASE_SERVICE_ROLE is not defined');
            return { success: false, error: 'Missing SUPABASE_SERVICE_ROLE environment variable' };
        }

        console.log('[Sync] Environment validated ✓');
        console.log('[Sync] Supabase URL:', env.SUPABASE_URL);

        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE);
        const now = new Date();

        try {
            console.log('[Sync] Starting synchronization at', now.toISOString());

            // Fetch data from n8n API
            const apiUrl = 'https://natekkz-n8nhost.hf.space/webhook/api';
            console.log('[Sync] Fetching from API:', apiUrl);
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            let data = await response.json();

            // Handle array wrapper if present
            if (Array.isArray(data)) {
                console.log('[Sync] API returned array, extracting first element');
                data = data[0];
            }

            console.log('[Sync] API data received successfully');
            console.log('[Sync] Data structure:', {
                hasMatches: !!data.matches,
                hasStandings: !!data.standings,
                matchKeys: data.matches ? Object.keys(data.matches) : []
            });

            // Store matches
            const matches = data.matches || {};
            const allMatches = [
                ...(matches.live || []),
                ...(matches.upcoming || []),
                ...(matches.finished || [])
            ];

            console.log(`[Sync] Processing ${allMatches.length} matches...`);

            for (const match of allMatches) {
                console.log(`[Sync] Upserting match ID: ${match.id}`);

                // Map to schema columns
                const matchPayload = {
                    id: match.id,
                    utc_date: match.utcDate,
                    status: match.status,
                    match_day: match.matchday,
                    stage: match.stage,
                    home_team: match.homeTeam,
                    away_team: match.awayTeam,
                    score: match.score,
                    competition: match.competition,
                    referees: match.referees,
                    venue: match.venue,
                    tv_channels: match.tvChannels,
                    transmission_id: match.transmissionId, // Requires new column
                    last_updated: now.toISOString()
                };

                const { data: upsertData, error: upsertError } = await supabase
                    .from('barca_matches')
                    .upsert(matchPayload, {
                        onConflict: 'id'
                    });

                if (upsertError) {
                    console.error(`[Sync] Error upserting match ${match.id}:`, upsertError);
                    throw new Error(`Match upsert failed: ${upsertError.message}`);
                }
            }

            console.log(`[Sync] ✓ Stored ${allMatches.length} matches`);

            // Store standings
            const standings = data.standings || [];
            console.log(`[Sync] Processing ${standings.length} standings...`);

            for (const standing of standings) {
                console.log(`[Sync] Upserting standing for league: ${standing.league}`);

                // Map to schema columns
                const standingPayload = {
                    competition_code: standing.code || standing.league, // Fallback to name if code missing
                    competition_name: standing.leagueName || standing.league,
                    season: standing.season || new Date().getFullYear(),
                    standings_data: standing, // Map full object to standings_data jsonb
                    last_updated: now.toISOString()
                    // 'data' column removed
                    // 'league' column removed
                };

                const { data: upsertData, error: upsertError } = await supabase
                    .from('barca_standings')
                    .upsert(standingPayload, {
                        onConflict: 'competition_code' // Assuming unique constraint on code
                    });

                if (upsertError) {
                    console.error(`[Sync] Error upserting standing ${standing.league}:`, upsertError);
                    throw new Error(`Standing upsert failed: ${upsertError.message}`);
                }
            }

            console.log(`[Sync] ✓ Stored ${standings.length} standings`);

            // Update last_sync timestamp
            console.log('[Sync] Updating sync_metadata...');
            const { error: metadataError } = await supabase
                .from('sync_metadata')
                .update({
                    last_sync: now.toISOString(),
                    sync_status: 'success',
                    error_message: null
                })
                .eq('id', 1);

            if (metadataError) {
                console.error('[Sync] Error updating sync_metadata:', metadataError);
                throw new Error(`Metadata update failed: ${metadataError.message}`);
            }

            console.log('[Sync] ✓ Sync completed successfully!');

            return {
                success: true,
                matches: allMatches.length,
                standings: standings.length,
                timestamp: now.toISOString()
            };

        } catch (error) {
            console.error('[Sync] FATAL ERROR:', error.message);
            console.error('[Sync] Error stack:', error.stack);

            // Update error status
            try {
                await supabase
                    .from('sync_metadata')
                    .update({
                        sync_status: 'error',
                        error_message: error.message
                    })
                    .eq('id', 1);
            } catch (metaError) {
                console.error('[Sync] Failed to update error status:', metaError);
            }

            return {
                success: false,
                error: error.message,
                stack: error.stack
            };
        }
    },

    /**
     * HTTP request handler (manual trigger)
     */
    async fetch(request, env) {
        // Check authorization
        const authHeader = request.headers.get('X-Sync-Secret');
        if (authHeader !== env.SYNC_SECRET) {
            return new Response('Unauthorized', { status: 401 });
        }

        const result = await this.performSync(env);

        if (result.success) {
            return new Response(
                JSON.stringify({
                    message: 'Sync completed',
                    matches: result.matches,
                    standings: result.standings,
                    timestamp: result.timestamp
                }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        } else {
            return new Response(
                JSON.stringify({ error: result.error }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
    },

    /**
     * Scheduled trigger (cron)
     */
    async scheduled(event, env, ctx) {
        console.log('[Scheduled] Cron triggered at', new Date().toISOString());
        ctx.waitUntil(this.performSync(env));
    }
};
