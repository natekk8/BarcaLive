/**
 * Legacy API Wrapper for BarcaLive
 * Now redirects to the new BarcaAPI singleton for a single source of truth.
 */
const API = {
    async fetch(endpoint) {
        // This method is kept for backward compatibility but redirected
        if (endpoint.includes('standings')) {
            const comp = endpoint.includes('2014') ? 'PD' : 'CL';
            return this.getStandings(comp);
        }
        if (endpoint.includes('matches')) {
            return this.getMatches();
        }
        return null;
    },

    mapData(data) {
        return data; // Mapping is now handled in BarcaAPI
    },

    async getStandings(leagueId = 2014) {
        const comp = (leagueId === 2014 || leagueId === 'PD') ? 'PD' : 'CL';
        const res = await window.barcaAPI.fetchLeagueTable(comp);
        return res.success ? res.data : null;
    },

    async getUCLStandings() {
        return await this.getStandings('CL');
    },

    async getMatches(teamId = 2017) {
        const res = await window.barcaAPI.fetchTeamMatches();
        return res.success ? res.data : null;
    },

    async getUCLMatches() {
        return await this.getMatches();
    }
};

window.API = API;
