import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#0F0E0B",
  surface: "#161410",
  card: "#1C1A16",
  cardHover: "#211F1A",
  border: "#2A2720",
  borderHover: "#3D3A32",
  amber: "#F5A623",
  amberDim: "rgba(245,166,35,0.1)",
  amberGlow: "rgba(245,166,35,0.2)",
  cream: "#F2EDE4",
  muted: "#6B6357",
  mutedLight: "#8C8278",
  teal: "#2DD4BF",
  rose: "#FB7185",
  text: "#E8E3D8",
  white: "#FAF8F4",
};

const painPoints = [
  {
    id: "stakeholder",
    emoji: "📊",
    label: "Stakeholder Reporting",
    color: C.amber,
    tag: "HIGH IMPACT",
    tagColor: C.amber,
    desc: "Turn messy sprint data into exec-ready updates in seconds.",
    prompts: [
      {
        title: "Weekly Status Report Generator",
        difficulty: "Beginner",
        time: "2 min",
        problem: "Writing status reports takes 45 mins every Friday. Stakeholders want RAG status, blockers, and next steps — but you're pulling from 4 different tools.",
        prompt: `You are a senior Delivery PM. Given the following sprint data, write a concise weekly status report for executive stakeholders.

FORMAT:
- Overall Status: [🟢 Green / 🟡 Amber / 🔴 Red]
- Summary (2 sentences max)
- Wins This Week (bullet points)
- Blockers & Risks (with owner and mitigation)
- Next Week Focus (3 priorities)

TONE: Confident, direct, no jargon. Executives should scan it in 60 seconds.

SPRINT DATA:
[Paste your Jira sprint summary / standup notes here]`,
        tips: ["Add 'Audience: CTO' or 'Audience: Client' to adjust tone", "Include velocity numbers for pattern detection", "Paste Slack standup thread directly — Claude handles messy input"],
      },
      {
        title: "Stakeholder Tailoring Engine",
        difficulty: "Intermediate",
        time: "3 min",
        problem: "Your CTO, CPO, and client all want updates — but need totally different levels of detail and framing.",
        prompt: `I need to communicate the same project update to three different stakeholders. Rewrite the update below THREE times:

1. CTO VERSION: Technical depth, system risks, engineering velocity
2. CPO VERSION: Feature progress, user impact, roadmap alignment  
3. CLIENT VERSION: Milestone status, value delivered, what's next

Keep each under 150 words. No internal jargon in the client version.

UPDATE TO ADAPT:
[Paste your raw update here]`,
        tips: ["Works great with rough bullet points — doesn't need polished input", "Add 'Relationship: new client, trust is fragile' for tone calibration"],
      },
    ],
  },
  {
    id: "escalation",
    emoji: "🚨",
    label: "Escalation & Incidents",
    color: C.rose,
    tag: "CRITICAL PATH",
    tagColor: C.rose,
    desc: "Draft escalations, triage incidents, and communicate under pressure.",
    prompts: [
      {
        title: "Escalation Draft Generator",
        difficulty: "Beginner",
        time: "90 sec",
        problem: "Something just broke or missed. You need to escalate fast but professionally — without panic, blame, or missing context.",
        prompt: `You are a calm, senior Delivery PM. Draft an escalation message based on the situation below.

STRUCTURE:
- Situation (what happened, when, impact)
- Root Cause (known or suspected)
- Immediate Actions Taken
- What I Need From You (specific ask)
- ETA for next update

TONE: Urgent but composed. Own the situation, don't assign blame. Be specific about the ask.

SITUATION:
[Describe what happened in plain language]

AUDIENCE:
[Who are you escalating to? e.g. VP Engineering, Client, Steering Committee]`,
        tips: ["Include 'we have a workaround' or 'no workaround yet' — changes the tone significantly", "Add timeline: 'this started 2 hours ago' for urgency calibration"],
      },
      {
        title: "Incident Post-Mortem Drafter",
        difficulty: "Intermediate",
        time: "5 min",
        problem: "Post-mortems are painful to write. You have raw notes, Slack threads, and a tired team — but leadership wants a polished document by EOD.",
        prompt: `Write a blameless post-mortem document from the notes below.

SECTIONS TO INCLUDE:
1. Incident Summary (severity, duration, impact)
2. Timeline (key events in chronological order)
3. Root Cause Analysis (use 5 Whys if applicable)
4. What Went Well
5. What Went Wrong
6. Action Items (owner, due date, priority)

PRINCIPLE: Blameless. Focus on systems and processes, not individuals.

RAW NOTES / SLACK THREAD:
[Paste your incident notes here]`,
        tips: ["'Blameless' framing is key — explicitly ask Claude to avoid naming individuals in blame contexts", "Add 'customer-facing impact: yes/no' to adjust severity language"],
      },
    ],
  },
  {
    id: "sprint",
    emoji: "⚡",
    label: "Sprint & Delivery Tracking",
    color: C.teal,
    tag: "DAILY USE",
    tagColor: C.teal,
    desc: "Spot risks early, run better retros, and keep delivery on track.",
    prompts: [
      {
        title: "Sprint Risk Radar",
        difficulty: "Beginner",
        time: "2 min",
        problem: "You're mid-sprint and something feels off — but you can't pinpoint what. You need a second brain to pressure-test your delivery.",
        prompt: `Act as a delivery risk analyst. Review this sprint status and identify risks I might be missing.

ANALYZE FOR:
- Scope creep signals
- Dependency risks (blocked by other teams)
- Velocity concerns (are we on track?)
- Team capacity issues
- Assumptions that haven't been validated

OUTPUT FORMAT:
- Risk Level: [High / Medium / Low]
- Top 3 Risks (with likelihood and impact)
- Recommended Actions (one per risk)
- Questions to ask in your next standup

SPRINT DATA:
[Paste sprint board summary, standup notes, or Jira export]`,
        tips: ["Paste your burndown chart description for velocity analysis", "Include team OOO calendar notes — Claude will factor in capacity"],
      },
      {
        title: "Retro Insight Extractor",
        difficulty: "Intermediate",
        time: "4 min",
        problem: "Retrospectives generate great conversation but the insights disappear. Patterns repeat sprint after sprint because no one tracks themes.",
        prompt: `Analyze these retrospective notes from the last [N] sprints and identify systemic patterns.

FIND:
1. Recurring themes (what keeps coming up?)
2. Unresolved action items from previous retros
3. Team sentiment trend (improving / declining / stable)
4. Top 3 process improvements with highest ROI
5. What the team is doing well (don't only focus on problems)

FORMAT: Executive summary + detailed breakdown. Actionable, not academic.

RETRO NOTES:
[Paste multi-sprint retro notes here — messy is fine]`,
        tips: ["Works best with 3+ sprints of data", "Ask Claude to 'prioritize by frequency AND team energy cost' for better ranking"],
      },
    ],
  },
];

