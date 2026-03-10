import { useState, useEffect } from "react";

// ── NEW COLOUR PALETTE: Deep navy + electric cyan + slate ──
const C = {
  bg: "#080E1A",
  surface: "#0D1525",
  card: "#111D30",
  cardHover: "#162338",
  border: "#1E2E47",
  borderHover: "#2A4060",
  cyan: "#00D4FF",
  cyanDim: "rgba(0,212,255,0.1)",
  cyanGlow: "rgba(0,212,255,0.2)",
  indigo: "#6C8EFF",
  indigoDim: "rgba(108,142,255,0.1)",
  mint: "#00E5B0",
  mintDim: "rgba(0,229,176,0.1)",
  rose: "#FF6B8A",
  roseDim: "rgba(255,107,138,0.1)",
  text: "#C8D8F0",
  textBright: "#E8F0FF",
  muted: "#4A6080",
  mutedLight: "#6A85A8",
  white: "#F0F6FF",
};

// ── Data ────────────────────────────────────────────────────────
const painPoints = [
  {
    id: "stakeholder", emoji: "📊", label: "Stakeholder Reporting",
    color: C.cyan, tag: "HIGH IMPACT",
    desc: "Turn messy sprint data into exec-ready updates in seconds.",
    prompts: [
      {
        title: "Weekly Status Report Generator", difficulty: "Beginner", time: "2 min",
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
        steps: [
          "Copy your Jira sprint summary or paste your standup notes",
          "Replace [SPRINT DATA] at the bottom of the prompt with your notes",
          "Paste the full prompt into Claude.ai or ChatGPT",
          "Review the output — adjust RAG status if needed",
          "Copy the report into your email or Confluence page"
        ]
      },
      {
        title: "Stakeholder Tailoring Engine", difficulty: "Intermediate", time: "3 min",
        problem: "Your CTO, CPO, and client all want updates — but need totally different levels of detail and framing.",
        prompt: `I need to communicate the same project update to three different stakeholders. Rewrite the update below THREE times:

1. CTO VERSION: Technical depth, system risks, engineering velocity
2. CPO VERSION: Feature progress, user impact, roadmap alignment
3. CLIENT VERSION: Milestone status, value delivered, what's next

Keep each under 150 words. No internal jargon in the client version.

UPDATE TO ADAPT:
[Paste your raw update here]`,
        tips: ["Works great with rough bullet points — doesn't need polished input", "Add 'Relationship: new client, trust is fragile' for tone calibration"],
        steps: [
          "Write a rough 3-5 sentence update about where the project stands",
          "Paste it at the bottom of the prompt replacing [UPDATE TO ADAPT]",
          "Run it in Claude — you'll get 3 tailored versions instantly",
          "Pick the right version per audience and send",
          "Pro tip: Save your go-to update as a template for next week"
        ]
      },
    ],
  },
  {
    id: "escalation", emoji: "🚨", label: "Escalation & Incidents",
    color: C.rose, tag: "CRITICAL PATH",
    desc: "Draft escalations, triage incidents, and communicate under pressure.",
    prompts: [
      {
        title: "Escalation Draft Generator", difficulty: "Beginner", time: "90 sec",
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
        steps: [
          "Describe the situation in 2-3 plain sentences — what happened, when, and the impact",
          "Add who you're escalating to at the bottom",
          "Run the prompt — Claude will structure it professionally in under 10 seconds",
          "Check the 'What I Need From You' section — make sure the ask is specific",
          "Send within 5 minutes of the incident — speed matters in escalations"
        ]
      },
      {
        title: "Incident Post-Mortem Drafter", difficulty: "Intermediate", time: "5 min",
        problem: "Post-mortems are painful to write. You have raw notes and a tired team — but leadership wants a polished document by EOD.",
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
        steps: [
          "Gather your raw notes — Slack thread, incident log, or bullet points all work",
          "Paste everything into the prompt at the bottom (messy is fine)",
          "Run it — Claude will structure it into a proper post-mortem",
          "Review the Root Cause section most carefully — this needs your knowledge",
          "Share with the team before finalising — get sign-off on action item owners"
        ]
      },
    ],
  },
  {
    id: "sprint", emoji: "⚡", label: "Sprint & Delivery Tracking",
    color: C.mint, tag: "DAILY USE",
    desc: "Spot risks early, run better retros, and keep delivery on track.",
    prompts: [
      {
        title: "Sprint Risk Radar", difficulty: "Beginner", time: "2 min",
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
        steps: [
          "Export or copy your current sprint board status (even a screenshot description works)",
          "Add any OOO or capacity notes for the team this week",
          "Run the prompt mid-sprint (Wednesday is ideal — enough data, still time to act)",
          "Focus on the 'Questions to ask in standup' section — use them verbatim",
          "Run this every sprint and compare — patterns become visible over time"
        ]
      },
      {
        title: "Retro Insight Extractor", difficulty: "Intermediate", time: "4 min",
        problem: "Retrospectives generate great conversation but insights disappear. Patterns repeat because no one tracks themes across sprints.",
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
        steps: [
          "Collect retro notes from your last 3-5 sprints (Confluence, Miro, or even photos of sticky notes)",
          "Paste them all into the prompt — label each sprint (Sprint 12, Sprint 13, etc.)",
          "Run it — Claude will surface patterns you've been living too close to see",
          "Share the 'What Went Well' section with the team first — morale boost before the hard stuff",
          "Turn the top 3 improvements into actual sprint items with owners"
        ]
      },
    ],
  },
];

