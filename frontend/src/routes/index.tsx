import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { SoccerBall } from "@/components/SoccerBall";
import { Onboarding } from "@/components/Onboarding";
import { getCurrentUser } from "../utils/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stratos — Football, Understood." },
      {
        name: "description",
        content:
          "An AI football companion that explains the match in your language, at your level. Grounded in the Laws of the Game, powered by IBM Granite.",
      },
      { property: "og:title", content: "Stratos — Football, Understood." },
      {
        property: "og:description",
        content:
          "Two surfaces, one engine. A tactical decision timeline and an adaptive multilingual chat companion.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [userOnboarded, setUserOnboarded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check url search params
    const params = new URLSearchParams(window.location.search);
    if (params.get("calibrate") === "true" || params.get("startOnboarding") === "true") {
      setOnboardOpen(true);
    }

    // Check token and onboarding state
    const token = localStorage.getItem("stratos_token");
    if (token) {
      getCurrentUser(token)
        .then((user) => {
          if (user.team && user.level && user.language) {
            setUserOnboarded(true);
          }
        })
        .catch(() => {
          localStorage.removeItem("stratos_token");
        });
    }
  }, []);

  const handleStart = () => {
    if (userOnboarded) {
      navigate({ to: "/dashboard" });
    } else {
      setOnboardOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Nav onStart={handleStart} userOnboarded={userOnboarded} />
      <Hero onStart={handleStart} userOnboarded={userOnboarded} />
      <StatBand />
      <Manifesto />
      <SurfaceOne />
      <SurfaceTwo />
      <LiveFeed />
      <Architecture />
      <Stack />
      <Alignment />
      <FinalCTA onStart={handleStart} userOnboarded={userOnboarded} />
      <Footer />
      <Onboarding open={onboardOpen} onClose={() => setOnboardOpen(false)} />
    </div>
  );
}

/* ─────────────────────────────────────────────  NAV  */

function Nav({ onStart, userOnboarded }: { onStart: () => void; userOnboarded: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-black/70 backdrop-blur-xl border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <Mark />
          <span className="text-display text-[17px] tracking-tight">Stratos</span>
        </a>
        <nav className="hidden md:flex items-center gap-9 text-[13px] text-platinum">
          {[
            ["Manifesto", "#manifesto"],
            ["Timeline", "#timeline"],
            ["Companion", "#companion"],
            ["Engine", "#engine"],
            ["Stack", "#stack"],
          ].map(([l, h]) => (
            <a key={h} href={h} className="hover:text-frost transition-colors">
              {l}
            </a>
          ))}
        </nav>
        <button
          onClick={onStart}
          className="px-5 py-2 rounded-full bg-copper text-white text-[13px] font-medium hover-lift"
        >
          {userOnboarded ? "Console" : "Get started"}
        </button>
      </div>
    </header>
  );
}


function Mark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#f5f5f7" strokeWidth="1.2" />
      <path d="M12 2 L14.5 10 L22 12 L14.5 14 L12 22 L9.5 14 L2 12 L9.5 10 Z" fill="#f5f5f7" opacity="0.9" />
    </svg>
  );
}

/* ─────────────────────────────────────────────  HERO  */

