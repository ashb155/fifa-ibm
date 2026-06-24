import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "@tanstack/react-router";

const TEAMS = [
  { code: "BRA", name: "Brazil", color: "#fde047" },
  { code: "ARG", name: "Argentina", color: "#7dd3fc" },
  { code: "ESP", name: "Spain", color: "#ef4444" },
  { code: "FRA", name: "France", color: "#3b82f6" },
  { code: "GER", name: "Germany", color: "#f5f5f7" },
  { code: "ENG", name: "England", color: "#ffffff" },
  { code: "POR", name: "Portugal", color: "#16a34a" },
  { code: "ITA", name: "Italy", color: "#1d4ed8" },
  { code: "NED", name: "Netherlands", color: "#fb923c" },
  { code: "JPN", name: "Japan", color: "#0f172a" },
  { code: "MEX", name: "Mexico", color: "#16a34a" },
  { code: "USA", name: "United States", color: "#dc2626" },
];

const LEVELS = [
  {
    key: "beginner",
    label: "Beginner",
    note: "Explain the rules. I'm new to football.",
  },
  {
    key: "casual",
    label: "Casual",
    note: "I know the basics. Skip them.",
  },
  {
    key: "tactical",
    label: "Tactical",
    note: "Talk formations, pressing, xG, transitions.",
  },
];

const LANGUAGES = [
  "English",
  "Português",
  "Español",
  "Deutsch",
  "Français",
  "Italiano",
  "日本語",
  "العربية",
  "Türkçe",
  "हिन्दी",
];

import { registerUser, loginUser, saveUserProfile } from "../utils/api";

