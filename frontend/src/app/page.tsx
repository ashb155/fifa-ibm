"use client";

import { useState, useEffect } from 'react';
import { Activity, MessageSquare } from 'lucide-react';
import Timeline from '@/components/Timeline';
import Chat from '@/components/Chat';

export default function Home() {
  const [level, setLevel] = useState<'Beginner' | 'Casual' | 'Tactical'>('Tactical');
  const [events, setEvents] = useState<any[]>([]);
  const [liveMatch, setLiveMatch] = useState<string>("Loading...");
  const [prefilledQuery, setPrefilledQuery] = useState("");

  useEffect(() => {
    // Fetch live match
    fetch('/api/match')
      .then(res => res.json())
      .then(data => {
        if (data.match) setLiveMatch(data.match);
      })
      .catch(err => console.error(err));

    // Fetch timeline events
    fetch('/api/timeline')
      .then(res => res.json())
      .then(data => {
        if (data.events) setEvents(data.events);
      })
      .catch(err => console.error(err));
  }, []);

  const handleEventClick = (event: any) => {
    setPrefilledQuery(`Explain the tactical impact of this event: ${event.minute}' - ${event.desc}`);
  };

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header / Hero Section */}
      <header className="flex-none border-b border-[#1A2229] bg-[#0B0F12] p-6 relative">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="font-display font-bold text-3xl tracking-widest uppercase text-white mb-1">
              The Same 90 Minutes.
            </h1>
            <p className="text-gray-400 text-sm tracking-wide">A Smarter Way to Watch.</p>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Mock Live Ticker */}
            <div className="flex items-center gap-3 bg-[#131A20] px-4 py-2 rounded border border-[#25303B]">
              <div className="w-2 h-2 rounded-full bg-stratos-green animate-pulse" />
              <span className="font-mono text-sm tracking-wider text-stratos-green">LIVE</span>
              <span className="font-mono text-sm text-white">{liveMatch}</span>
            </div>

            {/* Onboarding Segmented Control */}
            <div className="flex bg-[#131A20] p-1 rounded border border-[#25303B]">
              {['Beginner', 'Casual', 'Tactical'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setLevel(tier as any)}
                  className={`px-4 py-1 text-xs font-semibold uppercase tracking-wider rounded transition-all duration-200 ${
                    level === tier 
                      ? 'bg-stratos-blue text-[#0B0F12] shadow-[0_0_10px_rgba(0,229,255,0.3)]' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        
        {/* D3 Timeline Column */}
        <div className="col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-stratos-blue mb-2">
            <Activity size={18} />
            <h2 className="font-display uppercase tracking-widest text-sm font-semibold">Tactical Decision Timeline</h2>
          </div>
          <div className="flex-1 bg-[#131A20] border border-[#1A2229] rounded relative overflow-hidden flex items-center justify-center">
            <Timeline events={events} onEventClick={handleEventClick} />
          </div>
        </div>

        {/* Chat Interface Column */}
        <div className="col-span-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center gap-2 text-white mb-2">
            <MessageSquare size={18} />
            <h2 className="font-display uppercase tracking-widest text-sm font-semibold">Stratos Companion</h2>
          </div>
          <Chat 
            level={level} 
            prefilledQuery={prefilledQuery} 
            onQuerySend={() => setPrefilledQuery("")} 
          />
        </div>
        
      </div>
    </main>
  );
}