const workflowTools = [
  { emoji: "📋", name: "RAID Log Agent", desc: "Paste meeting notes — Claude auto-populates your RAID log", tag: "Coming Soon", color: C.muted },
  { emoji: "📊", name: "Status Report Bot", desc: "Connects to Jira + Slack, drafts your weekly report for approval", tag: "Coming Soon", color: C.muted },
  { emoji: "🔥", name: "Escalation Triage", desc: "Classifies incidents by severity and routes to the right owner", tag: "Coming Soon", color: C.muted },
];

// ── Components ───────────────────────────────────────────────────

function Chip({ children, color, small }) {
  return (
    <span style={{
      display: "inline-block",
      background: `${color}18`,
      color,
      border: `1px solid ${color}40`,
      borderRadius: 4,
      padding: small ? "1px 7px" : "3px 10px",
      fontSize: small ? 10 : 11,
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      fontFamily: "'DM Mono', monospace",
    }}>{children}</span>
  );
}

function DiffPip({ level }) {
  const map = { Beginner: C.mint, Intermediate: C.cyan, Advanced: C.rose };
  return <Chip color={map[level] || C.muted} small>{level}</Chip>;
}

function PromptCard({ prompt, accentColor }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("prompt");

  const copy = () => {
    navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: C.card, border: `1px solid ${open ? accentColor + "50" : C.border}`,
      borderRadius: 10, marginBottom: 12, overflow: "hidden", transition: "border-color 0.2s",
    }}>
      <div onClick={() => setOpen(!open)} style={{ padding: "16px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
            <DiffPip level={prompt.difficulty} />
            <span style={{ color: C.muted, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>⏱ {prompt.time}</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.textBright, fontFamily: "'Sora', sans-serif" }}>{prompt.title}</div>
          <div style={{ fontSize: 12, color: C.mutedLight, marginTop: 4, lineHeight: 1.5 }}>{prompt.problem}</div>
        </div>
        <span style={{ color: C.muted, fontSize: 18, flexShrink: 0, display: "inline-block", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>↓</span>
      </div>

      {open && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "16px 20px" }}>
          {/* Mini tabs */}
          <div style={{ display: "flex", gap: 0, marginBottom: 14, borderBottom: `1px solid ${C.border}` }}>
            {["prompt", "how-to"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: "none", border: "none", borderBottom: `2px solid ${tab === t ? accentColor : "transparent"}`,
                color: tab === t ? accentColor : C.muted, padding: "6px 16px", fontSize: 11,
                fontWeight: 700, fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em",
                cursor: "pointer", textTransform: "uppercase", marginBottom: -1, transition: "all 0.15s",
              }}>
                {t === "prompt" ? "📋 Prompt" : "📖 Step-by-Step"}
              </button>
            ))}
          </div>

          {tab === "prompt" && (
            <>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 16px", marginBottom: 14 }}>
                <pre style={{ margin: 0, fontSize: 12, color: C.text, fontFamily: "'DM Mono', monospace", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                  {prompt.prompt}
                </pre>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>💡 Pro Tips</div>
                {prompt.tips.map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <span style={{ color: accentColor, flexShrink: 0 }}>→</span>
                    <span style={{ fontSize: 12, color: C.mutedLight, lineHeight: 1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
              <button onClick={copy} style={{
                background: copied ? `${C.mint}20` : `${accentColor}15`, border: `1px solid ${copied ? C.mint : accentColor}60`,
                color: copied ? C.mint : accentColor, borderRadius: 6, padding: "8px 18px",
                fontSize: 12, fontWeight: 700, fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", cursor: "pointer", transition: "all 0.2s",
              }}>
                {copied ? "✓ COPIED TO CLIPBOARD" : "COPY PROMPT"}
              </button>
            </>
          )}

          {tab === "how-to" && (
            <div>
              <div style={{ fontSize: 12, color: C.mutedLight, marginBottom: 16, lineHeight: 1.6 }}>
                New to AI prompting? Follow these steps exactly — no experience needed.
              </div>
              {prompt.steps.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "flex-start" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    background: `${accentColor}15`, border: `1px solid ${accentColor}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: accentColor, fontFamily: "'DM Mono', monospace",
                  }}>{i + 1}</div>
                  <div style={{ paddingTop: 4 }}>
                    <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{step}</div>
                    {i < prompt.steps.length - 1 && (
                      <div style={{ width: 1, height: 8, background: C.border, marginLeft: 0, marginTop: 8 }} />
                    )}
                  </div>
                </div>
              ))}
              <div style={{ background: `${accentColor}08`, border: `1px dashed ${accentColor}30`, borderRadius: 8, padding: "12px 14px", marginTop: 8 }}>
                <div style={{ fontSize: 11, color: accentColor, fontFamily: "'DM Mono', monospace", fontWeight: 700, marginBottom: 4 }}>WHERE TO RUN THIS PROMPT</div>
                <div style={{ fontSize: 12, color: C.mutedLight, lineHeight: 1.5 }}>
                  Open <strong style={{ color: C.text }}>claude.ai</strong> or <strong style={{ color: C.text }}>chat.openai.com</strong> in a new tab, paste the prompt, and hit enter. No account setup required to try Claude — it's free to start.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Slack Summarizer ─────────────────────────────────────────────
const SLACK_MCP = "https://mcp.slack.com/mcp";

async function callClaude(messages, system = "", mcpServers = []) {
  const body = { model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages };
  if (mcpServers.length) body.mcp_servers = mcpServers;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  return res.json();
}

function getTextFromResponse(data) {
  if (!data?.content) return "";
  return data.content.filter(b => b.type === "text").map(b => b.text).join("\n");
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" style={{ animation: "spin 0.9s linear infinite", width: 14, height: 14, display: "inline-block", verticalAlign: "middle" }}>
      <circle cx="12" cy="12" r="10" fill="none" stroke={C.cyan} strokeWidth="3" strokeDasharray="40 20" strokeLinecap="round" />
    </svg>
  );
}

function SlackSummarizer() {
  const [channel, setChannel] = useState("");
  const [msgCount, setMsgCount] = useState(30);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("");
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  async function run() {
    if (!channel.trim()) { setError("Please enter a channel name."); return; }
    setError(""); setLoading(true); setSummary(null);
    try {
      setStage("Connecting to Slack…");
      const fetchData = await callClaude(
        [{ role: "user", content: `Fetch the last ${msgCount} messages from Slack channel #${channel.trim().replace(/^#/, "")}. Return as JSON array: [{user, text, ts}]. No markdown.` }],
        "You are a Slack data agent. Return raw JSON array only.",
        [{ type: "url", url: SLACK_MCP, name: "slack" }]
      );
      setStage("Analysing with Claude AI…");
      const rawText = getTextFromResponse(fetchData);
      const summaryData = await callClaude([{
        role: "user",
        content: `Analyse these Slack messages from #${channel} as a Delivery PM assistant. Return ONLY a JSON object (no markdown) exactly like this:
{"tldr":"2-3 sentence summary","keyDecisions":["..."],"actionItems":[{"owner":"...","task":"...","urgency":"high|medium|low"}],"blockers":["..."],"risks":["..."],"sentiment":"positive|neutral|tense|urgent","topContributors":["..."]}

Messages: ${rawText}`
      }],
        "Return ONLY valid JSON. No markdown, no explanation."
      );
      const clean = getTextFromResponse(summaryData).replace(/```json|```/g, "").trim();
      setSummary(JSON.parse(clean));
    } catch (e) {
      setError(`Could not connect: ${e.message}. Make sure Slack MCP is enabled in Claude settings.`);
    } finally { setLoading(false); setStage(""); }
  }

  const sentimentCol = { positive: C.mint, neutral: C.cyan, tense: "#FFB347", urgent: C.rose };

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 22 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: error || summary ? 16 : 0 }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: 10, color: C.muted, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Channel</div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.muted, fontSize: 13 }}>#</span>
            <input value={channel} onChange={e => setChannel(e.target.value)} onKeyDown={e => e.key === "Enter" && run()}
              placeholder="general" style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, padding: "9px 10px 9px 24px", color: C.textBright, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
          </div>
        </div>
        <div style={{ minWidth: 110 }}>
          <div style={{ fontSize: 10, color: C.muted, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Messages</div>
          <select value={msgCount} onChange={e => setMsgCount(Number(e.target.value))}
            style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, padding: "9px 10px", color: C.textBright, fontSize: 13, fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
            {[10, 20, 30, 50].map(n => <option key={n} value={n}>Last {n}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button onClick={run} disabled={loading} style={{
            background: loading ? C.border : `linear-gradient(135deg, ${C.cyan}, ${C.indigo})`,
            color: loading ? C.muted : "#080E1A", border: "none", borderRadius: 7,
            padding: "9px 20px", fontSize: 12, fontWeight: 700, fontFamily: "'DM Mono', monospace",
            letterSpacing: "0.06em", cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap", transition: "all 0.2s",
          }}>
            {loading ? <><Spinner /> {stage.slice(0, 20)}…</> : "▶ SUMMARIZE"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: C.roseDim, border: `1px solid ${C.rose}30`, borderRadius: 8, padding: "10px 14px", color: C.rose, fontSize: 12, marginTop: 12 }}>⚠ {error}</div>
      )}

      {!summary && !loading && !error && (
        <div style={{ textAlign: "center", padding: "28px 0", color: C.muted, borderTop: `1px solid ${C.border}`, marginTop: 16 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
          <div style={{ fontSize: 13 }}>Enter a channel name and click Summarize</div>
          <div style={{ fontSize: 11, marginTop: 4, opacity: 0.6 }}>Requires Slack MCP connected in Claude settings</div>
        </div>
      )}

      {summary && !loading && (
        <div style={{ animation: "fadeUp 0.3s ease both", marginTop: 16 }}>
          <div style={{ background: C.cyanDim, border: `1px solid rgba(0,212,255,0.2)`, borderRadius: 10, padding: "14px 18px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
              <span style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>⚡ TL;DR — #{channel}</span>
              <Chip color={sentimentCol[summary.sentiment] || C.cyan} small>{summary.sentiment}</Chip>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: C.textBright, lineHeight: 1.7 }}>{summary.tldr}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>✅ Action Items</div>
              {summary.actionItems?.length ? summary.actionItems.map((a, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <Chip color={a.urgency === "high" ? C.rose : a.urgency === "medium" ? "#FFB347" : C.mint} small>{a.urgency}</Chip>
                  <span style={{ fontSize: 12, color: C.text, marginLeft: 6 }}>{a.task}</span>
                  {a.owner !== "unknown" && <div style={{ fontSize: 10, color: C.muted, marginTop: 2, marginLeft: 2 }}>→ {a.owner}</div>}
                </div>
              )) : <span style={{ fontSize: 12, color: C.muted }}>None found</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", flex: 1 }}>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>🚧 Blockers</div>
                {summary.blockers?.length ? summary.blockers.map((b, i) => (
                  <div key={i} style={{ fontSize: 12, color: C.text, display: "flex", gap: 6, marginBottom: 4 }}><span style={{ color: C.rose }}>›</span>{b}</div>
                )) : <span style={{ fontSize: 12, color: C.muted }}>✓ None</span>}
              </div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", flex: 1 }}>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>🎯 Decisions</div>
                {summary.keyDecisions?.length ? summary.keyDecisions.map((d, i) => (
                  <div key={i} style={{ fontSize: 12, color: C.text, display: "flex", gap: 6, marginBottom: 4 }}><span style={{ color: C.cyan }}>›</span>{d}</div>
                )) : <span style={{ fontSize: 12, color: C.muted }}>None</span>}
              </div>
            </div>
          </div>
          {summary.topContributors?.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Mono', monospace" }}>👥</span>
              {summary.topContributors.map((c, i) => (
                <span key={i} style={{ background: C.indigoDim, color: C.indigo, border: `1px solid ${C.indigo}30`, borderRadius: 20, padding: "2px 10px", fontSize: 11 }}>{c}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────
export default function PMHub() {
  const [activeTab, setActiveTab] = useState("playbook");
  const [activePain, setActivePain] = useState("stakeholder");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const activePainData = painPoints.find(p => p.id === activePain);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Sora', sans-serif" }}>
      <style>{`
        html, body, #root { background: #080E1A !important; margin: 0; padding: 0; min-height: 100vh; }
        *, *::before, *::after { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; background: #080E1A; }
        ::-webkit-scrollbar-track { background: #080E1A; }
        ::-webkit-scrollbar-thumb { background: #1E2E47; border-radius: 2px; }
        ::-webkit-scrollbar-corner { background: #080E1A; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes shimmer { 0% { opacity:0.5; } 50% { opacity:1; } 100% { opacity:0.5; } }
        .tab-btn { transition: all 0.2s; }
        .tab-btn:hover { color: #E8F0FF !important; }
        .pain-btn { transition: all 0.2s; cursor: pointer; }
        .pain-btn:hover { background: rgba(0,212,255,0.06) !important; }
        .tool-card { transition: all 0.2s; }
        .tool-card:hover { background: #162338 !important; transform: translateY(-2px); }
        input, select { transition: border-color 0.2s; }
        input:focus, select:focus { border-color: #00D4FF !important; }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>

        {/* ── Hero ── */}
        <div style={{
          paddingTop: 52, paddingBottom: 44,
          borderBottom: `1px solid ${C.border}`,
          opacity: mounted ? 1 : 0,
          animation: mounted ? "fadeUp 0.5s ease both" : "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 28, height: 1, background: C.cyan }} />
            <span style={{ fontSize: 11, color: C.cyan, fontFamily: "'DM Mono', monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Delivery PM × AI Workflows
            </span>
          </div>

          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <h1 style={{
                fontFamily: "'Sora', sans-serif", fontSize: "clamp(42px, 7vw, 72px)",
                fontWeight: 800, margin: "0 0 16px", lineHeight: 0.95, letterSpacing: "-0.02em",
                color: C.white,
              }}>
                PM<br />
                <span style={{ background: `linear-gradient(135deg, ${C.cyan}, ${C.indigo})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI</span><br />
                HUB
              </h1>
              <p style={{ fontSize: 15, color: C.mutedLight, lineHeight: 1.7, margin: "0 0 22px", maxWidth: 400 }}>
                Practical AI workflows for Delivery Program Managers. Real prompts with step-by-step guides, live tools, and no fluff.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Chip color={C.cyan}>Stakeholder Reporting</Chip>
                <Chip color={C.rose}>Escalation Handling</Chip>
                <Chip color={C.mint}>Sprint Tracking</Chip>
              </div>
            </div>

            {/* Stats */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", minWidth: 210 }}>
              {[
                { n: "12+", label: "Ready-to-use prompts", color: C.cyan },
                { n: "3", label: "Core PM pain points", color: C.indigo },
                { n: "1", label: "Live AI tool", color: C.mint },
                { n: "∞", label: "Hours saved per week", color: C.rose },
              ].map((s, i, arr) => (
                <div key={i} style={{ paddingBottom: i < arr.length - 1 ? 14 : 0, marginBottom: i < arr.length - 1 ? 14 : 0, borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: "'Sora', sans-serif", lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, marginBottom: 32 }}>
          {[
            { id: "playbook", label: "🎓 Prompt Playbook" },
            { id: "tools", label: "⚙️ Workflow Lab" },
            { id: "roadmap", label: "🗺️ Roadmap" },
          ].map(tab => (
            <button key={tab.id} className="tab-btn" onClick={() => setActiveTab(tab.id)} style={{
              background: "none", border: "none",
              borderBottom: `2px solid ${activeTab === tab.id ? C.cyan : "transparent"}`,
              color: activeTab === tab.id ? C.cyan : C.muted,
              padding: "14px 22px", fontSize: 13, fontWeight: 600,
              fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em",
              cursor: "pointer", marginBottom: -1, transition: "all 0.2s",
            }}>{tab.label}</button>
          ))}
        </div>

        {/* ══ PLAYBOOK ══ */}
        {activeTab === "playbook" && (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              {painPoints.map(p => (
                <button key={p.id} className="pain-btn" onClick={() => setActivePain(p.id)} style={{
                  background: activePain === p.id ? `${p.color}12` : "transparent",
                  border: `1px solid ${activePain === p.id ? p.color : C.border}`,
                  borderRadius: 8, padding: "9px 16px",
                  color: activePain === p.id ? p.color : C.muted,
                  fontSize: 13, fontWeight: 600, fontFamily: "'DM Mono', monospace",
                  display: "flex", alignItems: "center", gap: 7,
                }}>
                  <span>{p.emoji}</span><span>{p.label}</span>
                </button>
              ))}
            </div>

            {activePainData && (
              <>
                <div style={{
                  background: `linear-gradient(135deg, ${activePainData.color}08, transparent)`,
                  border: `1px solid ${activePainData.color}25`,
                  borderRadius: 12, padding: "18px 22px", marginBottom: 18,
                  display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10,
                }}>
                  <div>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{activePainData.emoji}</div>
                    <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: C.white, margin: "0 0 4px" }}>{activePainData.label}</h2>
                    <p style={{ margin: 0, fontSize: 13, color: C.mutedLight }}>{activePainData.desc}</p>
                  </div>
                  <Chip color={activePainData.color}>{activePainData.tag}</Chip>
                </div>
                {activePainData.prompts.map((p, i) => <PromptCard key={i} prompt={p} accentColor={activePainData.color} />)}
                <div style={{ border: `1px dashed ${C.border}`, borderRadius: 10, padding: "18px", textAlign: "center", color: C.muted, fontSize: 13 }}>
                  + More prompts for {activePainData.label} coming soon
                </div>
              </>
            )}
          </div>
        )}

        {/* ══ TOOLS ══ */}
        {activeTab === "tools" && (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            <div style={{ marginBottom: 22 }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: C.white, margin: "0 0 6px" }}>Live Workflow Lab</h2>
              <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>AI tools built for real Delivery PM workflows — use them right here, no setup needed.</p>
            </div>

            {/* Slack Summarizer — live */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>💬</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: C.white, fontFamily: "'Sora', sans-serif" }}>Slack Channel Summarizer</span>
                    <Chip color={C.mint} small>Live</Chip>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                    Reads any Slack channel and extracts blockers, decisions & action items using Claude AI
                  </div>
                </div>
              </div>
              <SlackSummarizer />
            </div>

            {/* Coming soon grid */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Coming Soon</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 12 }}>
                {workflowTools.map((t, i) => (
                  <div key={i} className="tool-card" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "18px", opacity: 0.5 }}>
                    <div style={{ fontSize: 24, marginBottom: 10 }}>{t.emoji}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.textBright, fontFamily: "'Sora', sans-serif", marginBottom: 6 }}>{t.name}</div>
                    <p style={{ margin: 0, fontSize: 12, color: C.mutedLight, lineHeight: 1.5 }}>{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ ROADMAP ══ */}
        {activeTab === "roadmap" && (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: C.white, margin: "0 0 6px" }}>What's Being Built</h2>
              <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>This hub grows with real PM needs. Here's what's coming next.</p>
            </div>

            {[
              {
                phase: "Now — Live", color: C.mint, status: "live",
                items: [
                  { name: "Prompt Playbook", desc: "12 copy-paste prompts across 3 PM pain points with step-by-step guides" },
                  { name: "Slack Summarizer", desc: "AI reads any Slack channel and extracts blockers, decisions & action items" },
                ]
              },
              {
                phase: "Next — In Progress", color: C.cyan, status: "building",
                items: [
                  { name: "RAID Log Agent", desc: "Paste meeting notes → auto-populated RAID log ready to share" },
                  { name: "Case Study Journal", desc: "Real delivery problems, exact prompts used, measurable outcomes" },
                  { name: "More Prompts", desc: "Release readiness, capacity planning, and dependency mapping prompts" },
                ]
              },
              {
                phase: "Later — Planned", color: C.indigo, status: "planned",
                items: [
                  { name: "Status Report Bot", desc: "Connects to Jira + Slack and drafts weekly reports for your approval" },
                  { name: "Escalation Triage", desc: "Classifies incidents by severity and generates tailored comms per audience" },
                  { name: "Retro Pattern Tracker", desc: "Persistent retro analysis across sprints — spots what keeps going wrong" },
                ]
              },
            ].map((phase, pi) => (
              <div key={pi} style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: phase.color, boxShadow: phase.status === "live" ? `0 0 8px ${phase.color}` : "none", animation: phase.status === "live" ? "pulse 1.4s ease-in-out infinite" : "none" }} />
                  <span style={{ fontSize: 12, color: phase.color, fontFamily: "'DM Mono', monospace", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{phase.phase}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
                  {phase.items.map((item, ii) => (
                    <div key={ii} style={{
                      background: C.card, border: `1px solid ${phase.status === "live" ? phase.color + "30" : C.border}`,
                      borderRadius: 10, padding: "16px 18px",
                      opacity: phase.status === "planned" ? 0.65 : 1,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.textBright, fontFamily: "'Sora', sans-serif" }}>{item.name}</span>
                        {phase.status === "live" && <Chip color={C.mint} small>Live</Chip>}
                        {phase.status === "building" && <Chip color={C.cyan} small>Soon</Chip>}
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: C.mutedLight, lineHeight: 1.6 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ background: `${C.indigo}08`, border: `1px dashed ${C.indigo}30`, borderRadius: 12, padding: "22px", textAlign: "center", marginTop: 8 }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>💡</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.textBright, fontFamily: "'Sora', sans-serif", marginBottom: 6 }}>Have a PM pain point to solve?</div>
              <p style={{ color: C.mutedLight, fontSize: 13, margin: 0 }}>This hub is built from real delivery problems. If you have a workflow that needs automating, reach out on LinkedIn.</p>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 56, padding: "24px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, background: `linear-gradient(135deg, ${C.cyan}, ${C.indigo})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            PM AI Hub
          </span>
          <span style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Mono', monospace" }}>Built by a Delivery PM · Powered by Claude</span>
        </div>
      </div>
    </div>
  );
}
