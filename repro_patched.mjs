
// Mock Supabase
const mockSupabase = {
    from: (table) => {
        return {
            select: (cols) => {
                return {
                    order: (col, opts) => {
                        // Simulate different scenarios
                        if (global.scenario === 'error') {
                            return Promise.resolve({ data: null, error: { message: "Mock DB Error" } });
                        }
                        if (global.scenario === 'null_data_row') {
                            if (table === 'barca_matches') {
                                // Simulate a row where 'data' column is unexpectedly null
                                return Promise.resolve({ data: [{ data: null }], error: null });
                            }
                            return Promise.resolve({ data: [], error: null });
                        }
                        // Success case
                        if (table === 'barca_matches') {
                            return Promise.resolve({
                                data: [
                                    { data: { id: 1, status: 'FINISHED', homeTeam: { name: 'Barca' }, awayTeam: { name: 'Real' } } },
                                    { data: { id: 2, status: 'upcoming', homeTeam: { name: 'Barca' }, awayTeam: { name: 'Getafe' } } }
                                ],
                                error: null
                            });
                        }
                        if (table === 'barca_standings') {
                            return Promise.resolve({
                                data: [{ data: { team: 'Barca', points: 3 } }],
                                error: null
                            });
                        }
                        return Promise.resolve({ data: [], error: null });
                    }
                }
            }
        }
    }
};

const createClient = () => mockSupabase;

// --- CODE FROM functions/api/data.js ---
async function onRequest(context) {
    try {
        // Use Anon Key (safe - RLS allows read-only access)
        const supabase = createClient(
            context.env.SUPABASE_URL,
            context.env.SUPABASE_ANON_KEY
        );

        // Fetch matches
        const { data: matchesData, error: matchesError } = await supabase
            .from('barca_matches')
            .select('data')
            .order('id', { ascending: false });

        if (matchesError) {
            console.error('[API] Matches error:', matchesError);
            throw matchesError;
        }

        // Fetch standings
        const { data: standingsData, error: standingsError } = await supabase
            .from('barca_standings')
            .select('data')
            .order('id', { ascending: false });

        if (standingsError) {
            console.error('[API] Standings error:', standingsError);
            throw standingsError;
        }

        // Check if Supabase has data - if not, fallback to API
        const hasData = matchesData && matchesData.length > 0;

        if (!hasData) {
            console.log('[API] No data in Supabase - fetching from n8n API (fallback)');
            // Mock fetch for fallback
            // ... omitting fetch logic for now as we focus on crash ...
            return new Response(JSON.stringify({ message: "Fallback" }), { status: 200 });
        }

        // Extract actual data from JSONB
        const matches = matchesData.map(m => m.data);
        const standings = standingsData.map(s => s.data);

        // Categorize matches
        const categorized = {
            live: [],
            upcoming: [],
            finished: []
        };

        for (const match of matches) {
            const status = match.status?.toLowerCase();
            if (status === 'live' || status === 'in_play') {
                categorized.live.push(match);
            } else if (status === 'finished') {
                categorized.finished.push(match);
            } else {
                categorized.upcoming.push(match);
            }
        }

        const response = {
            matches: categorized,
            standings: standings
        };

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=60',
                'X-Data-Source': 'Supabase'
            }
        });

    } catch (error) {
        console.error('[API] Error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
// --- END CODE ---

// Mock Response
global.Response = class Response {
    constructor(body, init) {
        this.body = body;
        this.status = init.status;
        this.headers = init.headers;
    }
    json() {
        return JSON.parse(this.body);
    }
};

async function runTests() {
    const context = {
        env: {
            SUPABASE_URL: 'https://example.supabase.co',
            SUPABASE_ANON_KEY: 'mock-key'
        }
    };

    console.log("--- Test 1: Normal Success ---");
    global.scenario = 'success';
    let res = await onRequest(context);
    console.log(`Status: ${res.status}`);
    // console.log("Body:", res.body);

    console.log("\n--- Test 2: DB Error ---");
    global.scenario = 'error';
    res = await onRequest(context);
    console.log(`Status: ${res.status}`);
    console.log("Body:", res.body);

    console.log("\n--- Test 3: Null Data Row (Potential Crash) ---");
    global.scenario = 'null_data_row';
    res = await onRequest(context);
    console.log(`Status: ${res.status}`);
    console.log("Body:", res.body);

    console.log("\n--- Test 4: Missing Env Vars ---");
    res = await onRequest({ env: {} });
    console.log(`Status: ${res.status}`);
    console.log("Body:", res.body);
}

runTests();
