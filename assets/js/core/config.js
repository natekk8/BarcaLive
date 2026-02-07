/**
 * Global configuration for BarcaLive Core System
 * @constant {Object}
 */
export const CONFIG = {
  // Supabase Configuration (Anon Key is safe - protected by RLS)
  SUPABASE: {
    url: "https://pwhozwwfsirpwjmshfjp.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3aG96d3dmc2lycHdqbXNoZmpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNDc5MDUsImV4cCI6MjA4NTYyMzkwNX0.z2HffI2aqhjIsnrxwtKXXc-ky2Pcp2VREPTqlNKtJ1w"
  },

  API_ENDPOINTS: {
    data: "/api/data",
    // All endpoints now use the same consolidated endpoint
    nextMatch: "/api/data",
    leagueTable: "/api/data",
    liveScore: "/api/data",
    teamMatches: "/api/data",
    triggerSync: "/api/trigger-sync"
  },
  REFRESH_INTERVALS: {
    live: 30000,
    idle: 300000
  },
  CACHE_TTL: 300000, // 5 minutes in ms
  FEATURE_FLAGS: {
    skeletonLoading: true,
    autoReconnect: true
  },
  SUPABASE: {
    URL: "https://your-project.supabase.co",
    KEY: "your-publishable-key"
  }
};

/**
 * Backward compatibility: SB_ANON_KEY is an alias for SB_PUBLISHABLE_KEY
 */
export const SB_PROJECT_URL = CONFIG.SUPABASE.URL;
export const SB_PUBLISHABLE_KEY = CONFIG.SUPABASE.KEY;
export const SB_ANON_KEY = CONFIG.SUPABASE.KEY;

// Expose to window for legacy scripts
if (typeof window !== 'undefined') {
  window.SB_PROJECT_URL = SB_PROJECT_URL;
  window.SB_PUBLISHABLE_KEY = SB_PUBLISHABLE_KEY;
  window.SB_ANON_KEY = SB_ANON_KEY;
}