export function Onboarding({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [lang, setLang] = useState<string>("English");
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(0);
        setUsername("");
        setPassword("");
        setAuthError("");
      }, 300);
    }
  }, [open]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const canNext =
    (step === 1 && team) ||
    (step === 2 && level) ||
    step === 3;

  const next = () => (step < 3 ? setStep(step + 1) : finish());

  const finish = async () => {
    setLoading(true);
    const token = localStorage.getItem("stratos_token");
    if (token && team && level && lang) {
      try {
        await saveUserProfile(token, team, level, lang);
      } catch (err) {
        console.error("Failed to save profile:", err);
      }
    }
    setLoading(false);
    onClose();
    setTimeout(() => navigate({ to: "/dashboard" }), 250);
  };

  const handleAuthSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError("");
    setLoading(true);
    try {
      if (isSignUp) {
        await registerUser(username, password);
        const loginRes = await loginUser(username, password);
        localStorage.setItem("stratos_token", loginRes.access_token);
        setStep(1); // Proceed to Team Select
      } else {
        const loginRes = await loginUser(username, password);
        localStorage.setItem("stratos_token", loginRes.access_token);
        
        // If user already has a complete profile, enter console directly
        if (loginRes.user.team && loginRes.user.level && loginRes.user.language) {
          onClose();
          setTimeout(() => navigate({ to: "/dashboard" }), 250);
        } else {
          // prefill completed fields and move to team select
          if (loginRes.user.team) setTeam(loginRes.user.team);
          if (loginRes.user.level) setLevel(loginRes.user.level as any);
          if (loginRes.user.language) setLang(loginRes.user.language);
          setStep(1);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/85 backdrop-blur-xl"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[920px] bg-obsidian border border-border rounded-[28px] overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between px-8 py-5 border-b border-border">
              <div className="flex items-center gap-4">
                <span className="text-eyebrow">Calibrate Stratos</span>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={`h-1 rounded-full transition-all duration-500 ${
                        i === step
                          ? "w-8 bg-frost"
                          : i < step
                            ? "w-4 bg-frost/60"
                            : "w-4 bg-white/15"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-platinum hover:text-frost transition"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 6 L18 18 M6 18 L18 6" />
                </svg>
              </button>
            </div>

            <div className="px-8 md:px-12 py-10 md:py-14 min-h-[440px]">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <Step key="auth" eyebrow="00 / Identify yourself">
                    <Heading>{isSignUp ? "Create your account." : "Welcome back."}</Heading>
                    <Sub>Sign up or log in to customize and access your Stratos console.</Sub>
                    
                    <form onSubmit={handleAuthSubmit} className="mt-8 max-w-sm space-y-4">
                      {/* Sign Up / Login Toggle */}
                      <div className="flex bg-black/40 border border-border p-1 rounded-full">
                        <button
                          type="button"
                          onClick={() => { setIsSignUp(true); setAuthError(""); }}
                          className={`flex-1 py-2 rounded-full text-[13px] transition ${isSignUp ? "bg-copper text-white" : "text-platinum hover:text-copper"}`}
                        >
                          Sign Up
                        </button>
                        <button
                          type="button"
                          onClick={() => { setIsSignUp(false); setAuthError(""); }}
                          className={`flex-1 py-2 rounded-full text-[13px] transition ${!isSignUp ? "bg-copper text-white" : "text-platinum hover:text-copper"}`}
                        >
                          Login
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-platinum mb-1.5">Username</label>
                          <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            className="w-full bg-white/5 border border-transparent rounded-xl px-4 py-3 text-[14px] placeholder:text-smoke outline-none focus:bg-white/10 focus:ring-1 focus:ring-copper transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-platinum mb-1.5">Password</label>
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white/5 border border-transparent rounded-xl px-4 py-3 text-[14px] placeholder:text-smoke outline-none focus:bg-white/10 focus:ring-1 focus:ring-copper transition"
                          />
                        </div>
                      </div>

                      {authError && (
                        <div className="text-[12px] text-red-500 font-mono">
                          Error: {authError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading || !username || !password}
                        className="w-full py-3.5 rounded-full bg-copper text-white text-[13px] font-medium disabled:opacity-30 hover:opacity-90 hover-lift transition flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : isSignUp ? "Create Account & Calibrate" : "Log In"}
                      </button>
                    </form>
                  </Step>
                )}

                {step === 1 && (
                  <Step key="team" eyebrow="01 / Your side">
                    <Heading>Pick your team.</Heading>
                    <Sub>We'll prioritize their matches, lineups, and tactical history.</Sub>
                    <div className="mt-10 grid grid-cols-3 md:grid-cols-4 gap-2">
                      {TEAMS.map((t) => (
                        <button
                          key={t.code}
                          onClick={() => setTeam(t.code)}
                          className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all ${
                            team === t.code
                              ? "bg-white/5"
                              : "border-border hover:border-white/30"
                          }`}
                          style={
                            team === t.code
                              ? { borderColor: t.color, boxShadow: `0 0 16px ${t.color}22` }
                              : {}
                          }
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: t.color }}
                          />
                          <span className="text-[14px] font-medium">{t.name}</span>
                        </button>
                      ))}
                    </div>
                  </Step>
                )}

                {step === 2 && (
                  <Step key="level" eyebrow="02 / Your fluency">
                    <Heading>How well do you speak football?</Heading>
                    <Sub>Stratos will tune the depth of every answer to match.</Sub>
                    <div className="mt-10 grid gap-3">
                      {LEVELS.map((l) => (
                        <button
                          key={l.key}
                          onClick={() => setLevel(l.key)}
                          className={`group flex items-center justify-between p-6 rounded-2xl border text-left transition-all ${
                            level === l.key
                              ? "border-copper bg-white/5"
                              : "border-border hover:border-white/30"
                          }`}
                        >
                          <div>
                            <div className="text-display text-[24px]">{l.label}</div>
                            <div className="text-[13px] text-platinum mt-1">{l.note}</div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border transition ${
                              level === l.key ? "bg-copper border-copper" : "border-white/30"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </Step>
                )}

                {step === 3 && (
                  <Step key="lang" eyebrow="03 / Your language">
                    <Heading>Talk to me in…</Heading>
                    <Sub>Every Granite response, every Law citation, in your tongue.</Sub>
                    <div className="mt-10 flex flex-wrap gap-2">
                      {LANGUAGES.map((l) => (
                        <button
                          key={l}
                          onClick={() => setLang(l)}
                          className={`px-5 py-2.5 rounded-full border text-[14px] transition-all ${
                            lang === l
                              ? "bg-copper text-white border-copper"
                              : "border-border hover:border-white/30"
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                    <div className="mt-10 p-5 rounded-2xl bg-black/40 border border-border">
                      <div className="text-eyebrow mb-3">Preview</div>
                      <div className="text-[15px] text-copper/90">
                        Hi — I'm Stratos. I'll follow{" "}
                        <span className="text-foreground font-medium">
                          {TEAMS.find((t) => t.code === team)?.name ?? "your team"}
                        </span>{" "}
                        for you, explain things at a{" "}
                        <span className="text-foreground font-medium">
                          {level ?? "matching"}
                        </span>{" "}
                        level, and reply in{" "}
                        <span className="text-foreground font-medium">{lang}</span>.
                      </div>
                    </div>
                  </Step>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between px-8 py-5 border-t border-border bg-black/30">
              <button
                disabled={loading}
                onClick={() => (step > 0 ? setStep(step - 1) : onClose())}
                className="text-[13px] text-platinum hover:text-copper disabled:opacity-30 transition"
              >
                {step === 0 ? "Cancel" : "← Back"}
              </button>
              {step > 0 && (
                <button
                  disabled={!canNext || loading}
                  onClick={next}
                  className="px-6 py-3 rounded-full bg-copper text-white text-[13px] font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 hover-lift transition flex items-center gap-2"
                >
                  {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {step < 3 ? "Continue" : "Enter Stratos →"}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


function Step({ children, eyebrow }: { children: React.ReactNode; eyebrow: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="text-eyebrow mb-6">{eyebrow}</div>
      {children}
    </motion.div>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-display text-[36px] md:text-[44px]">{children}</h2>;
}

function Sub({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-[15px] text-platinum max-w-[480px]">{children}</p>;
}
