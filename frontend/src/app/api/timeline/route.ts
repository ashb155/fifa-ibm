import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get('match_id') || '3869685';

  try {
    const res = await fetch(`https://raw.githubusercontent.com/statsbomb/open-data/master/data/events/${matchId}.json`);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch Statsbomb data for match ${matchId}`);
    }

    const events = await res.json();
    
    // Filter for substitutions and tactical shifts
    const timelineEvents = events
      .filter((e: any) => e.type.name === 'Substitution' || e.type.name === 'Tactical Shift')
      .map((e: any) => {
        const team = e.team?.name;
        const minute = e.minute;
        let desc = '';
        if (e.type.name === 'Substitution') {
          const outPlayer = e.player?.name;
          const inPlayer = e.substitution?.replacement?.name;
          desc = `${team}: ${outPlayer} out, ${inPlayer} in`;
        } else if (e.type.name === 'Tactical Shift') {
          desc = `${team}: Formation shift to ${e.tactics?.formation}`;
        }
        return { minute, team, desc, raw: e };
      });

    return NextResponse.json({
      timelineText: timelineEvents.map((e: any) => `${e.minute}' - ${e.desc}`).join('\n'),
      events: timelineEvents
    });
  } catch (error) {
    console.error("Timeline fetch error:", error);
    return NextResponse.json({ status: "error", message: String(error) }, { status: 500 });
  }
}
