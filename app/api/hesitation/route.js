import { NextResponse } from 'next/server';
import { addEvent } from '../../../lib/insightsStore';

export async function POST(req) {
  try {
    const data = await req.json();
    addEvent({ type: 'hesitation', ...data });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false });
  }
}