function Hero({ onStart, userOnboarded }: { onStart: () => void; userOnboarded: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative h-[150vh] w-full flex flex-col justify-start">
      {/* ball lives in sticky container */}
      <div className="sticky top-0 h-screen w-full pointer-events-none z-0 overflow-hidden">
        <SoccerBall />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_50%,_rgba(188,113,85,0.14),_transparent_55%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/70 to-transparent" />
      </div>

      {/* scrollable text content aligned to viewport height */}
      <div className="absolute inset-x-0 top-0 h-screen flex items-center pointer-events-none z-10">
        <motion.div
          style={{ y: titleY, opacity: titleOpacity }}
          className="pointer-events-auto mx-auto max-w-[1440px] w-full px-6 md:px-12 pt-24 grid md:grid-cols-12 gap-8"
        >
          <div className="md:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-eyebrow mb-6"
            >
              An IBM Granite companion · matchday-grade reasoning
            </motion.div>
            <h1 className="text-hero text-[14vw] md:text-[8.6vw] leading-[0.86] max-w-[14ch]">
              <SplitWord word="Football," delay={0.1} />
              <br />
              <span className="text-platinum"><SplitWord word="understood." delay={0.45} /></span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.8 }}
              className="mt-8 max-w-[540px] text-[17px] md:text-[19px] leading-[1.55] text-platinum"
            >
              Two billion fans, the same ninety minutes, ninety different matches.
              Stratos meets every viewer in their language, at their depth — grounded
              in the Laws of the Game and live event data, not commentary tropes.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15, duration: 0.7 }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <button
                onClick={onStart}
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-copper text-white text-[14px] font-medium hover-lift"
              >
                {userOnboarded ? "Enter Console" : "Calibrate Stratos"}
                <span className="transition-transform group-hover:translate-x-0.5"><Arrow /></span>
              </button>
              <a
                href="#timeline"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border text-[14px] text-platinum hover:text-frost hover:bg-white/5 transition"
              >
                See it in action
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              className="mt-14 flex items-center gap-6 text-[11px] font-mono uppercase tracking-[0.22em] text-platinum"
            >
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> live
              </span>
              <span>· IFAB-grounded</span>
              <span className="hidden md:inline">· WatsonX · us-south</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator anchored to fold */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-eyebrow flex flex-col items-center gap-2 pointer-events-none"
        >
          Scroll to break the ball
          <motion.span
            animate={{ scaleY: [0.3, 1, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="block w-px h-10 bg-gradient-to-b from-platinum to-transparent origin-top"
          />
        </motion.div>
      </div>
    </section>
  );
}

function SplitWord({ word, delay = 0 }: { word: string; delay?: number }) {
  return (
    <span className="inline-block">
      {word.split("").map((c, i) => (
        <motion.span
          key={i}
          initial={{ y: "0.9em", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: delay + i * 0.035, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block"
        >
          {c === " " ? "\u00A0" : c}
        </motion.span>
      ))}
    </span>
  );
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12 H19 M13 6 L19 12 L13 18" />
    </svg>
  );
}

/* ─────────────────────────────────────────────  STAT BAND  */

function StatBand() {
  const stats = [
    ["5B", "fans worldwide"],
    ["211", "federations"],
    ["17", "laws of the game"],
    ["1", "engine, two surfaces"],
  ];
  return (
    <section className="border-y border-border bg-carbon">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 py-10 grid grid-cols-2 md:grid-cols-4">
        {stats.map(([n, l], i) => (
          <Reveal key={i} delay={i * 0.08}>
            <div className="md:border-l border-border md:pl-8 py-2">
              <div className="text-display text-[44px] md:text-[56px]">{n}</div>
              <div className="text-[12px] text-platinum uppercase tracking-[0.2em] mt-1">{l}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────  MANIFESTO  */

function Manifesto() {
  return (
    <section id="manifesto" className="relative py-40 md:py-56">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <Reveal>
          <div className="text-eyebrow mb-12">/ The manifesto</div>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="text-display text-[34px] md:text-[56px] leading-[1.08] max-w-[18ch]">
            A linesman raises a flag.{" "}
            <span className="text-platinum">
              A new fan has no idea why. A coach swaps a striker for a holding midfielder in the 74th minute.
            </span>{" "}
            A casual fan never registers it happened.{" "}
            <span className="text-platinum">
              A tactical fan watches the same moment and waits forever for someone to explain
            </span>{" "}
            <span className="text-copper">why.</span>
          </p>
        </Reveal>
        <Reveal delay={0.35}>
          <div className="mt-20 grid md:grid-cols-3 gap-10 max-w-[900px]">
            <Pillar n="01" t="It explains." d="Not what happened. Why." />
            <Pillar n="02" t="It adapts." d="To your language. To your depth." />
            <Pillar n="03" t="It cites." d="Every answer points to its source." />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Pillar({ n, t, d }: { n: string; t: string; d: string }) {
  return (
    <div className="border-t border-border pt-6">
      <div className="text-eyebrow">{n}</div>
      <div className="text-display text-[28px] mt-4">{t}</div>
      <div className="text-[14px] text-platinum mt-2">{d}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────  SURFACE 1 · TIMELINE  */

type Event = {
  min: number;
  type: "goal" | "yellow" | "red" | "sub" | "tactic";
  team: "BRA" | "ARG";
  label: string;
  player: string;
  why: string;
  source: string;
};

const MATCH_EVENTS: Event[] = [
  {
    min: 8,
    type: "goal",
    team: "BRA",
    label: "Goal",
    player: "Vinícius Jr",
    why: "Brazil pressed Argentina's right-back into a hurried clearance. Vinícius drifted central — the channel the holding midfielder had vacated to cover — and finished low across goal.",
    source: "StatsBomb · pass map 0'–8'",
  },
  {
    min: 23,
    type: "yellow",
    team: "ARG",
    label: "Yellow",
    player: "De Paul",
    why: "Tactical foul to stop a 4-on-3 break after a turnover in Argentina's half. Worth the card to reset the defensive block.",
    source: "IFAB Law 12 · §3",
  },
  {
    min: 41,
    type: "goal",
    team: "ARG",
    label: "Goal",
    player: "Messi",
    why: "Argentina shifted to a back three on the ball. Messi dropped between lines into the half-space Brazil's double pivot couldn't cover. Curled it past the near post.",
    source: "Granite tactical analysis",
  },
  {
    min: 58,
    type: "sub",
    team: "BRA",
    label: "Sub",
    player: "Casemiro → Bruno G.",
    why: "Brazil needed to control midfield tempo, not destroy. Bruno Guimarães offers progressive passing Casemiro doesn't — a clear signal to play through, not over.",
    source: "Team profile · BRA depth chart",
  },
  {
    min: 67,
    type: "tactic",
    team: "BRA",
    label: "Shift",
    player: "4-3-3 → 4-2-3-1",
    why: "Added a number 10 to break Argentina's first line of press. The wide forwards stayed high to pin the fullbacks; the central press became a trap.",
    source: "Formation deltas · 65'–70'",
  },
  {
    min: 78,
    type: "red",
    team: "ARG",
    label: "Red",
    player: "Otamendi",
    why: "Second yellow — late challenge from behind on the last defender's blindside. Denied an obvious goal-scoring opportunity given the angle and speed.",
    source: "IFAB Law 12 · DOGSO",
  },
  {
    min: 89,
    type: "goal",
    team: "BRA",
    label: "Goal",
    player: "Rodrygo",
    why: "Ten men, tired legs. Brazil overloaded the left and switched fast to a 2-on-1 on the right. Simple cross, free header — the back-four spacing had collapsed.",
    source: "StatsBomb · xG 0.74",
  },
];

function SurfaceOne() {
  const [active, setActive] = useState(MATCH_EVENTS[4]);
  return (
    <section id="timeline" className="relative py-32 md:py-44 bg-carbon border-y border-border">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-16">
          <Reveal>
            <div>
              <div className="text-eyebrow mb-5">Surface 01 · The Decision Timeline</div>
              <h2 className="text-display text-[40px] md:text-[64px] leading-[0.95] max-w-[16ch]">
                Tap any moment.
                <br />
                <span className="text-platinum">Get the reason it happened.</span>
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="text-[14px] text-platinum max-w-[320px] leading-[1.55]">
              Goals, cards, substitutions, formation shifts — plotted across 90+.
              Granite reasons from real event data, not commentary.
            </div>
          </Reveal>
        </div>

        <Reveal>
          <div className="rounded-[28px] border border-border bg-black overflow-hidden">
            {/* scoreboard */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-border">
              <div className="flex items-center gap-6">
                <TeamBadge code="BRA" color="#fde047" />
                <div className="text-display text-[32px] tabular-nums">2 — 1</div>
                <TeamBadge code="ARG" color="#7dd3fc" reverse />
              </div>
              <div className="text-eyebrow hidden md:block">Friendly · São Paulo</div>
            </div>

            {/* timeline track */}
            <div className="px-8 md:px-12 pt-12 pb-8">
              <Timeline events={MATCH_EVENTS} active={active} onSelect={setActive} />
            </div>

            {/* explanation panel */}
            <div className="px-8 md:px-12 pb-10 pt-2 grid md:grid-cols-12 gap-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.min}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  className="col-span-12 grid md:grid-cols-12 gap-6"
                >
                  <div className="md:col-span-3 border-t border-border pt-6">
                    <div className="text-eyebrow">Minute {active.min}'</div>
                    <div className="text-display text-[28px] mt-3">{active.label}</div>
                    <div className="text-[14px] text-platinum mt-1">{active.player}</div>
                    <div className="inline-block mt-3 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.18em] font-mono"
                         style={{ background: active.team === "BRA" ? "#fde04722" : "#7dd3fc22", color: active.team === "BRA" ? "#fde047" : "#7dd3fc" }}>
                      {active.team}
                    </div>
                  </div>
                  <div className="md:col-span-9 border-t border-border pt-6">
                    <div className="text-eyebrow">Why it happened</div>
                    <p className="mt-3 text-[18px] md:text-[20px] leading-[1.5] text-frost/90 max-w-[64ch]">
                      {active.why}
                    </p>
                    <div className="mt-5 inline-flex items-center gap-2 text-[11px] font-mono text-copper uppercase tracking-[0.18em]">
                      <span className="w-1 h-1 rounded-full bg-copper" /> Source — {active.source}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function TeamBadge({ code, color, reverse }: { code: string; color: string; reverse?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${reverse ? "flex-row-reverse" : ""}`}>
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      <span className="text-display text-[20px]">{code}</span>
    </div>
  );
}

function Timeline({
  events,
  active,
  onSelect,
}: {
  events: Event[];
  active: Event;
  onSelect: (e: Event) => void;
}) {
  const colorFor = (t: Event["type"]) =>
    t === "goal" ? "#f5f5f7" : t === "red" ? "#ef4444" : t === "yellow" ? "#facc15" : "#bc7155";
  return (
    <div className="relative">
      <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10" />
      <div className="absolute left-0 right-0 top-1/2 flex justify-between">
        {[0, 15, 30, 45, 60, 75, 90].map((m) => (
          <div key={m} className="flex flex-col items-center -translate-y-1/2">
            <div className="w-px h-2 bg-white/15" />
            <div className="text-[10px] font-mono text-platinum mt-1">{m}'</div>
          </div>
        ))}
      </div>
      <div className="relative h-16">
        {events.map((e) => {
          const isActive = e.min === active.min;
          const left = `${(e.min / 90) * 100}%`;
          return (
            <button
              key={e.min}
              onClick={() => onSelect(e)}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group"
              style={{ left }}
              aria-label={`${e.label} at minute ${e.min}`}
            >
              <span
                className={`block transition-all duration-300 ${
                  isActive ? "w-4 h-4" : "w-2.5 h-2.5 group-hover:w-3.5 group-hover:h-3.5"
                } rounded-full`}
                style={{
                  background: colorFor(e.type),
                  boxShadow: isActive ? `0 0 24px ${colorFor(e.type)}` : "none",
                }}
              />
              <span
                className={`absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-wider whitespace-nowrap transition-opacity ${
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
                style={{ color: colorFor(e.type) }}
              >
                {e.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────  SURFACE 2 · CHAT  */

const CHAT_DEMOS: Record<string, { ask: string; answer: string; cite: string }[]> = {
  English: [
    {
      ask: "Why was that offside?",
      answer:
        "At the moment the pass was played, the attacker was ahead of the second-to-last defender. Being level is onside — being beyond it isn't.",
      cite: "IFAB Law 11 · §1",
    },
    {
      ask: "Why did Guardiola switch to a back three?",
      answer:
        "They were losing the midfield numbers battle. Dropping a center-back into midfield builds a 3-2 base in possession, frees the full-backs higher, and breaks the opponent's two-man press.",
      cite: "Granite tactical reasoning",
    },
  ],
  Português: [
    {
      ask: "Por que foi impedimento?",
      answer:
        "No momento do passe, o atacante estava à frente do penúltimo defensor. Estar na linha é legal — estar além dela, não.",
      cite: "IFAB Lei 11 · §1",
    },
  ],
  Español: [
    {
      ask: "¿Por qué fue fuera de juego?",
      answer:
        "En el momento del pase, el atacante estaba por delante del penúltimo defensor. Estar en línea es legal — estar por delante, no.",
      cite: "IFAB Regla 11 · §1",
    },
  ],
  Deutsch: [
    {
      ask: "Warum war das Abseits?",
      answer:
        "Im Moment der Ballabgabe stand der Angreifer vor dem vorletzten Verteidiger. Auf gleicher Höhe ist erlaubt — davor nicht.",
      cite: "IFAB Regel 11 · §1",
    },
  ],
};

function SurfaceTwo() {
  const langs = Object.keys(CHAT_DEMOS);
  const [lang, setLang] = useState("English");
  const [level, setLevel] = useState<"Beginner" | "Casual" | "Tactical">("Casual");
  const demo = CHAT_DEMOS[lang][0];
  return (
    <section id="companion" className="relative py-32 md:py-44">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-16">
          <Reveal>
            <div>
              <div className="text-eyebrow mb-5">Surface 02 · The Companion</div>
              <h2 className="text-display text-[40px] md:text-[64px] leading-[0.95] max-w-[16ch]">
                Your language.
                <br />
                <span className="text-platinum">Your level.</span>
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="text-[14px] text-platinum max-w-[320px] leading-[1.55]">
              Every reply is generated by Granite at the depth you asked for,
              in the tongue you chose, and cites the Law or data behind it.
            </div>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          <Reveal className="md:col-span-5">
            <div className="rounded-[28px] border border-border bg-obsidian p-8 h-full">
              <div className="text-eyebrow mb-6">Controls</div>

              <div className="mb-8">
                <div className="text-[12px] text-platinum mb-3 uppercase tracking-wider">Language</div>
                <div className="flex flex-wrap gap-2">
                  {langs.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`px-4 py-2 rounded-full text-[13px] border transition ${
                        lang === l
                          ? "bg-frost text-black border-frost"
                          : "border-border hover:border-white/30"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <div className="text-[12px] text-platinum mb-3 uppercase tracking-wider">Fluency</div>
                <div className="flex gap-2">
                  {(["Beginner", "Casual", "Tactical"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`flex-1 px-3 py-2.5 rounded-2xl text-[13px] border transition ${
                        level === l
                          ? "bg-frost text-black border-frost"
                          : "border-border hover:border-white/30"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hairline my-6" />
              <div className="text-[12px] text-platinum leading-[1.6]">
                Profile saved on-device. Every response adapts to these signals
                — including formation depth, vocabulary, and which Law clauses
                Stratos chooses to cite.
              </div>
            </div>
          </Reveal>

          <Reveal className="md:col-span-7" delay={0.15}>
            <div className="rounded-[28px] border border-border bg-black overflow-hidden h-full flex flex-col min-h-[460px]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[13px]">Stratos · live</span>
                </div>
                <span className="text-eyebrow">{lang}</span>
              </div>

              <div className="flex-1 p-6 md:p-8 flex flex-col gap-4 justify-end">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={lang + level}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col gap-4"
                  >
                    <div className="self-end max-w-[80%] px-5 py-3 rounded-3xl rounded-br-md bg-frost text-black text-[14px]">
                      {demo.ask}
                    </div>
                    <div className="self-start max-w-[88%] px-5 py-4 rounded-3xl rounded-bl-md bg-obsidian border border-border">
                      <div className="text-[15px] leading-[1.55] text-frost/90">
                        {demo.answer}
                      </div>
                      <div className="mt-3 inline-flex items-center gap-2 text-[10px] font-mono text-copper uppercase tracking-[0.18em]">
                        <span className="w-1 h-1 rounded-full bg-copper" /> {demo.cite}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="px-6 py-4 border-t border-border flex items-center gap-3">
                <div className="flex-1 px-4 py-2.5 rounded-full bg-white/5 text-[13px] text-platinum">
                  Ask Stratos anything…
                </div>
                <button className="w-10 h-10 rounded-full bg-frost text-black flex items-center justify-center">
                  <Arrow />
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────  LIVE FEED  */

const FEED = [
  { min: "12'", t: "Shot blocked", body: "Defensive block held shape. xG before the block: 0.18." },
  { min: "27'", t: "Press triggered", body: "Wide forward stepped up — a cue for the whole line. Forced the back-pass." },
  { min: "44'", t: "Yellow card", body: "Tactical foul on the counter. Risk-reward weighted to the team, not the player." },
  { min: "61'", t: "Substitution", body: "Energy off the bench. Shape stays 4-3-3, but the press resets at 92% intensity." },
  { min: "78'", t: "Goal", body: "Switch of play to the weak side. Two-touch finish. Back-line was four metres too narrow." },
];

function LiveFeed() {
  return (
    <section className="relative py-32 md:py-44 bg-obsidian border-y border-border overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <Reveal>
              <div className="text-eyebrow mb-5">Live commentary, re-imagined</div>
              <h2 className="text-display text-[40px] md:text-[60px] leading-[0.95]">
                Not what happened.
                <br />
                <span className="text-copper">Why.</span>
              </h2>
              <p className="mt-8 text-[16px] text-platinum max-w-[420px] leading-[1.6]">
                Broadcast tells you a card was shown. Stratos tells you the foul
                bought five seconds of recovery for a defensive line that was
                two metres out of position.
              </p>
            </Reveal>
          </div>
          <div className="md:col-span-7">
            <div className="space-y-3">
              {FEED.map((f, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="group flex gap-6 items-start p-6 rounded-2xl border border-border bg-black hover:bg-carbon transition">
                    <div className="text-display text-[24px] tabular-nums text-copper min-w-[60px]">
                      {f.min}
                    </div>
                    <div>
                      <div className="text-display text-[20px]">{f.t}</div>
                      <div className="text-[14px] text-platinum mt-2 leading-[1.55]">{f.body}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────  ARCHITECTURE  */

const ARCH = [
  { layer: "Frontend", node: "Vite · React · D3", note: "Timeline & companion surfaces" },
  { layer: "API", node: "FastAPI", note: "/chat · /match/current · /timeline" },
  { layer: "Orchestration", node: "Langflow + Context Forge", note: "MCP SSE gateway · :4444" },
  { layer: "Generation", node: "IBM Granite-4-H-Small", note: "WatsonX · us-south" },
  { layer: "Retrieval", node: "ChromaDB", note: "fifa_laws · team_profiles" },
  { layer: "Ingestion", node: "Docling HybridChunker", note: "max_tokens=512 · merge_peers" },
  { layer: "Tools", node: "FastMCP · :8012", note: "StatsBomb · Football-Data" },
];

function Architecture() {
  return (
    <section id="engine" className="relative py-32 md:py-44">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <div className="grid md:grid-cols-12 gap-12 mb-20">
          <Reveal className="md:col-span-5">
            <div className="text-eyebrow mb-5">/ The engine</div>
            <h2 className="text-display text-[40px] md:text-[64px] leading-[0.95]">
              Seven layers.
              <br />
              <span className="text-platinum">One engine.</span>
            </h2>
          </Reveal>
          <Reveal className="md:col-span-6 md:col-start-7" delay={0.15}>
            <p className="text-[17px] text-platinum leading-[1.6] mt-2">
              Both surfaces share the same ingestion pipeline, retrieval layer,
              orchestration, and generation. The fan never picks the rules tool
              or the chat tool — Stratos is one product.
            </p>
          </Reveal>
        </div>

        <div className="border-y border-border">
          {ARCH.map((r, i) => (
            <Reveal key={r.layer} delay={i * 0.04}>
              <div className="group grid grid-cols-12 gap-4 px-2 md:px-6 py-7 border-t border-border first:border-t-0 hover:bg-carbon transition">
                <div className="col-span-2 md:col-span-1 font-mono text-[12px] text-platinum self-center">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="col-span-10 md:col-span-3 text-eyebrow self-center">
                  {r.layer}
                </div>
                <div className="col-span-12 md:col-span-5 text-display text-[24px] md:text-[28px] group-hover:text-copper transition-colors">
                  {r.node}
                </div>
                <div className="col-span-12 md:col-span-3 font-mono text-[12px] text-platinum self-center md:text-right">
                  {r.note}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────  STACK  */

const STACK = [
  { name: "Granite", role: "Generative reasoning — adaptive tone and depth" },
  { name: "Docling", role: "Heading-aware chunking of the Laws and profiles" },
  { name: "Langflow", role: "Flow orchestration across data and prompts" },
  { name: "Context Forge", role: "MCP federation gateway for tools" },
  { name: "IBM Bob", role: "Where access allows — observability and tracing" },
];

function Stack() {
  return (
    <section id="stack" className="relative py-32 md:py-44 bg-carbon border-y border-border text-foreground">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <Reveal>
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-platinum mb-5">
            / The IBM stack
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-display text-[44px] md:text-[80px] leading-[0.95] max-w-[14ch]">
            All five tools.
            <br />
            <span className="text-platinum">None decorative.</span>
          </h2>
        </Reveal>

        <div className="mt-20 border-t border-border">
          {STACK.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.06}>
              <div className="group grid grid-cols-12 gap-6 py-10 border-b border-border hover:bg-white/[0.02] transition px-2">
                <div className="col-span-2 md:col-span-1 font-mono text-[12px] text-platinum self-center">
                  ◆ {String(i + 1).padStart(2, "0")}
                </div>
                <div className="col-span-10 md:col-span-5 text-display text-[36px] md:text-[52px] leading-[0.95] group-hover:text-copper transition-colors">
                  {t.name}
                </div>
                <div className="col-span-12 md:col-span-6 text-[16px] md:text-[18px] text-platinum self-center leading-[1.5]">
                  {t.role}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────  ALIGNMENT  */

function Alignment() {
  const rows: [string, string][] = [
    ["AI as a core, meaningful component", "Every output generated by Granite, grounded in retrieved context"],
    ["At least one required IBM tool", "All five: Granite, Docling, Langflow, Context Forge, Bob"],
    ["Not a pure prediction engine", "Stratos explains. It never forecasts outcomes."],
    ["Not opaque AI", "Every response cites the Law or data source it drew from"],
    ["Understanding & Explanation", "The Tactical Decision Timeline"],
    ["Fan & Learning Experiences", "The Adaptive Multilingual Companion"],
  ];
  return (
    <section className="relative py-32 md:py-44">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <Reveal>
          <div className="text-eyebrow mb-5">/ Alignment</div>
          <h2 className="text-display text-[40px] md:text-[64px] leading-[0.95] max-w-[18ch]">
            Every requirement, on the record.
          </h2>
        </Reveal>
        <div className="mt-16 border-t border-border">
          {rows.map(([req, ans], i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="grid grid-cols-12 gap-6 py-7 border-b border-border">
                <div className="col-span-12 md:col-span-1 font-mono text-[12px] text-platinum">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="col-span-12 md:col-span-5 text-[17px] md:text-[20px] text-frost/90">
                  {req}
                </div>
                <div className="col-span-12 md:col-span-6 text-[15px] text-platinum leading-[1.55] flex items-start gap-3">
                  <span className="text-copper mt-1.5">→</span>
                  <span>{ans}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────  FINAL CTA  */

function FinalCTA({ onStart, userOnboarded }: { onStart: () => void; userOnboarded: boolean }) {
  return (
    <section className="relative py-32 md:py-56 bg-obsidian border-t border-border overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,_rgba(188,113,85,0.22),_transparent_60%)]" />
      <div className="relative mx-auto max-w-[1200px] px-6 md:px-12 text-center">
        <Reveal>
          <div className="text-eyebrow mb-8">Get started</div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-hero text-[56px] md:text-[140px] leading-[0.86]">
            Step onto
            <br />
            <span className="text-copper">the pitch.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.25}>
          <p className="max-w-[520px] mx-auto text-[17px] text-platinum leading-[1.55] mt-10">
            Pick a team, set your fluency, choose a language.
            Three taps and Stratos is calibrated.
          </p>
        </Reveal>
        <Reveal delay={0.35}>
          <div className="flex items-center justify-center gap-3 mt-12 flex-wrap">
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-copper text-white text-[15px] font-medium hover-lift"
            >
              {userOnboarded ? "Enter Console" : "Calibrate Stratos"}
              <Arrow />
            </button>
            <a
              href="#engine"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-border text-[15px] text-platinum hover:text-frost hover:bg-white/5 transition"
            >
              Read the architecture
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────  FOOTER  */

function Footer() {
  return (
    <footer className="border-t border-border py-14">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Mark />
              <span className="text-display text-[20px]">Stratos</span>
            </div>
            <div className="text-display text-[28px] md:text-[36px] max-w-[14ch] leading-[1]">
              Football, understood.
            </div>
          </div>
          <div className="grid grid-cols-3 gap-12 text-[13px]">
            {[
              ["Product", ["Timeline", "Companion", "Live feed"]],
              ["Engine", ["Architecture", "Stack", "Sources"]],
              ["About", ["IBM AI Builders", "Challenge brief", "Repo"]],
            ].map(([h, items]) => (
              <div key={h as string}>
                <div className="text-eyebrow mb-4">{h as string}</div>
                <ul className="space-y-2">
                  {(items as string[]).map((i) => (
                    <li key={i} className="text-platinum hover:text-frost transition cursor-pointer">
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="hairline mt-12" />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-[12px] text-platinum">
          <div>© {new Date().getFullYear()} Stratos · An IBM Granite companion.</div>
          <div className="font-mono uppercase tracking-[0.2em]">v0.1 · preview</div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────  REVEAL  */

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  // Stagger layout entry by mapping delay offsets directly to scroll positions
  const startOffset = Math.min(0.25, delay * 0.4);
  const endOffset = 0.5 + Math.min(0.35, delay * 0.4);

  const opacity = useTransform(scrollYProgress, [startOffset, endOffset], [0, 1]);
  const y = useTransform(scrollYProgress, [startOffset, endOffset], [20, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
