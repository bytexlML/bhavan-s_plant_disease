export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        total_predictions: 1240,
        top_plant: "Tomato",
        status: "Online",
        source: "standard-stats"
    });
}
