import { useState, useEffect, useRef } from "react";

const C = {
  bg:          "#050805",
  surface:     "#090D09",
  card:        "#0D130D",
  cardHover:   "#111811",
  border:      "#162016",
  borderHover: "#1F2F1F",
  green:       "#22C55E",
  greenBright: "#4ADE80",
  greenDim:    "rgba(34,197,94,0.08)",
  greenGlow:   "rgba(34,197,94,0.18)",
  lime:        "#A3E635",
  limeDim:     "rgba(163,230,53,0.08)",
  teal:        "#2DD4BF",
  tealDim:     "rgba(45,212,191,0.08)",
  rose:        "#F43F5E",
  roseDim:     "rgba(244,63,94,0.08)",
  yellow:      "#EAB308",
  yellowDim:   "rgba(234,179,8,0.08)",
  text:        "#B8D4B8",
  textBright:  "#E0F0E0",
  muted:       "#2E4A2E",
  mutedLight:  "#4A6A4A",
  white:       "#F0FFF0",
};

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
const allPrompts = [
  // STAKEHOLDER
  {
    id: "s1", category: "stakeholder", categoryLabel: "Stakeholder Reporting",
    categoryColor: C.green, emoji: "📊",
    title: "Weekly Status Report Generator",
    difficulty: "Beginner", time: "2 min",
    tags: ["reporting", "weekly", "exec", "status", "RAG"],
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
    tips: ["Add 'Audience: CTO' or 'Audience: Client' to shift tone automatically", "Include velocity numbers — Claude flags if you're trending behind", "Paste your Slack standup thread directly — messy input is fine"],
    steps: ["Copy your sprint board summary, standup notes, or Jira export", "Replace [SPRINT DATA] at the bottom with your content", "Open claude.ai or chat.openai.com — free to use", "Paste the full prompt and press Enter", "Review the output — adjust the RAG status if needed", "Copy into your email or Confluence page"],
  },
  {
    id: "s2", category: "stakeholder", categoryLabel: "Stakeholder Reporting",
    categoryColor: C.green, emoji: "📊",
    title: "Stakeholder Tailoring Engine",
    difficulty: "Intermediate", time: "3 min",
    tags: ["stakeholder", "communication", "CTO", "CPO", "client", "tailoring"],
    problem: "Your CTO, CPO, and client all want updates — but need totally different levels of detail and framing.",
    prompt: `I need to communicate the same project update to three different stakeholders. Rewrite the update below THREE times:

1. CTO VERSION: Technical depth, system risks, engineering velocity
2. CPO VERSION: Feature progress, user impact, roadmap alignment
3. CLIENT VERSION: Milestone status, value delivered, what's next

Keep each under 150 words. No internal jargon in the client version.

UPDATE TO ADAPT:
[Paste your raw update here]`,
    tips: ["Works great with rough bullet points — no need to polish the input", "Add 'Relationship: new client, trust still building' for tone calibration", "Run it again with 'make the CTO version more alarming' to escalate"],
    steps: ["Write a rough 3-5 sentence update about where the project stands today", "Paste it at the bottom replacing [UPDATE TO ADAPT]", "Run it — 3 tailored versions in under 10 seconds", "Copy the right version per audience into email", "Save your update template to reuse each Friday"],
  },
  {
    id: "s3", category: "stakeholder", categoryLabel: "Stakeholder Reporting",
    categoryColor: C.green, emoji: "📊",
    title: "Meeting Minutes Summariser",
    difficulty: "Beginner", time: "2 min",
    tags: ["meeting", "minutes", "summary", "decisions", "actions"],
    problem: "Long meetings produce messy notes. You need clean, shareable minutes with decisions and action items extracted — in 2 minutes.",
    prompt: `You are a Delivery PM. Summarise these meeting notes into clean, shareable minutes.

OUTPUT FORMAT:
- Date & Attendees
- Purpose of Meeting (1 sentence)
- Key Decisions Made (bullet list)
- Action Items (Owner | Task | Due Date)
- Parking Lot / Open Questions
- Next Meeting: [date if mentioned]

TONE: Professional, neutral, blameless. Under 300 words total.

RAW NOTES:
[Paste your raw meeting notes here]`,
    tips: ["Works on voice-to-text transcripts — doesn't need clean input", "Add 'Flag any decisions that need sign-off from leadership' for governance-heavy projects", "Paste directly into Confluence after — format holds"],
    steps: ["Take rough notes during the meeting (voice memo, typed, anything)", "Paste at the bottom replacing [RAW NOTES]", "Run it — clean minutes in seconds", "Review action items and confirm owners match what was discussed", "Share with attendees within 30 minutes while it's fresh"],
  },
  {
    id: "s4", category: "stakeholder", categoryLabel: "Stakeholder Reporting",
    categoryColor: C.green, emoji: "📊",
    title: "Exec Briefing One-Pager",
    difficulty: "Intermediate", time: "4 min",
    tags: ["exec", "briefing", "one-pager", "steering", "board"],
    problem: "You have 5 minutes in a steering committee. You need a tight, credible one-pager that covers everything without losing the room.",
    prompt: `Create a concise executive briefing one-pager for a steering committee review.

SECTIONS:
1. Programme at a Glance (traffic light + 1 sentence per workstream)
2. Top 3 Achievements This Period
3. Critical Issues & Mitigations (max 3)
4. Budget Status (on track / at risk — % consumed vs planned)
5. Key Decisions Needed from Leadership
6. Outlook for Next Period (2-3 bullets)

MAX LENGTH: Fits one printed page. No waffle.

PROGRAMME DATA:
[Paste your programme status data here]`,
    tips: ["Add 'Audience: non-technical board members' if needed", "'Decisions Needed' section is gold — it forces action, not just awareness", "Run through twice: once for content, once asking Claude to 'cut 20% of words'"],
    steps: ["Gather your workstream statuses, key wins, issues, and budget info", "Paste all of it at the bottom replacing [PROGRAMME DATA]", "Run it — one-pager structure in seconds", "Review 'Decisions Needed' section most carefully — this is why you're in the room", "Print or paste into your slide deck as the opening page"],
  },

  // ESCALATION
  {
    id: "e1", category: "escalation", categoryLabel: "Escalation & Incidents",
    categoryColor: C.rose, emoji: "🚨",
    title: "Escalation Draft Generator",
    difficulty: "Beginner", time: "90 sec",
    tags: ["escalation", "incident", "urgent", "comms", "manager"],
    problem: "Something just broke or missed. You need to escalate fast and professionally — without panic, blame, or missing context.",
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
    tips: ["Add 'we have a workaround' or 'no workaround yet' — changes tone significantly", "'This started 2 hours ago' gives Claude urgency context", "Run it twice — once for your manager, once for the client — same situation, different framing"],
    steps: ["Describe the situation in 2-3 plain sentences — what happened, when, impact", "Name who you're escalating to at the bottom", "Run the prompt — structured escalation in 10 seconds", "Check 'What I Need From You' — make the ask crystal clear and actionable", "Send within 5 minutes — speed signals control in escalations"],
  },
  {
    id: "e2", category: "escalation", categoryLabel: "Escalation & Incidents",
    categoryColor: C.rose, emoji: "🚨",
    title: "Post-Mortem Drafter",
    difficulty: "Intermediate", time: "5 min",
    tags: ["post-mortem", "incident", "blameless", "RCA", "timeline"],
    problem: "Post-mortems are painful to write. Raw notes, tired team — but leadership wants a polished document by EOD.",
    prompt: `Write a blameless post-mortem document from the notes below.

SECTIONS:
1. Incident Summary (severity, duration, impact)
2. Timeline (key events in chronological order)
3. Root Cause Analysis (use 5 Whys if applicable)
4. What Went Well
5. What Went Wrong
6. Action Items (owner, due date, priority)

PRINCIPLE: Blameless. Focus on systems and processes, not individuals.

RAW NOTES / SLACK THREAD:
[Paste your incident notes here]`,
    tips: ["'Blameless' framing keeps it constructive — Claude avoids naming individuals", "Add 'customer-facing impact: yes/no' to calibrate severity language", "Paste Slack thread directly — Claude extracts the timeline automatically"],
    steps: ["Gather raw notes — Slack thread, incident log, bullet points all work", "Paste everything at the bottom (messy is fine)", "Run it — structured post-mortem instantly", "Review Root Cause section carefully — needs your real knowledge", "Share with team before finalising — confirm action item owners"],
  },
  {
    id: "e3", category: "escalation", categoryLabel: "Escalation & Incidents",
    categoryColor: C.rose, emoji: "🚨",
    title: "Risk Register Updater",
    difficulty: "Beginner", time: "3 min",
    tags: ["risk", "register", "RAID", "mitigation", "governance"],
    problem: "Your risk register is always out of date. Every project review exposes gaps — but updating it manually takes an hour you don't have.",
    prompt: `You are a Delivery PM. Update the risk register based on new information from the meeting/sprint notes below.

FOR EACH NEW OR CHANGED RISK, OUTPUT:
- Risk ID (auto-assign if new)
- Risk Description (1-2 sentences)
- Likelihood (High / Medium / Low)
- Impact (High / Medium / Low)
- Overall Rating (H×H = Critical, etc.)
- Owner
- Mitigation Action
- Status (Open / Mitigated / Accepted / Closed)

EXISTING REGISTER: [Paste current risk register or leave blank if starting fresh]

NEW INFORMATION:
[Paste meeting notes, standup updates, or sprint review notes]`,
    tips: ["Leave 'Existing Register' blank to generate a fresh one from notes", "Add 'Focus on delivery timeline risks' to filter noise", "Run after every sprint review to keep it current automatically"],
    steps: ["Copy your latest meeting notes or sprint review into the prompt", "Paste your existing register too if you have one", "Run it — new and updated risks extracted automatically", "Review likelihood and impact ratings against your own judgment", "Paste the output into your RAID log or Confluence page"],
  },
  {
    id: "e4", category: "escalation", categoryLabel: "Escalation & Incidents",
    categoryColor: C.rose, emoji: "🚨",
    title: "Difficult Conversation Preparer",
    difficulty: "Advanced", time: "5 min",
    tags: ["stakeholder", "conflict", "difficult", "conversation", "negotiation"],
    problem: "You need to deliver bad news, push back on scope, or manage a difficult stakeholder. You want to plan the conversation before you walk in.",
    prompt: `Help me prepare for a difficult PM conversation.

CONVERSATION TYPE: [e.g. delivering bad news about a delay / pushing back on scope / managing an unhappy client]

CONTEXT:
- Who I'm speaking with: [role and relationship]
- The core message I need to deliver: [1-2 sentences]
- What I'm worried they'll say: [their likely pushback]
- What outcome I want: [what success looks like]

PREPARE:
1. Recommended opening (first 2-3 sentences to say)
2. The core message — framed clearly and without blame
3. Top 3 objections they might raise + how to respond to each
4. How to close with a clear next step
5. What NOT to say in this conversation`,
    tips: ["The more context you give, the better the prep", "Run it as roleplay: 'Now act as [their name] and push back on what I just said'", "Use the 'What NOT to say' section — it's often the most valuable part"],
    steps: ["Fill in all 4 context fields honestly — don't sanitise", "Run the prompt to get your opening and objection responses", "Practice the opening out loud before the conversation", "Keep the objection responses nearby during the meeting", "After: run a debrief — 'How did the conversation go?' to extract learnings"],
  },

  // SPRINT
  {
    id: "sp1", category: "sprint", categoryLabel: "Sprint & Delivery Tracking",
    categoryColor: C.lime, emoji: "⚡",
    title: "Sprint Risk Radar",
    difficulty: "Beginner", time: "2 min",
    tags: ["sprint", "risk", "velocity", "blocker", "standup"],
    problem: "Mid-sprint and something feels off — but you can't pinpoint what. You need a second brain to pressure-test your delivery.",
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
    tips: ["Run mid-sprint on Wednesday — enough data, still time to act", "Include team OOO and capacity notes — Claude factors these in", "Use the standup questions verbatim — designed to surface blockers without blame"],
    steps: ["Copy your sprint board status or paste standup notes", "Add OOO or capacity notes at the bottom", "Run it mid-sprint", "Use 'Questions to ask in standup' word for word", "Run every sprint and compare — patterns appear over 3-4 sprints"],
  },
  {
    id: "sp2", category: "sprint", categoryLabel: "Sprint & Delivery Tracking",
    categoryColor: C.lime, emoji: "⚡",
    title: "Retro Insight Extractor",
    difficulty: "Intermediate", time: "4 min",
    tags: ["retro", "retrospective", "patterns", "team", "improvement"],
    problem: "Retros generate great conversation but insights disappear. The same problems recur because no one tracks themes across sprints.",
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
    tips: ["Works best with 3+ sprints of data", "Label each sprint in the paste (Sprint 12, Sprint 13)", "Ask Claude to 'prioritise by frequency AND team energy cost' for better ranking"],
    steps: ["Collect retro notes from last 3-5 sprints (Confluence, Miro, sticky note photos all work)", "Label each sprint clearly and paste them all in", "Run it — Claude surfaces patterns you're too close to see", "Share 'What Went Well' with the team first", "Turn top 3 improvements into sprint items with assigned owners"],
  },
  {
    id: "sp3", category: "sprint", categoryLabel: "Sprint & Delivery Tracking",
    categoryColor: C.lime, emoji: "⚡",
    title: "Sprint Goal Writer",
    difficulty: "Beginner", time: "2 min",
    tags: ["sprint", "goal", "planning", "objective", "focus"],
    problem: "Sprint goals are always vague ('continue development') or non-existent. A clear sprint goal aligns the team and makes success measurable.",
    prompt: `Write a clear, measurable sprint goal based on the work planned for this sprint.

A good sprint goal:
- Is 1-2 sentences
- Describes the outcome, not the tasks
- Is measurable (you can say yes/no at the end)
- Aligns to a business objective
- Motivates the team

SPRINT BACKLOG SUMMARY:
[Paste your sprint ticket list or backlog summary]

BUSINESS CONTEXT:
[What milestone or objective does this sprint support?]`,
    tips: ["The goal should survive even if 20% of tickets get cut", "Run it then ask: 'Give me 3 alternative versions — one more ambitious, one safer'", "Post the sprint goal in your team's Slack channel at sprint start"],
    steps: ["List or paste the tickets planned for the sprint", "Add 1-2 sentences on what business goal this sprint supports", "Run it — get a sharp, testable sprint goal", "Share with the team at sprint planning for buy-in", "Reference it at the end: did we hit the goal? Why/why not?"],
  },
  {
    id: "sp4", category: "sprint", categoryLabel: "Sprint & Delivery Tracking",
    categoryColor: C.lime, emoji: "⚡",
    title: "Dependency Mapper",
    difficulty: "Intermediate", time: "3 min",
    tags: ["dependency", "blocker", "cross-team", "planning", "risk"],
    problem: "Cross-team dependencies are the #1 silent killer of sprint velocity. You need to surface them early, before they become blockers.",
    prompt: `Analyse the following sprint/programme plan and identify all cross-team dependencies.

FOR EACH DEPENDENCY OUTPUT:
- What: The dependency (what needs to happen)
- Who depends on whom: Team A is waiting on Team B for X
- When: When is it needed by?
- Risk Level: High / Medium / Low (based on how critical it is to the sprint goal)
- Suggested Action: What should the PM do right now?

Also flag: any circular dependencies, and any dependencies with no named owner.

PLAN / BACKLOG / NOTES:
[Paste your sprint plan, programme plan, or standup notes]`,
    tips: ["Run at sprint planning to catch issues before the sprint starts", "Add 'We have a delivery deadline of [date]' to sharpen the risk ratings", "Export the output as a table to paste directly into your RAID log"],
    steps: ["Paste your sprint plan, backlog, or cross-team notes", "Add your delivery deadline if there is one", "Run it — all dependencies listed with risk levels", "Immediately reach out to the owners of High risk dependencies", "Add to your RAID log and track weekly"],
  },
  {
    id: "sp5", category: "sprint", categoryLabel: "Sprint & Delivery Tracking",
    categoryColor: C.lime, emoji: "⚡",
    title: "Release Readiness Checker",
    difficulty: "Intermediate", time: "4 min",
    tags: ["release", "readiness", "go-live", "checklist", "deployment"],
    problem: "Every release has last-minute surprises. You need a systematic go/no-go assessment before you push to production.",
    prompt: `Act as a senior release manager. Assess the release readiness based on the information below and give a Go / No-Go recommendation.

EVALUATE AGAINST:
1. Code quality (test coverage, open bugs, code review status)
2. Environment readiness (staging tested, infra provisioned)
3. Rollback plan (exists and tested?)
4. Stakeholder sign-off (product, QA, security, business)
5. Communication plan (users notified? support briefed?)
6. Monitoring & alerting (in place for new features?)
7. Data migrations (tested and reversible?)

OUTPUT:
- Overall: GO ✅ / NO-GO ❌ / CONDITIONAL GO ⚠️
- What's ready
- What's not ready (blockers)
- Conditions for Go (if conditional)
- Recommended release window

RELEASE INFORMATION:
[Paste your release notes, PR list, test results, or sign-off status]`,
    tips: ["Run 48 hours before release — enough time to fix conditional issues", "Add 'We cannot delay — business deadline is X' to get a conditional Go with specific conditions", "Share the output with your engineering lead to align on the final decision"],
    steps: ["Gather test results, open bug list, sign-off status, and infra notes", "Paste everything at the bottom", "Run it — Go/No-Go with clear reasoning", "Review blockers list with your tech lead immediately", "If Conditional Go: turn conditions into a checklist for the 24 hours before release"],
  },
];

