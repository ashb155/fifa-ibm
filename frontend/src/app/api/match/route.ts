import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.FOOTBALL_DATA_ORG_KEY;
  if (!apiKey) {
    return NextResponse.json({ status: "error", message: "Missing API key" }, { status: 500 });
  }

  try {
    const res = await fetch("https://api.football-data.org/v4/competitions/PL/matches?status=IN_PLAY,PAUSED,FINISHED", {
      headers: { "X-Auth-Token": apiKey },
      next: { revalidate: 60 } // Cache for 60s
    });

    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }

    const data = await res.json();
    const matches = data.matches || [];
    
    // We try to find a live match. If none, grab the last finished one for demo purposes.
    const targetMatch = matches.find((m: any) => m.status === 'IN_PLAY' || m.status === 'PAUSED') || matches[matches.length - 1];

    if (!targetMatch) {
      return NextResponse.json({ status: "no_live_matches", match: "No recent matches found." });
    }

    const home = targetMatch.homeTeam.shortName;
    const away = targetMatch.awayTeam.shortName;
    const score = targetMatch.score.fullTime;

    return NextResponse.json({
      status: targetMatch.status === 'FINISHED' ? 'finished' : 'live',
      match: `${home} ${score.home ?? 0} - ${score.away ?? 0} ${away}`,
      raw: targetMatch
    });
  } catch (error) {
    console.error("Match fetch error:", error);
    return NextResponse.json({ status: "error", message: String(error) }, { status: 500 });
  }
}
