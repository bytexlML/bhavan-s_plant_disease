export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    return new Response(JSON.stringify({
        total_predictions: 1240,
        top_plant: "Tomato",
        status: "Online",
        source: "nodejs-stats"
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
