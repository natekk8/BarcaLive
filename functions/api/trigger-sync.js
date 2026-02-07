/**
 * Pages Function: /api/trigger-sync
 * Triggers Worker sync (called after match ends)
 */
export async function onRequest(context) {
    try {
        const workerUrl = 'https://first-sync.barcalive.workers.dev/';

        const response = await fetch(workerUrl, {
            method: 'POST',
            headers: {
                'X-Sync-Secret': context.env.SYNC_SECRET
            }
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store'
            }
        });

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
