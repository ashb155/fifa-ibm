"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

export default function Chat({ 
  level, 
  prefilledQuery,
  onQuerySend
}: { 
  level: string;
  prefilledQuery: string;
  onQuerySend: (q: string) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: `Welcome. I am operating in ${level} mode. Click a point on the timeline or ask a question to begin.` }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // When level changes, reset welcome message
  useEffect(() => {
    setMessages([{ role: "assistant", content: `Welcome. I am operating in ${level} mode. Click a point on the timeline or ask a question to begin.` }]);
  }, [level]);

  useEffect(() => {
    if (prefilledQuery) {
      setInput(prefilledQuery);
    }
  }, [prefilledQuery]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const query = input;
    setInput("");
    onQuerySend(query);
    setMessages(prev => [...prev, { role: "user", content: query }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, level })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Error: Could not connect to Stratos intelligence." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#131A20] rounded border border-[#1A2229]">
      <div className="flex-1 p-4 overflow-y-auto font-sans text-sm text-gray-300 space-y-4" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className="font-mono text-xs block mb-1 uppercase tracking-wider text-stratos-blue">
              {m.role === 'user' ? 'YOU' : 'STRATOS'}
            </span>
            <div className={`p-3 rounded max-w-[90%] ${
              m.role === 'user' 
                ? 'bg-[#1A2229] border border-[#25303B] rounded-tr-none' 
                : 'bg-stratos-blue text-[#0B0F12] rounded-tl-none font-medium'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col items-start">
            <span className="font-mono text-xs block mb-1 uppercase tracking-wider text-stratos-green">STRATOS IS THINKING...</span>
            <div className="p-3 bg-stratos-blue text-[#0B0F12] rounded rounded-tl-none flex items-center gap-2 font-medium max-w-[90%]">
              <Loader2 className="animate-spin text-[#0B0F12]" size={16} />
              <span>Analyzing tactical patterns...</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-[#1A2229]">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about a tactical shift..." 
            className="w-full bg-[#0B0F12] border border-[#25303B] rounded pl-4 pr-10 py-3 text-sm text-white focus:outline-none focus:border-stratos-blue focus:ring-1 focus:ring-stratos-blue transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-stratos-blue hover:text-white disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
