import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  getCurrentUser,
  fetchChatResponse,
  fetchTimeline,
  searchMatches,
  StatsBombMatch,
  AuthUser
} from "../utils/api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Stratos · Matchday Console" },
      {
        name: "description",
        content:
          "Your calibrated football console — live match reasoning, tactical telemetry, and a multilingual companion.",
      },
    ],
  }),
  component: Dashboard,
});

/* ──────────────────────────────────────────────────────────── */

type ChatMsg = {
  role: "user" | "stratos";
  text: string;
  cite?: string;
};

const TACTICAL_FEED = [
  {
    min: "04'",
    tag: "Pressing trap",
    body: "Brazil's right-8 shadow-marks the pivot. Press is triggered the moment ARG's CB receives with their weaker foot.",
    src: "StatsBomb · pressure events 0'–5'",
  },
  {
    min: "12'",
    tag: "Half-space drift",
    body: "Raphinha rotates inside; Danilo overlaps. Numerical 2v1 on ARG's left-back baiting a duel.",
    src: "Tracking · 18Hz · Sportec",
  },
  {
    min: "23'",
    tag: "Block reset",
    body: "Tactical foul on De Paul — bought 6.2s of recovery for a back-line that was 4.1m out of compactness.",
    src: "IFAB Law 12 · §3",
  },
  {
    min: "31'",
    tag: "xT swing",
    body: "Argentina's switch of play converted 0.04 → 0.18 expected threat in one pass. Wide overload pinned BRA.",
    src: "xT (Karun) · Granite reasoning",
  },
  {
    min: "44'",
    tag: "PPDA shift",
    body: "Brazil's PPDA collapsed from 11.2 to 6.4 in the last 10'. Sustained pressing — bank running on fumes.",
    src: "Opta · PPDA window",
  },
];

const HEATMAP_CELLS = Array.from({ length: 96 }, (_, i) => {
  const x = i % 12;
  const y = Math.floor(i / 12);
  const cx = 5.5, cy = 4;
  const d1 = Math.hypot(x - cx, y - cy);
  const d2 = Math.hypot(x - 9, y - 5);
  const h = Math.max(0, 1 - d1 / 6) + Math.max(0, 0.7 - d2 / 5);
  return Math.min(1, h * 0.9 + ((i * 13) % 7) / 40);
});

/* ──────────────────────────────────────────────────────────── */

