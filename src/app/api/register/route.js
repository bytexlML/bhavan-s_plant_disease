import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        return NextResponse.json({
            status: 'success',
            message: 'Registration authorized',
            echo: body.name
        });
    } catch (e) {
        return NextResponse.json({ status: 'error', message: 'Invalid payload' }, { status: 400 });
    }
}

export async function GET() {
    return NextResponse.json({ message: 'Register endpoint is active. Use POST for registration.' });
}
