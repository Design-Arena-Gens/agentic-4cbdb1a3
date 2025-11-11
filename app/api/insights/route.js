import { NextResponse } from 'next/server';
import { getEvents } from '../../../lib/insightsStore';

export async function GET() {
  return NextResponse.json({ events: getEvents() });
}