function Dashboard() {
  const [tab, setTab] = useState<"timeline" | "tactics" | "rules">("timeline");
  const [lang, setLang] = useState("English");
  const [level, setLevel] = useState<"Beginner" | "Casual" | "Tactical">("Tactical");
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Auth Guard
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authenticating, setAuthenticating] = useState(true);
  const navigate = useNavigate();

  // Match & Timeline data
  const [matches, setMatches] = useState<StatsBombMatch[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<StatsBombMatch | null>(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineData, setTimelineData] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("stratos_token");
    if (!token) {
      window.location.href = "/?calibrate=true";
      return;
    }
    getCurrentUser(token)
      .then((u) => {
        if (!u.team || !u.level || !u.language) {
          window.location.href = "/?calibrate=true";
        } else {
          setUser(u);
          setLang(u.language);
          setLevel(u.level as any);
          setChat([
            {
              role: "stratos",
              text: `Calibrated console for ${u.username}. Live match reasoning online. Select a match below to inspect StatsBomb timelines and query our Granite RAG tactical assistant.`,
              cite: "System Calibrator",
            }
          ]);
          setAuthenticating(false);
        }
      })
      .catch(() => {
        localStorage.removeItem("stratos_token");
        window.location.href = "/?calibrate=true";
      });
  }, [navigate]);

  // Load matches
  useEffect(() => {
    if (authenticating) return;
    searchMatches("")
      .then((res) => {
        if (res.status === "success") {
          setMatches(res.matches);
          if (res.matches.length > 0) {
            setSelectedMatch(res.matches[0]);
          }
        }
      })
      .catch((err) => console.error("Failed to fetch match list:", err));
  }, [authenticating]);

  // Load timeline when match selected
  useEffect(() => {
    if (!selectedMatch) return;
    setTimelineLoading(true);
    fetchTimeline(selectedMatch.match_id.toString())
      .then((res) => {
        setTimelineData(res.timeline);
      })
      .catch((err) => {
        console.error("Timeline load failed:", err);
        setTimelineData("Failed to load match event timeline.");
      })
      .finally(() => {
        setTimelineLoading(false);
      });
  }, [selectedMatch]);

  const filteredMatches = useMemo(() => {
    if (!searchQuery.trim()) return matches.slice(0, 8);
    const q = searchQuery.toLowerCase().trim();
    return matches.filter(
      (m) =>
        m.home_team.home_team_name.toLowerCase().includes(q) ||
        m.away_team.away_team_name.toLowerCase().includes(q)
    );
  }, [matches, searchQuery]);

  const send = async (q?: string) => {
    const text = (q ?? input).trim();
    if (!text || chatLoading) return;
    setInput("");
    
    setChat((c) => [...c, { role: "user", text }]);
    setChatLoading(true);

    try {
      const history = chat.map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: m.text,
      }));

      const res = await fetchChatResponse({
        query: text,
        persona: level.toLowerCase(),
        language: lang,
        history,
      });

      setChat((c) => [
        ...c,
        {
          role: "stratos",
          text: res.response,
          cite: res.source,
        },
      ]);
    } catch (err: any) {
      setChat((c) => [
        ...c,
        {
          role: "stratos",
          text: "Tactical response failed: " + (err.message || "Unknown error"),
          cite: "System Error Diagnostics",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("stratos_token");
    navigate({ to: "/" });
  };

  if (authenticating) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <span className="w-12 h-12 border-4 border-copper border-t-transparent rounded-full animate-spin" />
        <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-platinum">Calibrating Console Session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ConsoleNav username={user?.username || ""} onSignOut={handleSignOut} />

      <main className="mx-auto max-w-[1440px] px-5 md:px-10 pt-24 md:pt-28 pb-24">
        {/* hero strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="grid md:grid-cols-12 gap-4 md:gap-6"
        >
          <ScoreCard selectedMatch={selectedMatch} />
          <ProfileCard level={level} setLevel={setLevel} lang={lang} />
          <TelemetryCard />
        </motion.div>

        {/* tabs */}
        <div className="mt-10 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {(
            [
              ["timeline", "Decision Timeline"],
              ["tactics", "Tactical Telemetry"],
              ["rules", "Laws & Citations"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-4 py-2 rounded-full text-[13px] border whitespace-nowrap transition ${
                tab === k
                  ? "bg-frost text-black border-frost"
                  : "border-border text-platinum hover:text-frost"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* main grid */}
        <div className="mt-6 grid md:grid-cols-12 gap-4 md:gap-6">
          {/* left/main panel */}
          <div className="md:col-span-8 flex flex-col gap-4 md:gap-6">
            <AnimatePresence mode="wait">
              {tab === "timeline" && (
                <TimelinePanel
                  selectedMatch={selectedMatch}
                  timelineData={timelineData}
                  loading={timelineLoading}
                  matches={filteredMatches}
                  onSelectMatch={setSelectedMatch}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  isSearchFocused={isSearchFocused}
                  onSearchFocusChange={setIsSearchFocused}
                  key="t"
                />
              )}
              {tab === "tactics" && <TacticsPanel key="ta" />}
              {tab === "rules" && <RulesPanel key="r" />}
            </AnimatePresence>

            <FeedPanel />
          </div>

          {/* right companion */}
          <div className="md:col-span-4">
            <Companion
              chat={chat}
              input={input}
              setInput={setInput}
              onSend={send}
              lang={lang}
              level={level}
              chatLoading={chatLoading}
            />
          </div>
        </div>

        {/* footer rail */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <Stat k="xG (live)" v="1.74" sub="BRA 1.74 · ARG 0.91" />
          <Stat k="PPDA" v="6.4" sub="last 10 min · BRA pressing" />
          <Stat k="Possession" v="58%" sub="BRA · settled" />
          <Stat k="Field tilt" v="63%" sub="attacking third share" />
        </motion.div>
      </main>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */

function ConsoleNav({ username, onSignOut }: { username: string; onSignOut: () => void }) {
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-black/70 backdrop-blur-xl border-b border-border">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#f5f5f7" strokeWidth="1.2" />
            <path d="M12 2 L14.5 10 L22 12 L14.5 14 L12 22 L9.5 14 L2 12 L9.5 10 Z" fill="#f5f5f7" opacity="0.9" />
          </svg>
          <span className="text-display text-[16px]">Stratos</span>
          <span className="hidden md:inline ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] border border-border text-platinum">
            console
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-2 text-[12px] text-platinum font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Granite · live · us-south
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[12px] text-platinum font-mono hidden sm:inline">
            {username}
          </span>
          <button
            onClick={onSignOut}
            className="px-3.5 py-1.5 rounded-full border border-border text-[11px] text-platinum hover:text-frost hover:border-white/30 transition font-mono uppercase"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}

/* ─── Cards ─────────────────────────────────────────────────── */

function ScoreCard({ selectedMatch }: { selectedMatch: StatsBombMatch | null }) {
  const homeName = selectedMatch?.home_team.home_team_name || "BRA";
  const awayName = selectedMatch?.away_team.away_team_name || "ARG";
  const homeScore = selectedMatch ? selectedMatch.home_score : 2;
  const awayScore = selectedMatch ? selectedMatch.away_score : 1;
  const stage = selectedMatch?.competition_stage.name || "Live · Friendly";
  const date = selectedMatch?.match_date || "São Paulo";

  return (
    <div className="md:col-span-6 rounded-3xl border border-border bg-obsidian p-6 md:p-7 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(188,113,85,0.12),_transparent_60%)]" />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-eyebrow">{stage} · {date}</div>
          <div className="mt-5 flex items-center gap-5">
            <Team code={homeName.substring(0, 3).toUpperCase()} name={homeName} color="#fde047" />
            <div className="text-display text-[60px] md:text-[80px] leading-none tabular-nums">
              {homeScore}<span className="text-platinum mx-3">—</span>{awayScore}
            </div>
            <Team code={awayName.substring(0, 3).toUpperCase()} name={awayName} color="#7dd3fc" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Team({ code, name, color }: { code: string; name: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-2 max-w-[80px] text-center">
      <span className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center">
        <span className="w-3 h-3 rounded-full" style={{ background: color }} />
      </span>
      <span className="text-display text-[13px] tracking-wider truncate max-w-full" title={name}>{code}</span>
    </div>
  );
}

function ProfileCard({
  level, setLevel, lang,
}: { level: string; setLevel: (l: "Beginner" | "Casual" | "Tactical") => void; lang: string }) {
  return (
    <div className="md:col-span-3 rounded-3xl border border-border bg-carbon p-6">
      <div className="text-eyebrow">Profile</div>
      <div className="mt-3 text-display text-[24px]">Calibrated.</div>
      <div className="text-[12px] text-platinum mt-1">{lang} · {level}</div>

      <div className="mt-5 flex flex-col gap-1.5">
        {(["Beginner", "Casual", "Tactical"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`text-left px-3 py-2 rounded-xl text-[12px] border transition ${
              level === l ? "border-frost bg-white/5" : "border-border hover:border-white/30 text-platinum"
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

function TelemetryCard() {
  return (
    <div className="md:col-span-3 rounded-3xl border border-border bg-carbon p-6 flex flex-col">
      <div className="text-eyebrow">Engine</div>
      <div className="mt-3 text-display text-[24px]">Granite-4-H</div>
      <div className="text-[12px] text-platinum mt-1">retrieval · 12ms · 4 chunks</div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        {["Docling", "Langflow", "MCP"].map((t) => (
          <div key={t} className="rounded-lg border border-border py-2 text-[10px] font-mono uppercase tracking-wider text-platinum">
            {t}
          </div>
        ))}
      </div>
      <div className="mt-auto pt-4 text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400/80">
        ◉ context-fresh
      </div>
    </div>
  );
}

/* ─── Panels ────────────────────────────────────────────────── */

function TimelinePanel({
  selectedMatch,
  timelineData,
  loading,
  matches,
  onSelectMatch,
  searchQuery,
  onSearchChange,
  isSearchFocused,
  onSearchFocusChange,
}: {
  selectedMatch: StatsBombMatch | null;
  timelineData: string;
  loading: boolean;
  matches: StatsBombMatch[];
  onSelectMatch: (m: StatsBombMatch) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isSearchFocused: boolean;
  onSearchFocusChange: (f: boolean) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className="rounded-3xl border border-border bg-obsidian p-6 md:p-8"
    >
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="text-eyebrow">Decision Timeline</div>
          <div className="text-display text-[24px] mt-2">
            {selectedMatch 
              ? `${selectedMatch.home_team.home_team_name} vs ${selectedMatch.away_team.away_team_name}`
              : "Tactical Event Telemetry"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => onSearchFocusChange(true)}
            onBlur={() => setTimeout(() => onSearchFocusChange(false), 200)}
            placeholder="Search matches..."
            className="bg-white/5 border border-transparent rounded-full px-4 py-1.5 text-[12px] text-frost outline-none focus:bg-white/10 focus:border-copper transition max-w-[200px]"
          />
        </div>
      </div>

      {(isSearchFocused || searchQuery) && (
        <div className="mb-6 max-h-[150px] overflow-y-auto border border-border rounded-xl bg-black/40 p-2 space-y-1 no-scrollbar">
          {matches.map((m) => (
            <button
              key={m.match_id}
              onClick={() => {
                onSelectMatch(m);
                onSearchChange("");
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-[12px] hover:bg-white/5 transition flex items-center justify-between"
            >
              <span>{m.home_team.home_team_name} vs {m.away_team.away_team_name}</span>
              <span className="text-[10px] text-platinum font-mono">{m.match_date}</span>
            </button>
          ))}
          {matches.length === 0 && (
            <div className="text-center py-4 text-[12px] text-platinum font-mono">No matches found.</div>
          )}
        </div>
      )}

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <span className="w-8 h-8 border-3 border-copper border-t-transparent rounded-full animate-spin" />
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-platinum">Loading StatsBomb Event Streams...</span>
        </div>
      ) : (
        <div className="rounded-2xl bg-black/50 border border-border p-6 font-mono text-[13px] leading-[1.6] text-platinum overflow-x-auto whitespace-pre-wrap">
          {timelineData || "Select a match and query timeline to see details."}
        </div>
      )}
    </motion.div>
  );
}

function TacticsPanel() {

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className="rounded-3xl border border-border bg-obsidian p-6 md:p-8"
    >
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="text-eyebrow">Tactical Telemetry</div>
          <div className="text-display text-[24px] mt-2">Where BRA are winning the pitch.</div>
        </div>
        <div className="text-[11px] font-mono text-platinum uppercase tracking-[0.2em] hidden md:block">heatmap · last 15'</div>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-border bg-pitch/40">
        {/* pitch markings */}
        <svg viewBox="0 0 120 80" className="w-full h-auto">
          <rect x="0.5" y="0.5" width="119" height="79" fill="none" stroke="rgba(255,255,255,0.15)" />
          <line x1="60" y1="0" x2="60" y2="80" stroke="rgba(255,255,255,0.15)" />
          <circle cx="60" cy="40" r="9" fill="none" stroke="rgba(255,255,255,0.15)" />
          <rect x="0.5" y="20" width="16" height="40" fill="none" stroke="rgba(255,255,255,0.15)" />
          <rect x="103.5" y="20" width="16" height="40" fill="none" stroke="rgba(255,255,255,0.15)" />
        </svg>
        {/* heat cells overlay */}
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-8 p-1.5 gap-px">
          {HEATMAP_CELLS.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: v }}
              transition={{ delay: (i % 24) * 0.012, duration: 0.6 }}
              className="rounded-[2px]"
              style={{
                background: `radial-gradient(circle, rgba(253, 224, 71, ${v * 0.75}) 0%, rgba(253, 224, 71, 0) 70%)`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        {[
          ["Half-spaces", "67%"],
          ["Final third entries", "23"],
          ["Switches/min", "1.4"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-border p-3">
            <div className="text-display text-[22px]">{v}</div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-platinum mt-1">{k}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function RulesPanel() {
  const cards = [
    { k: "Law 11", t: "Offside", body: "Offence requires being in an offside position, involved in active play, and gaining advantage." },
    { k: "Law 12", t: "Fouls & misconduct", body: "Denying an obvious goal-scoring opportunity is a sending-off unless it's a genuine attempt to play the ball." },
    { k: "Law 14", t: "The penalty kick", body: "Goalkeeper must have at least part of one foot touching, in line with, or behind the goal line at the moment of the kick." },
    { k: "Law 5", t: "VAR protocol", body: "Limited to clear and obvious errors: goal/no goal, penalty/no penalty, direct red card, mistaken identity." },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className="grid sm:grid-cols-2 gap-4"
    >
      {cards.map((c, i) => (
        <motion.div
          key={c.k}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
          className="rounded-2xl border border-border bg-obsidian p-6 hover:border-white/25 transition group"
        >
          <div className="text-eyebrow text-copper">{c.k}</div>
          <div className="text-display text-[24px] mt-2 group-hover:text-copper transition">{c.t}</div>
          <div className="text-[13px] text-platinum mt-2 leading-[1.55]">{c.body}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function FeedPanel() {
  return (
    <div className="rounded-3xl border border-border bg-carbon p-6 md:p-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="text-eyebrow">Reasoned feed</div>
          <div className="text-display text-[22px] mt-2">Not what happened. Why.</div>
        </div>
        <span className="text-[11px] font-mono text-emerald-400/80 uppercase tracking-[0.2em]">streaming</span>
      </div>

      <div className="space-y-3">
        {TACTICAL_FEED.map((f, i) => (
          <motion.div
            key={f.min}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            className="group grid grid-cols-[60px_1fr] gap-5 p-4 rounded-xl border border-border hover:bg-black/40 transition"
          >
            <div className="text-display text-[20px] text-copper tabular-nums">{f.min}</div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-platinum">{f.tag}</div>
              <div className="text-[14px] mt-1.5 leading-[1.5]">{f.body}</div>
              <div className="mt-2 text-[10px] font-mono uppercase tracking-[0.18em] text-copper">↳ {f.src}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Companion ─────────────────────────────────────────────── */

function Companion({
  chat, input, setInput, onSend, lang, level, chatLoading
}: {
  chat: ChatMsg[];
  input: string;
  setInput: (s: string) => void;
  onSend: (s?: string) => void;
  lang: string;
  level: string;
  chatLoading: boolean;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [chat, chatLoading]);

  const suggestions = useMemo(
    () => [
      "Why the 4-2-3-1 shift?",
      "Explain xT in one line.",
      "Was that offside?",
      "What is PPDA?",
    ],
    [],
  );

  return (
    <div className="rounded-3xl border border-border bg-obsidian h-full flex flex-col min-h-[640px] overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[13px]">Companion</span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-platinum">{lang} · {level}</span>
      </div>

      <div ref={scroller} className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {chat.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`max-w-[88%] ${m.role === "user" ? "self-end" : "self-start"}`}
            >
              <div
                className={`px-4 py-3 text-[14px] leading-[1.5] rounded-2xl ${
                  m.role === "user"
                    ? "bg-frost text-black rounded-br-md"
                    : "bg-black/50 border border-border rounded-bl-md"
                }`}
              >
                {m.text}
              </div>
              {m.cite && m.role === "stratos" && (
                <div className="mt-1.5 ml-1 text-[10px] font-mono uppercase tracking-[0.18em] text-copper">
                  ↳ {m.cite}
                </div>
              )}
            </motion.div>
          ))}
          {chatLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="self-start max-w-[88%] px-5 py-4 rounded-3xl rounded-bl-md bg-black/50 border border-border"
            >
              <div className="flex gap-1.5 items-center py-1">
                <span className="w-2 h-2 bg-copper rounded-full animate-dot-flow [animation-delay:-0.32s]" />
                <span className="w-2 h-2 bg-copper rounded-full animate-dot-flow [animation-delay:-0.16s]" />
                <span className="w-2 h-2 bg-copper rounded-full animate-dot-flow" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-5 pt-3 pb-2 flex flex-wrap gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            disabled={chatLoading}
            onClick={() => onSend(s)}
            className="px-3 py-1.5 rounded-full text-[11px] border border-border text-platinum hover:text-frost hover:border-white/30 transition disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="px-4 py-4 border-t border-border flex items-center gap-2">
        <input
          value={input}
          disabled={chatLoading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder={chatLoading ? "Stratos is thinking..." : "Ask about any moment…"}
          className="flex-1 bg-white/5 border border-transparent px-4 py-2.5 rounded-full text-[13px] placeholder:text-platinum outline-none focus:bg-white/10 focus:border-copper transition disabled:opacity-50"
        />
        <button
          onClick={() => onSend()}
          disabled={chatLoading || !input.trim()}
          className="w-10 h-10 rounded-full bg-copper text-white flex items-center justify-center hover-lift transition disabled:opacity-50"
          aria-label="Send"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12 H19 M13 6 L19 12 L13 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function Stat({ k, v, sub }: { k: string; v: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-border bg-obsidian p-5">
      <div className="text-eyebrow">{k}</div>
      <div className="text-display text-[34px] mt-2 tabular-nums">{v}</div>
      <div className="text-[11px] text-platinum mt-1">{sub}</div>
    </div>
  );
}