const workflowTools = [
  { emoji: "💬", name: "Slack Summarizer", desc: "AI reads your Slack channels and extracts blockers, decisions & action items", tag: "Live Tool", color: C.amber },
  { emoji: "📋", name: "RAID Log Agent", desc: "Paste meeting notes — Claude populates your RAID log automatically", tag: "Coming Soon", color: C.muted },
  { emoji: "📊", name: "Status Report Bot", desc: "Connects to Jira + Slack, drafts your weekly report for approval", tag: "Coming Soon", color: C.muted },
  { emoji: "🔥", name: "Escalation Triage", desc: "Classifies incidents by severity and routes to right owner with draft comms", tag: "Coming Soon", color: C.muted },
];

const caseStudies = [
  {
    tag: "Case Study 01",
    title: "How I saved 3 hours/week on stakeholder reporting using a 4-line prompt",
    pain: "Stakeholder Reporting",
    painColor: C.amber,
    excerpt: "Every Friday I was pulling data from Jira, Confluence, and Slack to write a status report that 3 executives would skim in 90 seconds. Here's the exact prompt chain I built to automate it.",
    steps: ["Extracted Jira sprint data via API", "Fed into Claude with stakeholder context", "Added approval step before sending", "Saved ~3hrs/week across a 6-month delivery"],
  },
  {
    tag: "Case Study 02",
    title: "Using AI to run better retros when your team is in 3 timezones",
    pain: "Sprint Tracking",
    painColor: C.teal,
    excerpt: "Async retros are hard. Themes get lost, action items die, and the same problems recur. I built a prompt workflow that analyzes retro notes and surfaces what actually matters.",
    steps: ["Collected async retro inputs via Slack", "Claude clustered themes across 8 sprints", "Generated ranked action items with owners", "Team resolved 3 recurring blockers within 2 sprints"],
  },
];

