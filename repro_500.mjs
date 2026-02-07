
import { onRequest } from './functions/api/data.js';

// Mock Supabase
const mockSupabase = {
    from: (table) => {
        return {
            select: (cols) => {
                return {
                    order: (col, opts) => {
                         // Simulate different scenarios based on table name or global flag
                         if (global.scenario === 'error') {
                             return Promise.resolve({ data: null, error: { message: "Mock DB Error" } });
                         }
                         if (global.scenario === 'empty') {
                             return Promise.resolve({ data: [], error: null });
                         }
                         if (global.scenario === 'null_data_row') {
                             if (table === 'barca_matches') {
                                 return Promise.resolve({ data: [{ data: null }], error: null }); // Bad row
                             }
                             return Promise.resolve({ data: [], error: null });
                         }
                         // Success case
                         if (table === 'barca_matches') {
                             return Promise.resolve({ 
                                 data: [{ 
                                     data: { 
                                         id: 1, 
                                         status: 'FINISHED',
                                         homeTeam: { name: 'Barca' },
                                         awayTeam: { name: 'Real' }
                                     } 
                                 }], 
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

// Mock createClient
import * as supabase from '@supabase/supabase-js';
supabase.createClient = () => mockSupabase;

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
    if (res.status === 200) console.log("Success!");
    else console.log("Failed:", res.body);

    console.log("\n--- Test 2: DB Error ---");
    global.scenario = 'error';
    res = await onRequest(context);
    console.log(`Status: ${res.status}`);
    console.log("Body:", res.body);

    console.log("\n--- Test 3: Null Data Row (Potential Crash) ---");
    global.scenario = 'null_data_row';
    res = await onRequest(context);
    console.log(`Status: ${res.status}`); // If 500 and not DB error, it's a crash caught by top level catch
    console.log("Body:", res.body);

    console.log("\n--- Test 4: Missing Env Vars ---");
    try {
        await onRequest({ env: {} }); // Missing keys
        console.log("Status: ?? (Should have failed inside)");
    } catch (e) {
        console.log("Caught outer error (unexpected):", e);
    }
    // Wait, onRequest catches errors, so it should return 500
    res = await onRequest({ env: {} });
    console.log(`Status: ${res.status}`);
    console.log("Body:", res.body);
}

runTests();
