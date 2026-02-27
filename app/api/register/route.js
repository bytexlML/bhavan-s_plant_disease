export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const body = await request.json();
        return new Response(JSON.stringify({
            status: 'success',
            message: 'Registration authorized',
            expert: body.name
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ status: 'error', message: 'Invalid payload' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function GET() {
    return new Response(JSON.stringify({ message: "Register active" }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