// ── Components ──────────────────────────────────────────────────

function Tag({ children, color, small }) {
  return (
    <span style={{
      display: "inline-block",
      background: `${color}18`,
      color,
      border: `1px solid ${color}40`,
      borderRadius: 3,
      padding: small ? "1px 7px" : "3px 10px",
      fontSize: small ? 10 : 11,
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      fontFamily: "'DM Mono', monospace",
    }}>{children}</span>
  );
}

function DifficultyPip({ level }) {
  const colors = { Beginner: C.teal, Intermediate: C.amber, Advanced: C.rose };
  return <Tag color={colors[level] || C.muted} small>{level}</Tag>;
}

function PromptCard({ prompt, accentColor }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${expanded ? accentColor + "40" : C.border}`,
      borderRadius: 10,
      marginBottom: 12,
      overflow: "hidden",
      transition: "border-color 0.2s",
    }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: "16px 20px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <DifficultyPip level={prompt.difficulty} />
            <span style={{ color: C.muted, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>⏱ {prompt.time}</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.cream, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.02em" }}>
            {prompt.title}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>{prompt.problem}</div>
        </div>
        <span style={{ color: C.muted, fontSize: 18, flexShrink: 0, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>↓</span>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "16px 20px" }}>
          {/* Prompt */}
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: "14px 16px",
            marginBottom: 14,
            position: "relative",
          }}>
            <pre style={{
              margin: 0, fontSize: 12, color: C.text,
              fontFamily: "'DM Mono', monospace",
              whiteSpace: "pre-wrap", lineHeight: 1.7,
            }}>{prompt.prompt}</pre>
          </div>

          {/* Tips */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
              💡 Pro Tips
            </div>
            {prompt.tips.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <span style={{ color: accentColor, flexShrink: 0 }}>→</span>
                <span style={{ fontSize: 12, color: C.mutedLight, lineHeight: 1.5 }}>{t}</span>
              </div>
            ))}
          </div>

          {/* Copy button */}
          <button
            onClick={copy}
            style={{
              background: copied ? `${C.teal}20` : `${accentColor}15`,
              border: `1px solid ${copied ? C.teal : accentColor}60`,
              color: copied ? C.teal : accentColor,
              borderRadius: 6,
              padding: "8px 18px",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "'DM Mono', monospace",
              letterSpacing: "0.06em",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {copied ? "✓ COPIED" : "COPY PROMPT"}
          </button>
        </div>
      )}
    </div>
  );
}


// ── Embedded Slack Summarizer ─────────────────────────────────
const SLACK_MCP_URL = "https://mcp.slack.com/mcp";

async function callClaude(messages, system = "", mcpServers = []) {
  const body = { model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages };
  if (mcpServers.length) body.mcp_servers = mcpServers;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  return res.json();
}

function extractText(data) {
  if (!data?.content) return "";
  return data.content.filter(b => b.type === "text").map(b => b.text).join("\n");
}

function SpinnerIcon() {
  return (
    <span style={{ display: "inline-block", width: 14, height: 14 }}>
      <svg viewBox="0 0 24 24" style={{ animation: "spin 0.9s linear infinite", width: 14, height: 14 }}>
        <circle cx="12" cy="12" r="10" fill="none" stroke={C.teal} strokeWidth="3" strokeDasharray="40 20" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function SlackSummarizer() {
  const [channel, setChannel] = useState("");
  const [msgCount, setMsgCount] = useState(30);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("");
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  async function summarize() {
    if (!channel.trim()) { setError("Please enter a channel name."); return; }
    setError(""); setLoading(true); setSummary(null);
    try {
      setStage("Fetching messages from Slack…");
      const fetchData = await callClaude(
        [{ role: "user", content: `Fetch the last ${msgCount} messages from Slack channel #${channel.trim().replace(/^#/, "")}. Return as JSON array with fields: user, text, ts. No markdown.` }],
        "You are a Slack data agent. Fetch messages and return raw JSON array. No preamble.",
        [{ type: "url", url: SLACK_MCP_URL, name: "slack" }]
      );
      setStage("Analyzing with Claude AI…");
      const rawText = extractText(fetchData);
      const summaryData = await callClaude([{
        role: "user",
        content: `You are a Delivery PM's AI assistant. Analyze these Slack messages from #${channel} and return ONLY a JSON object (no markdown) with:
{ "tldr": "2-3 sentence summary", "keyDecisions": ["..."], "actionItems": [{"owner":"...","task":"...","urgency":"high|medium|low"}], "blockers": ["..."], "risks": ["..."], "sentiment": "positive|neutral|tense|urgent", "topContributors": ["..."] }

Messages: ${rawText}`
      }],
        "You are a PM assistant. Return ONLY valid JSON, no markdown."
      );
      setStage("Formatting insights…");
      const clean = extractText(summaryData).replace(/\`\`\`json|\`\`\`/g, "").trim();
      setSummary(JSON.parse(clean));
    } catch(e) {
      setError(`Error: ${e.message}. Make sure Slack is connected in Claude settings.`);
    } finally { setLoading(false); setStage(""); }
  }

  const sentimentColors = { positive: C.teal, neutral: C.amber, tense: "#FFB347", urgent: C.rose };

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
      {/* Input row */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Channel</div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.muted, fontSize: 13 }}>#</span>
            <input value={channel} onChange={e => setChannel(e.target.value)} onKeyDown={e => e.key === "Enter" && summarize()}
              placeholder="general" style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, padding: "9px 10px 9px 24px", color: C.text, fontSize: 13, fontFamily: "'DM Mono', monospace", outline: "none" }} />
          </div>
        </div>
        <div style={{ minWidth: 110 }}>
          <div style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Messages</div>
          <select value={msgCount} onChange={e => setMsgCount(Number(e.target.value))}
            style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, padding: "9px 10px", color: C.text, fontSize: 13, fontFamily: "'DM Mono', monospace", outline: "none" }}>
            {[10,20,30,50].map(n => <option key={n} value={n}>Last {n}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button onClick={summarize} disabled={loading} style={{ background: loading ? C.border : C.teal, color: loading ? C.muted : C.bg, border: "none", borderRadius: 7, padding: "9px 20px", fontSize: 12, fontWeight: 700, fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}>
            {loading ? <><SpinnerIcon /> {stage.split("…")[0]}…</> : "▶ SUMMARIZE"}
          </button>
        </div>
      </div>

      {error && <div style={{ background: "rgba(251,113,133,0.08)", border: "1px solid rgba(251,113,133,0.3)", borderRadius: 8, padding: "10px 14px", color: C.rose, fontSize: 12, marginBottom: 14 }}>⚠ {error}</div>}

      {summary && (
        <div style={{ animation: "fadeUp 0.3s ease both" }}>
          {/* TL;DR */}
          <div style={{ background: `rgba(45,212,191,0.06)`, border: `1px solid rgba(45,212,191,0.2)`, borderRadius: 10, padding: "16px 18px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
              <span style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>⚡ TL;DR — #{channel}</span>
              <span style={{ fontSize: 10, color: sentimentColors[summary.sentiment] || C.amber, fontFamily: "'DM Mono', monospace", fontWeight: 700, background: `${sentimentColors[summary.sentiment]}15`, border: `1px solid ${sentimentColors[summary.sentiment]}40`, borderRadius: 3, padding: "1px 7px", textTransform: "uppercase" }}>{summary.sentiment}</span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: C.text, lineHeight: 1.7 }}>{summary.tldr}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            {/* Action Items */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>✅ Action Items</div>
              {summary.actionItems?.length ? summary.actionItems.map((a,i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: a.urgency==="high"?C.rose:a.urgency==="medium"?C.amber:C.teal, background: `${a.urgency==="high"?C.rose:a.urgency==="medium"?C.amber:C.teal}15`, border: `1px solid ${a.urgency==="high"?C.rose:a.urgency==="medium"?C.amber:C.teal}30`, borderRadius: 3, padding: "1px 6px", textTransform: "uppercase", marginRight: 6 }}>{a.urgency}</span>
                  <span style={{ fontSize: 12, color: C.text }}>{a.task}</span>
                  {a.owner !== "unknown" && <div style={{ fontSize: 10, color: C.muted, marginTop: 2, marginLeft: 2 }}>→ {a.owner}</div>}
                </div>
              )) : <span style={{ fontSize: 12, color: C.muted }}>No action items found</span>}
            </div>
            {/* Blockers & Decisions */}
            <div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>🚧 Blockers</div>
                {summary.blockers?.length ? summary.blockers.map((b,i) => <div key={i} style={{ fontSize: 12, color: C.text, display: "flex", gap: 6, marginBottom: 4 }}><span style={{ color: C.rose }}>›</span>{b}</div>) : <span style={{ fontSize: 12, color: C.muted }}>✓ No blockers</span>}
              </div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>🎯 Decisions</div>
                {summary.keyDecisions?.length ? summary.keyDecisions.map((d,i) => <div key={i} style={{ fontSize: 12, color: C.text, display: "flex", gap: 6, marginBottom: 4 }}><span style={{ color: C.teal }}>›</span>{d}</div>) : <span style={{ fontSize: 12, color: C.muted }}>No decisions recorded</span>}
              </div>
            </div>
          </div>
          {summary.topContributors?.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Mono', monospace" }}>👥 Active:</span>
              {summary.topContributors.map((c,i) => <span key={i} style={{ background: "rgba(245,166,35,0.1)", color: C.amber, border: "1px solid rgba(245,166,35,0.2)", borderRadius: 20, padding: "2px 10px", fontSize: 11 }}>{c}</span>)}
            </div>
          )}
        </div>
      )}

      {!summary && !loading && !error && (
        <div style={{ textAlign: "center", padding: "24px 0", color: C.muted }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
          <div style={{ fontSize: 13 }}>Enter a Slack channel and click Summarize</div>
          <div style={{ fontSize: 11, marginTop: 4, color: "#4a453d" }}>Requires Slack MCP connected in Claude settings</div>
        </div>
      )}
    </div>
  );
}

export default function PMHub() {
  const [activeTab, setActiveTab] = useState("playbook");
  const [activePain, setActivePain] = useState("stakeholder");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const activePainData = painPoints.find(p => p.id === activePain);

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: "'Barlow', sans-serif",
    }}>
      <style>{`
        html, body, #root { background: #0F0E0B !important; min-height: 100vh; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; background: #0F0E0B; }
        ::-webkit-scrollbar-track { background: #0F0E0B; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
        ::-webkit-scrollbar-corner { background: #0F0E0B; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-2%, -3%); }
          30% { transform: translate(3%, 2%); }
          50% { transform: translate(-1%, 4%); }
          70% { transform: translate(4%, -1%); }
          90% { transform: translate(-3%, 2%); }
        }
        .nav-tab { transition: all 0.2s; }
        .nav-tab:hover { color: ${C.cream} !important; }
        .pain-btn { transition: all 0.2s; cursor: pointer; }
        .pain-btn:hover { border-color: currentColor !important; }
        .tool-card { transition: all 0.2s; }
        .tool-card:hover { background: ${C.cardHover} !important; border-color: ${C.borderHover} !important; transform: translateY(-2px); }
        .cs-card { transition: all 0.2s; }
        .cs-card:hover { border-color: ${C.borderHover} !important; }
      `}</style>

      {/* Grain overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100,
        opacity: 0.025,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        animation: "grain 0.5s steps(1) infinite",
      }} />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>

        {/* ── Hero ── */}
        <div style={{
          paddingTop: 56,
          paddingBottom: 48,
          borderBottom: `1px solid ${C.border}`,
          opacity: mounted ? 1 : 0,
          animation: mounted ? "fadeUp 0.6s ease both" : "none",
        }}>
          {/* Eyebrow */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 32, height: 1, background: C.amber }} />
            <span style={{ fontSize: 11, color: C.amber, fontFamily: "'DM Mono', monospace", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Delivery PM × AI
            </span>
          </div>

          {/* Title */}
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <h1 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "clamp(44px, 7vw, 76px)",
                fontWeight: 900,
                color: C.white,
                margin: "0 0 16px",
                lineHeight: 0.95,
                letterSpacing: "-0.01em",
                textTransform: "uppercase",
              }}>
                PM<br />
                <span style={{ color: C.amber }}>AI</span><br />
                HUB
              </h1>
              <p style={{ fontSize: 16, color: C.mutedLight, lineHeight: 1.7, margin: "0 0 24px", maxWidth: 420 }}>
                Practical AI workflows for Delivery Program Managers.
                Real prompts, live tools, and case studies — not theory.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Tag color={C.amber}>Stakeholder Reporting</Tag>
                <Tag color={C.rose}>Escalation Handling</Tag>
                <Tag color={C.teal}>Sprint Tracking</Tag>
              </div>
            </div>

            {/* Stats block */}
            <div style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "24px",
              minWidth: 220,
            }}>
              {[
                { n: "12+", label: "Ready-to-use prompts" },
                { n: "3", label: "Core PM pain points" },
                { n: "2", label: "Live AI workflow tools" },
                { n: "∞", label: "Hours saved per week" },
              ].map((s, i) => (
                <div key={i} style={{
                  paddingBottom: i < 3 ? 16 : 0,
                  marginBottom: i < 3 ? 16 : 0,
                  borderBottom: i < 3 ? `1px solid ${C.border}` : "none",
                }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: C.amber, fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Nav Tabs ── */}
        <div style={{
          display: "flex",
          gap: 0,
          borderBottom: `1px solid ${C.border}`,
          marginBottom: 36,
        }}>
          {[
            { id: "playbook", label: "🎓 Prompt Playbook" },
            { id: "tools", label: "⚙️ Workflow Lab" },
            { id: "cases", label: "📖 Case Studies" },
          ].map(tab => (
            <button
              key={tab.id}
              className="nav-tab"
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: "none",
                border: "none",
                borderBottom: `2px solid ${activeTab === tab.id ? C.amber : "transparent"}`,
                color: activeTab === tab.id ? C.amber : C.muted,
                padding: "16px 24px",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'DM Mono', monospace",
                letterSpacing: "0.04em",
                cursor: "pointer",
                marginBottom: -1,
                transition: "all 0.2s",
              }}
            >{tab.label}</button>
          ))}
        </div>

        {/* ══ PLAYBOOK TAB ══ */}
        {activeTab === "playbook" && (
          <div style={{ animation: "fadeUp 0.35s ease both" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
              {painPoints.map(p => (
                <button
                  key={p.id}
                  className="pain-btn"
                  onClick={() => setActivePain(p.id)}
                  style={{
                    background: activePain === p.id ? `${p.color}15` : "transparent",
                    border: `1px solid ${activePain === p.id ? p.color : C.border}`,
                    borderRadius: 8,
                    padding: "10px 18px",
                    color: activePain === p.id ? p.color : C.muted,
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "'DM Mono', monospace",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "all 0.2s",
                  }}
                >
                  <span>{p.emoji}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>

            {activePainData && (
              <div>
                {/* Pain point header */}
                <div style={{
                  background: `linear-gradient(135deg, ${activePainData.color}08 0%, transparent 100%)`,
                  border: `1px solid ${activePainData.color}25`,
                  borderRadius: 12,
                  padding: "20px 24px",
                  marginBottom: 20,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                }}>
                  <div>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{activePainData.emoji}</div>
                    <h2 style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 28,
                      fontWeight: 800,
                      color: C.white,
                      margin: "0 0 6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.02em",
                    }}>{activePainData.label}</h2>
                    <p style={{ margin: 0, fontSize: 14, color: C.mutedLight }}>{activePainData.desc}</p>
                  </div>
                  <Tag color={activePainData.tagColor}>{activePainData.tag}</Tag>
                </div>

                {/* Prompt cards */}
                {activePainData.prompts.map((p, i) => (
                  <PromptCard key={i} prompt={p} accentColor={activePainData.color} />
                ))}

                {/* Tease more */}
                <div style={{
                  border: `1px dashed ${C.border}`,
                  borderRadius: 10,
                  padding: "20px",
                  textAlign: "center",
                  color: C.muted,
                  fontSize: 13,
                }}>
                  + More {activePainData.label} prompts coming soon
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ TOOLS TAB ══ */}
        {activeTab === "tools" && (
          <div style={{ animation: "fadeUp 0.35s ease both" }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 800, color: C.white, margin: "0 0 8px", textTransform: "uppercase" }}>
                Live Workflow Lab
              </h2>
              <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>
                AI-powered tools built for real Delivery PM workflows — use them right here.
              </p>
            </div>

            {/* ── Slack Summarizer — Live ── */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>💬</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: C.white, fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.02em" }}>Slack Channel Summarizer</span>
                    <Tag color={C.teal} small>Live Tool</Tag>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Reads any Slack channel and extracts blockers, decisions & action items using Claude AI</div>
                </div>
              </div>
              <SlackSummarizer />
            </div>

            {/* ── Coming Soon Tools ── */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Coming Soon</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
                {workflowTools.filter(t => t.tag === "Coming Soon").map((t, i) => (
                  <div key={i} className="tool-card" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "18px", opacity: 0.55 }}>
                    <div style={{ fontSize: 24, marginBottom: 10 }}>{t.emoji}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.cream, fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", marginBottom: 6 }}>{t.name}</div>
                    <p style={{ margin: 0, fontSize: 12, color: C.mutedLight, lineHeight: 1.5 }}>{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech stack */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "18px 20px", marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: C.amber, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Under the Hood</div>
                <div style={{ fontSize: 13, color: C.mutedLight }}>Built with Claude API + MCP — real connections, not mock data</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Claude Sonnet", "Slack MCP", "React", "Anthropic API"].map(t => (
                  <Tag key={t} color={C.muted} small>{t}</Tag>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ CASE STUDIES TAB ══ */}
        {activeTab === "cases" && (
          <div style={{ animation: "fadeUp 0.35s ease both" }}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 32,
                fontWeight: 800,
                color: C.white,
                margin: "0 0 8px",
                textTransform: "uppercase",
              }}>Case Study Journal</h2>
              <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>
                Real delivery problems. Exact prompts used. Measurable outcomes.
              </p>
            </div>

            {caseStudies.map((cs, i) => (
              <div
                key={i}
                className="cs-card"
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: "28px",
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                  <span style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>{cs.tag}</span>
                  <Tag color={cs.painColor}>{cs.pain}</Tag>
                </div>

                <h3 style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 24,
                  fontWeight: 800,
                  color: C.white,
                  margin: "0 0 12px",
                  lineHeight: 1.2,
                  textTransform: "uppercase",
                  letterSpacing: "0.01em",
                }}>{cs.title}</h3>

                <p style={{ color: C.mutedLight, fontSize: 14, lineHeight: 1.7, margin: "0 0 20px" }}>{cs.excerpt}</p>

                {/* Steps */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {cs.steps.map((s, j) => (
                    <div key={j} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                      borderRadius: 6,
                      padding: "6px 12px",
                    }}>
                      <span style={{ color: cs.painColor, fontSize: 11, fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{String(j + 1).padStart(2, "0")}</span>
                      <span style={{ fontSize: 12, color: C.mutedLight }}>{s}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 20 }}>
                  <span style={{
                    color: cs.painColor,
                    fontSize: 12,
                    fontFamily: "'DM Mono', monospace",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    cursor: "pointer",
                  }}>READ FULL CASE STUDY →</span>
                </div>
              </div>
            ))}

            {/* CTA */}
            <div style={{
              background: `linear-gradient(135deg, ${C.amberDim} 0%, transparent 100%)`,
              border: `1px solid ${C.amber}30`,
              borderRadius: 12,
              padding: "28px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>✍️</div>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 800, color: C.white, margin: "0 0 8px", textTransform: "uppercase" }}>
                More Case Studies In Progress
              </h3>
              <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>
                Building: RAID Log automation · Escalation triage · Release readiness scoring
              </p>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{
          borderTop: `1px solid ${C.border}`,
          marginTop: 60,
          padding: "28px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 800, color: C.amber, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            PM AI Hub
          </span>
          <span style={{ fontSize: 12, color: C.muted, fontFamily: "'DM Mono', monospace" }}>
            Built by a Delivery PM · Powered by Claude
          </span>
        </div>

      </div>
    </div>
  );
}