const CATEGORIES = [
  { id: "all", label: "All Prompts", color: C.green, emoji: "🔍" },
  { id: "stakeholder", label: "Stakeholder Reporting", color: C.green, emoji: "📊" },
  { id: "escalation", label: "Escalation & Incidents", color: C.rose, emoji: "🚨" },
  { id: "sprint", label: "Sprint & Delivery", color: C.lime, emoji: "⚡" },
];

const ROADMAP_PHASES = [
  {
    phase: "Now — Live", color: C.green, status: "live",
    items: [
      { name: "Prompt Playbook", desc: "13 copy-paste prompts across 3 PM pain points, each with step-by-step guides for beginners" },
      { name: "Workflow Lab", desc: "Slack Summariser — ready-to-use prompts for Claude.ai with Slack MCP connected" },
      { name: "Prompt Search", desc: "Search across all prompts by keyword, category, or PM pain point" },
    ],
  },
  {
    phase: "Next — Building", color: C.teal, status: "building",
    items: [
      { name: "RAID Log Agent", desc: "Paste meeting notes → auto-populated RAID log ready to share" },
      { name: "Case Study Journal", desc: "Real delivery problems, exact prompts used, measurable time saved" },
      { name: "Jira Integration Prompts", desc: "Prompt workflows that work directly with Jira exports and API data" },
    ],
  },
  {
    phase: "Later — Planned", color: C.lime, status: "planned",
    items: [
      { name: "Live Backend Tools", desc: "Vercel serverless functions to power real-time Slack and Jira integrations on this site" },
      { name: "Community Prompts", desc: "Other PMs submit prompts — curated and quality-checked before publishing" },
      { name: "Weekly PM AI Digest", desc: "Email digest of new prompts and AI workflow tips for Delivery PMs" },
    ],
  },
];

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

function Chip({ children, color, small, onClick, active }) {
  return (
    <span onClick={onClick} style={{
      display: "inline-block",
      background: active ? `${color}25` : `${color}12`,
      color, border: `1px solid ${active ? color + "70" : color + "35"}`,
      borderRadius: 4,
      padding: small ? "1px 7px" : "3px 10px",
      fontSize: small ? 10 : 11, fontWeight: 700,
      letterSpacing: "0.1em", textTransform: "uppercase",
      fontFamily: "'DM Mono', monospace",
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.15s",
    }}>{children}</span>
  );
}

function DiffPip({ level }) {
  const map = { Beginner: C.green, Intermediate: C.teal, Advanced: C.rose };
  return <Chip color={map[level] || C.mutedLight} small>{level}</Chip>;
}

function PromptCard({ prompt }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("prompt");

  function copy() {
    navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const ac = prompt.categoryColor;

  return (
    <div style={{
      background: C.card, border: `1px solid ${open ? ac + "45" : C.border}`,
      borderRadius: 10, marginBottom: 12, overflow: "hidden",
      transition: "border-color 0.2s",
    }}>
      <div onClick={() => setOpen(!open)} style={{
        padding: "16px 20px", cursor: "pointer",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 7, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 14 }}>{prompt.emoji}</span>
            <DiffPip level={prompt.difficulty} />
            <span style={{ color: C.mutedLight, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>⏱ {prompt.time}</span>
            <Chip color={ac} small>{prompt.categoryLabel}</Chip>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.textBright, marginBottom: 4 }}>{prompt.title}</div>
          <div style={{ fontSize: 12, color: C.mutedLight, lineHeight: 1.55 }}>{prompt.problem}</div>
        </div>
        <span style={{
          color: C.mutedLight, fontSize: 15, flexShrink: 0, marginTop: 2,
          display: "inline-block",
          transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s",
        }}>▾</span>
      </div>

      {open && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "16px 20px" }}>
          <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: `1px solid ${C.border}` }}>
            {[{ id: "prompt", label: "📋 Prompt" }, { id: "howto", label: "📖 Step-by-Step" }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                background: "none", border: "none",
                borderBottom: `2px solid ${tab === t.id ? ac : "transparent"}`,
                color: tab === t.id ? ac : C.mutedLight,
                padding: "6px 16px", fontSize: 11, fontWeight: 700,
                fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em",
                cursor: "pointer", textTransform: "uppercase",
                marginBottom: -1, transition: "all 0.15s",
              }}>{t.label}</button>
            ))}
          </div>

          {tab === "prompt" && (
            <>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 16px", marginBottom: 14 }}>
                <pre style={{ margin: 0, fontSize: 12, color: C.text, fontFamily: "'DM Mono', monospace", whiteSpace: "pre-wrap", lineHeight: 1.75 }}>
                  {prompt.prompt}
                </pre>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: C.mutedLight, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>💡 Pro Tips</div>
                {prompt.tips.map((tip, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <span style={{ color: ac, flexShrink: 0, lineHeight: 1.6 }}>→</span>
                    <span style={{ fontSize: 12, color: C.mutedLight, lineHeight: 1.55 }}>{tip}</span>
                  </div>
                ))}
              </div>
              <button onClick={copy} style={{
                background: copied ? C.greenDim : `${ac}12`,
                border: `1px solid ${copied ? C.green : ac}50`,
                color: copied ? C.green : ac,
                borderRadius: 6, padding: "8px 20px", fontSize: 12, fontWeight: 700,
                fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em",
                cursor: "pointer", transition: "all 0.2s",
              }}>
                {copied ? "✓ COPIED TO CLIPBOARD" : "COPY PROMPT"}
              </button>
            </>
          )}

          {tab === "howto" && (
            <div>
              <div style={{ fontSize: 12, color: C.mutedLight, marginBottom: 18, lineHeight: 1.65, background: C.greenDim, border: `1px solid ${C.green}20`, borderRadius: 8, padding: "10px 14px" }}>
                🌱 New to AI prompting? Follow these steps exactly — no experience needed.
              </div>
              {prompt.steps.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "flex-start" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    background: `${ac}12`, border: `1px solid ${ac}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: ac, fontFamily: "'DM Mono', monospace",
                  }}>{i + 1}</div>
                  <div style={{ paddingTop: 4, fontSize: 13, color: C.text, lineHeight: 1.65 }}>{step}</div>
                </div>
              ))}
              <div style={{ background: `${ac}08`, border: `1px dashed ${ac}30`, borderRadius: 8, padding: "12px 16px", marginTop: 4 }}>
                <div style={{ fontSize: 10, color: ac, fontFamily: "'DM Mono', monospace", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 5 }}>WHERE TO RUN THIS</div>
                <div style={{ fontSize: 12, color: C.mutedLight, lineHeight: 1.6 }}>
                  Open <strong style={{ color: C.textBright }}>claude.ai</strong> or <strong style={{ color: C.textBright }}>chat.openai.com</strong> in a new tab, paste the full prompt, and press Enter. Free to start — no credit card needed.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Slack How-To
function SlackHowTo() {
  const [copiedIdx, setCopiedIdx] = useState(null);

  const slackPrompts = [
    {
      label: "Quick Channel Summary",
      desc: "Get a fast PM briefing from any Slack channel",
      prompt: `Read the last 30 messages from Slack channel #[your-channel-name] and give me a PM briefing:

- TL;DR (2-3 sentences — what is this channel about right now?)
- Action items (with owner and urgency: high/medium/low)
- Blockers mentioned
- Key decisions made
- Overall sentiment (positive / neutral / tense / urgent)
- Anyone who needs a follow-up from me`,
    },
    {
      label: "Escalation Signal Scanner",
      desc: "Find hidden escalation risks before they blow up",
      prompt: `Read the last 50 messages from #[channel-name] and identify escalation risks.

Flag anything that signals:
- Unresolved blockers older than 24 hours
- Frustrated language from stakeholders or team
- Decisions that were raised but never confirmed
- Work that's been deprioritised without communication
- Anyone who went quiet who should be active

Format as a risk briefing I can forward to my manager.`,
    },
    {
      label: "Daily Standup Digest",
      desc: "Turn a standup channel into a structured digest",
      prompt: `Read today's messages from #[standup-channel-name] and create a standup digest.

For each person who posted:
- What they completed yesterday
- What they're working on today
- Any blockers they mentioned

Then add:
- Team-level blockers summary
- Any risks to today's sprint goals
- Anyone who didn't post (flag as absent)

Keep the whole thing under 250 words.`,
    },
    {
      label: "Cross-Team Dependency Check",
      desc: "Surface hidden dependencies across multiple channels",
      prompt: `Read the last 30 messages from each of these Slack channels: #[channel-1], #[channel-2], #[channel-3]

Identify all cross-team dependencies mentioned or implied:
- Team A waiting on Team B for X
- Any handoffs that haven't been confirmed
- Shared resources being contested
- Timeline misalignments between teams

Format as a dependency table: Who | Waiting For | What | By When | Risk Level`,
    },
  ];

  function copy(text, idx) {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  return (
    <div>
      {/* Why static sites can't do live API calls */}
      <div style={{ background: C.yellowDim, border: `1px solid ${C.yellow}30`, borderRadius: 10, padding: "14px 18px", marginBottom: 22, display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.yellow, marginBottom: 4 }}>Why it runs in Claude.ai, not here</div>
          <div style={{ fontSize: 12, color: C.mutedLight, lineHeight: 1.65 }}>
            GitHub Pages is a static site — browsers block direct API calls to Slack and Claude for security (CORS). These prompts run natively in <strong style={{ color: C.textBright }}>Claude.ai</strong> where Slack MCP is connected as a first-class integration — no workarounds needed.
          </div>
        </div>
      </div>

      {/* 3-step how-to */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: C.mutedLight, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>How to run these in 3 steps</div>
        {[
          { n: "1", title: "Connect Slack to Claude.ai", desc: "Go to claude.ai → Settings → Integrations → Connect Slack. Takes 60 seconds. Free account works." },
          { n: "2", title: "Open a new Claude conversation", desc: "Go to claude.ai and start a fresh chat. No special mode or setup needed." },
          { n: "3", title: "Paste a prompt below, replace the channel name, press Enter", desc: "Claude reads your Slack channel live and returns a structured PM briefing instantly." },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "flex-start" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              background: C.greenDim, border: `1px solid ${C.green}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: C.green, fontFamily: "'DM Mono', monospace",
            }}>{s.n}</div>
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.textBright, marginBottom: 2 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: C.mutedLight, lineHeight: 1.55 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Prompt cards */}
      <div style={{ fontSize: 11, color: C.mutedLight, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
        Copy a prompt → paste into Claude.ai
      </div>
      {slackPrompts.map((p, i) => (
        <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, gap: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.textBright, marginBottom: 2 }}>{p.label}</div>
              <div style={{ fontSize: 11, color: C.mutedLight }}>{p.desc}</div>
            </div>
            <button onClick={() => copy(p.prompt, i)} style={{
              background: copiedIdx === i ? C.greenDim : "transparent",
              border: `1px solid ${copiedIdx === i ? C.green : C.border}`,
              color: copiedIdx === i ? C.green : C.mutedLight,
              borderRadius: 6, padding: "5px 12px", fontSize: 11,
              fontFamily: "'DM Mono', monospace", fontWeight: 700,
              letterSpacing: "0.06em", cursor: "pointer",
              transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0,
            }}>
              {copiedIdx === i ? "✓ COPIED" : "COPY"}
            </button>
          </div>
          <pre style={{
            margin: 0, fontSize: 11, color: C.mutedLight, fontFamily: "'DM Mono', monospace",
            whiteSpace: "pre-wrap", lineHeight: 1.7,
            background: C.surface, borderRadius: 7, padding: "10px 14px",
          }}>{p.prompt}</pre>
        </div>
      ))}

      {/* CTA */}
      <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        background: `linear-gradient(135deg, ${C.green}, ${C.teal})`,
        color: C.bg, borderRadius: 10, padding: "14px 24px",
        fontSize: 12, fontWeight: 700, fontFamily: "'DM Mono', monospace",
        letterSpacing: "0.08em", textDecoration: "none",
        transition: "opacity 0.2s", marginTop: 16,
      }}>
        OPEN CLAUDE.AI → RUN THESE PROMPTS LIVE ↗
      </a>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function PMHub() {
  const [activeTab, setActiveTab] = useState("playbook");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  // Filter logic
  const filtered = allPrompts.filter(p => {
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchCat;
    const matchSearch =
      p.title.toLowerCase().includes(q) ||
      p.problem.toLowerCase().includes(q) ||
      p.tags.some(t => t.includes(q)) ||
      p.categoryLabel.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Sora', sans-serif" }}>
      <style>{`
        html, body, #root { background: #050805 !important; margin: 0; padding: 0; min-height: 100vh; }
        *, *::before, *::after { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; background: #050805; }
        ::-webkit-scrollbar-track { background: #050805; }
        ::-webkit-scrollbar-thumb { background: #162016; border-radius: 2px; }
        ::-webkit-scrollbar-corner { background: #050805; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 6px currentColor;}50%{opacity:0.5;box-shadow:none;} }
        .tab-btn:hover { color: #E0F0E0 !important; background: rgba(34,197,94,0.04) !important; }
        .pain-btn:hover { background: rgba(34,197,94,0.06) !important; }
        .tool-card:hover { background: #111811 !important; transform: translateY(-2px); }
        input::placeholder { color: #2E4A2E; }
        input:focus { border-color: #22C55E !important; outline: none; }
        a:hover { opacity: 0.82; }
      `}</style>

      {/* Grid bg */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `linear-gradient(${C.border} 1px, transparent 1px), linear-gradient(90deg, ${C.border} 1px, transparent 1px)`,
        backgroundSize: "52px 52px", opacity: 0.35,
      }} />

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>

        {/* ── HERO ── */}
        <div style={{
          paddingTop: 48, paddingBottom: 42,
          borderBottom: `1px solid ${C.border}`,
          opacity: mounted ? 1 : 0,
          animation: mounted ? "fadeUp 0.5s ease both" : "none",
        }}>
          {/* Eyebrow */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, animation: "pulse 2s ease-in-out infinite", color: C.green }} />
            <span style={{ fontSize: 11, color: C.green, fontFamily: "'DM Mono', monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Delivery PM × AI Workflows
            </span>
          </div>

          <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <h1 style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "clamp(46px, 8vw, 78px)",
                fontWeight: 800, margin: "0 0 16px",
                lineHeight: 0.92, letterSpacing: "-0.03em", color: C.white,
              }}>
                PM<br />
                <span style={{ background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenBright} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI</span><br />
                HUB
              </h1>
              <p style={{ fontSize: 15, color: C.mutedLight, lineHeight: 1.75, margin: "0 0 20px", maxWidth: 420 }}>
                Practical AI workflows for Delivery Program Managers. Real prompts with step-by-step guides — built by <strong style={{ color: C.textBright }}>Nikhil Thomas A</strong>.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                <Chip color={C.green}>Stakeholder Reporting</Chip>
                <Chip color={C.rose}>Escalation Handling</Chip>
                <Chip color={C.lime}>Sprint Tracking</Chip>
              </div>
              <a href="https://www.linkedin.com/in/nikhil-thomas-a-58538117a/" target="_blank" rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  color: C.mutedLight, fontSize: 12, textDecoration: "none",
                  fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em",
                  border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 12px",
                  transition: "all 0.2s",
                }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={C.mutedLight}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                Nikhil Thomas A
              </a>
            </div>

            {/* Stats */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px", minWidth: 195 }}>
              {[
                { n: "13", label: "Ready-to-use prompts", c: C.green },
                { n: "3", label: "PM pain point areas", c: C.teal },
                { n: "4", label: "Slack AI prompts", c: C.lime },
                { n: "∞", label: "Hours saved per week", c: C.rose },
              ].map((s, i, arr) => (
                <div key={i} style={{ paddingBottom: i < arr.length - 1 ? 13 : 0, marginBottom: i < arr.length - 1 ? 13 : 0, borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.c, fontFamily: "'Sora', sans-serif", lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontSize: 11, color: C.mutedLight, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, marginBottom: 30 }}>
          {[
            { id: "playbook", label: "🎓 Prompt Playbook" },
            { id: "tools",    label: "⚙️ Workflow Lab" },
            { id: "roadmap",  label: "🗺️ Roadmap" },
          ].map(tab => (
            <button key={tab.id} className="tab-btn" onClick={() => setActiveTab(tab.id)} style={{
              background: "none", border: "none",
              borderBottom: `2px solid ${activeTab === tab.id ? C.green : "transparent"}`,
              color: activeTab === tab.id ? C.green : C.mutedLight,
              padding: "13px 20px", fontSize: 13, fontWeight: 600,
              fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em",
              cursor: "pointer", marginBottom: -1, transition: "all 0.2s",
            }}>{tab.label}</button>
          ))}
        </div>

        {/* ══ PLAYBOOK ══ */}
        {activeTab === "playbook" && (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            {/* Search bar */}
            <div style={{ position: "relative", marginBottom: 16 }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.mutedLight, fontSize: 14 }}>🔍</span>
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search prompts — try 'escalation', 'retro', 'exec', 'sprint goal'…"
                style={{
                  width: "100%", background: C.card,
                  border: `1px solid ${searchQuery ? C.green + "60" : C.border}`,
                  borderRadius: 9, padding: "11px 16px 11px 40px",
                  color: C.textBright, fontSize: 13, fontFamily: "inherit",
                  transition: "border-color 0.2s",
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: C.mutedLight,
                  fontSize: 16, cursor: "pointer", padding: "0 4px",
                }}>✕</button>
              )}
            </div>

            {/* Category filters */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              {CATEGORIES.map(cat => (
                <button key={cat.id} className="pain-btn" onClick={() => setActiveCategory(cat.id)} style={{
                  background: activeCategory === cat.id ? `${cat.color}12` : "transparent",
                  border: `1px solid ${activeCategory === cat.id ? cat.color : C.border}`,
                  borderRadius: 8, padding: "8px 14px",
                  color: activeCategory === cat.id ? cat.color : C.mutedLight,
                  fontSize: 12, fontWeight: 600, fontFamily: "'DM Mono', monospace",
                  display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
                }}>
                  <span>{cat.emoji}</span><span>{cat.label}</span>
                  <span style={{ fontSize: 10, opacity: 0.7 }}>
                    ({allPrompts.filter(p => cat.id === "all" || p.category === cat.id).length})
                  </span>
                </button>
              ))}
            </div>

            {/* Results count */}
            {(searchQuery || activeCategory !== "all") && (
              <div style={{ fontSize: 12, color: C.mutedLight, fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>
                {filtered.length} prompt{filtered.length !== 1 ? "s" : ""} found
                {searchQuery && <span> for "<span style={{ color: C.green }}>{searchQuery}</span>"</span>}
              </div>
            )}

            {/* Prompt list */}
            {filtered.length > 0
              ? filtered.map(p => <PromptCard key={p.id} prompt={p} />)
              : (
                <div style={{ textAlign: "center", padding: "48px 0", color: C.mutedLight }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
                  <div style={{ fontSize: 14, color: C.textBright, marginBottom: 6 }}>No prompts match "{searchQuery}"</div>
                  <div style={{ fontSize: 12 }}>Try: escalation, retro, exec, sprint, status, risk, release</div>
                  <button onClick={() => { setSearchQuery(""); setActiveCategory("all"); }} style={{
                    marginTop: 16, background: C.greenDim, border: `1px solid ${C.green}30`,
                    color: C.green, borderRadius: 7, padding: "8px 16px",
                    fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer",
                  }}>CLEAR SEARCH</button>
                </div>
              )
            }
          </div>
        )}

        {/* ══ TOOLS ══ */}
        {activeTab === "tools" && (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: C.white, margin: "0 0 6px" }}>Workflow Lab</h2>
              <p style={{ color: C.mutedLight, fontSize: 14, margin: 0 }}>
                AI-powered workflows for Delivery PMs — these run natively in Claude.ai with Slack connected.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>💬</span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.white }}>Slack Channel Summariser</span>
                  <Chip color={C.green} small>Run in Claude.ai</Chip>
                </div>
                <div style={{ fontSize: 12, color: C.mutedLight, marginTop: 2 }}>4 ready-to-use prompts — paste into Claude.ai with Slack MCP connected</div>
              </div>
            </div>
            <SlackHowTo />

            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 11, color: C.mutedLight, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Coming Soon — Live Tools</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                {[
                  { emoji: "📋", name: "RAID Log Agent", desc: "Paste meeting notes — RAID log auto-populated and ready to share" },
                  { emoji: "📊", name: "Status Report Bot", desc: "Connects to Jira + Slack, drafts your weekly report for approval" },
                  { emoji: "🔥", name: "Escalation Triage", desc: "Classifies incidents by severity and routes to the right owner" },
                ].map((t, i) => (
                  <div key={i} className="tool-card" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "18px", opacity: 0.5, transition: "all 0.2s" }}>
                    <div style={{ fontSize: 22, marginBottom: 10 }}>{t.emoji}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.textBright, marginBottom: 5 }}>{t.name}</div>
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
            <div style={{ marginBottom: 26 }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: C.white, margin: "0 0 6px" }}>What's Being Built</h2>
              <p style={{ color: C.mutedLight, fontSize: 14, margin: 0 }}>This hub grows with real PM needs. Here's exactly what's live, what's next, and what's planned.</p>
            </div>

            {ROADMAP_PHASES.map((phase, pi) => (
              <div key={pi} style={{ marginBottom: 26 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", background: phase.color,
                    animation: phase.status === "live" ? "pulse 1.8s ease-in-out infinite" : "none",
                    color: phase.color,
                    boxShadow: phase.status === "live" ? `0 0 8px ${phase.color}` : "none",
                  }} />
                  <span style={{ fontSize: 11, color: phase.color, fontFamily: "'DM Mono', monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {phase.phase}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
                  {phase.items.map((item, ii) => (
                    <div key={ii} style={{
                      background: C.card,
                      border: `1px solid ${phase.status === "live" ? phase.color + "30" : C.border}`,
                      borderRadius: 10, padding: "16px 18px",
                      opacity: phase.status === "planned" ? 0.6 : 1,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.textBright }}>{item.name}</span>
                        {phase.status === "live" && <Chip color={C.green} small>Live</Chip>}
                        {phase.status === "building" && <Chip color={C.teal} small>Soon</Chip>}
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: C.mutedLight, lineHeight: 1.6 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* About section */}
            <div style={{ background: C.greenDim, border: `1px dashed ${C.green}30`, borderRadius: 12, padding: "24px", marginTop: 8 }}>
              <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.textBright, marginBottom: 6 }}>Built by Nikhil Thomas A</div>
                  <p style={{ color: C.mutedLight, fontSize: 13, margin: "0 0 14px", lineHeight: 1.65 }}>
                    Delivery Program Manager exploring the intersection of AI and programme delivery. Every prompt here comes from a real problem I've faced running sprints, managing stakeholders, and handling escalations.
                  </p>
                  <a href="https://www.linkedin.com/in/nikhil-thomas-a-58538117a/" target="_blank" rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 7,
                      background: C.greenDim, border: `1px solid ${C.green}40`,
                      color: C.green, borderRadius: 8, padding: "9px 16px",
                      fontSize: 12, fontWeight: 700, fontFamily: "'DM Mono', monospace",
                      letterSpacing: "0.06em", textDecoration: "none",
                    }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={C.green}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                    CONNECT ON LINKEDIN →
                  </a>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 160 }}>
                  {[
                    { label: "Prompts published", val: "13" },
                    { label: "Pain points covered", val: "3" },
                    { label: "Slack prompts", val: "4" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: C.green }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: C.mutedLight }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 52, padding: "22px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, background: `linear-gradient(135deg, ${C.green}, ${C.greenBright})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            PM AI Hub
          </span>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <a href="https://www.linkedin.com/in/nikhil-thomas-a-58538117a/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: C.mutedLight, fontFamily: "'DM Mono', monospace", textDecoration: "none" }}>
              Nikhil Thomas A
            </a>
            <span style={{ fontSize: 11, color: C.muted }}>·</span>
            <span style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Mono', monospace" }}>Powered by Claude</span>
          </div>
        </div>

      </div>
    </div>
  );
}
