import { useState, useEffect, useRef } from "react";

const DARK = {
  bg:"#0C0A0A", surface:"#131010", card:"#1A1616", cardHover:"#201B1B",
  border:"#2A2020", borderHover:"#3D2A2A",
  accent:"#E5484D", accentSoft:"#FF6166", accentDim:"rgba(229,72,77,0.1)",
  coral:"#FF8B7B", coralDim:"rgba(255,139,123,0.1)",
  amber:"#F0A500", amberDim:"rgba(240,165,0,0.1)",
  teal:"#00B8A2", tealDim:"rgba(0,184,162,0.1)",
  text:"#C9B8B8", textBright:"#EDE0E0", muted:"#4A3030", mutedLight:"#7A5555",
  white:"#FFF5F5", isDark:true,
};
const LIGHT = {
  bg:"#FDFAFA", surface:"#F5EFEF", card:"#FFFFFF", cardHover:"#FDF0F0",
  border:"#E8D8D8", borderHover:"#D4BABA",
  accent:"#C8282B", accentSoft:"#E5484D", accentDim:"rgba(200,40,43,0.07)",
  coral:"#C0392B", coralDim:"rgba(192,57,43,0.07)",
  amber:"#B06800", amberDim:"rgba(176,104,0,0.07)",
  teal:"#006E63", tealDim:"rgba(0,110,99,0.07)",
  text:"#5A3A3A", textBright:"#1A0808", muted:"#C4A0A0", mutedLight:"#8A5A5A",
  white:"#150505", isDark:false,
};

// ── DATA ──────────────────────────────────────────────────────
const ALL_PROMPTS = [
  {
    id:"s1", category:"stakeholder", categoryLabel:"Stakeholder Reporting", emoji:"📊",
    title:"Weekly Status Report Generator", difficulty:"Beginner", time:"2 min",
    tags:["reporting","weekly","exec","status","RAG","update"],
    problem:"Writing status reports takes 45 mins every Friday. Stakeholders want RAG status, blockers, and next steps — but you're pulling from 4 different tools.",
    inputLabel:"Paste your sprint notes, Jira summary, or standup thread",
    inputPlaceholder:"e.g. Sprint 24 — 8/10 tickets done, 2 in review. Blocker: API integration delayed by Platform team (ETA Friday). Velocity: 42pts vs 48pts planned. Next: finalise UAT with QA...",
    promptTemplate:(d)=>`You are a senior Delivery PM. Given the following sprint data, write a concise weekly status report for executive stakeholders.

FORMAT:
- Overall Status: [🟢 Green / 🟡 Amber / 🔴 Red]
- Summary (2 sentences max)
- Wins This Week (bullet points)
- Blockers & Risks (with owner and mitigation)
- Next Week Focus (3 priorities)

TONE: Confident, direct, no jargon. Executives should scan it in 60 seconds.

SPRINT DATA:
${d||"[Paste your Jira sprint summary / standup notes here]"}`,
    tips:["Add 'Audience: CTO' or 'Audience: Client' to shift tone","Include velocity numbers — Claude flags trends","Paste your Slack standup thread directly — messy input is fine"],
    steps:["Copy your sprint board summary or standup notes","Paste into the input box above to auto-fill the prompt","Open claude.ai or chat.openai.com — free to use","Paste the prompt and press Enter","Review and adjust the RAG status if needed"],
  },
  {
    id:"s2", category:"stakeholder", categoryLabel:"Stakeholder Reporting", emoji:"📊",
    title:"Stakeholder Tailoring Engine", difficulty:"Intermediate", time:"3 min",
    tags:["stakeholder","communication","CTO","CPO","client","tailoring","versions"],
    problem:"Your CTO, CPO, and client all want updates — but need totally different levels of detail and framing.",
    inputLabel:"Paste your raw project update",
    inputPlaceholder:"e.g. We're 2 weeks from launch. The API integration is delayed — Platform team has it scheduled for Friday. UX is complete, QA starts Monday. Budget is on track at 78% consumed...",
    promptTemplate:(d)=>`I need to communicate the same project update to three different stakeholders. Rewrite the update below THREE times:

1. CTO VERSION: Technical depth, system risks, engineering velocity
2. CPO VERSION: Feature progress, user impact, roadmap alignment
3. CLIENT VERSION: Milestone status, value delivered, what's next

Keep each under 150 words. No internal jargon in the client version.

UPDATE TO ADAPT:
${d||"[Paste your raw update here]"}`,
    tips:["Works great with rough bullet points","Add 'Relationship: new client, trust still building' for tone calibration","Run again with 'make the CTO version more alarming' to escalate"],
    steps:["Write a rough 3-5 sentence project update","Paste it into the input box above","Run — 3 tailored versions in under 10 seconds","Copy the right version per audience into email"],
  },
  {
    id:"s3", category:"stakeholder", categoryLabel:"Stakeholder Reporting", emoji:"📊",
    title:"Meeting Minutes Summariser", difficulty:"Beginner", time:"2 min",
    tags:["meeting","minutes","summary","decisions","actions","notes"],
    problem:"Long meetings produce messy notes. You need clean, shareable minutes with decisions and action items extracted — in 2 minutes.",
    inputLabel:"Paste your raw meeting notes",
    inputPlaceholder:"e.g. Called at 2pm. Attendees: Sarah (PM), Dev team, Client rep John. Discussed release scope — John wants feature X in, Sarah pushed back due to timeline. Agreed: feature X as phase 2. Dev team flagged infra cost. Action: Sarah to get infra estimate by Thursday...",
    promptTemplate:(d)=>`You are a Delivery PM. Summarise these meeting notes into clean, shareable minutes.

OUTPUT FORMAT:
- Date & Attendees
- Purpose of Meeting (1 sentence)
- Key Decisions Made (bullet list)
- Action Items (Owner | Task | Due Date)
- Parking Lot / Open Questions
- Next Meeting: [date if mentioned]

TONE: Professional, neutral, blameless. Under 300 words total.

RAW NOTES:
${d||"[Paste your raw meeting notes here]"}`,
    tips:["Works on voice-to-text transcripts","Add 'Flag decisions needing leadership sign-off' for governance projects","Output pastes cleanly into Confluence"],
    steps:["Take rough notes during the meeting (voice memo, typed, anything)","Paste into the input box above","Run — clean minutes in seconds","Review action items and confirm owners","Share with attendees within 30 minutes"],
  },
  {
    id:"s4", category:"stakeholder", categoryLabel:"Stakeholder Reporting", emoji:"📊",
    title:"Exec Briefing One-Pager", difficulty:"Intermediate", time:"4 min",
    tags:["exec","briefing","one-pager","steering","board","committee"],
    problem:"You have 5 minutes in a steering committee. You need a tight, credible one-pager that covers everything without losing the room.",
    inputLabel:"Paste your programme status data",
    inputPlaceholder:"e.g. 3 workstreams: Data (Green), UX (Amber — designer off sick), Infra (Green). Key win: UAT passed with 98% pass rate. Issue: data migration needs re-scoping (+2 weeks). Budget: 72% consumed, 65% through delivery. Decision needed: approve phase 2 scope...",
    promptTemplate:(d)=>`Create a concise executive briefing one-pager for a steering committee review.

SECTIONS:
1. Programme at a Glance (traffic light + 1 sentence per workstream)
2. Top 3 Achievements This Period
3. Critical Issues & Mitigations (max 3)
4. Budget Status (on track / at risk — % consumed vs planned)
5. Key Decisions Needed from Leadership
6. Outlook for Next Period (2-3 bullets)

MAX LENGTH: Fits one printed page. No waffle.

PROGRAMME DATA:
${d||"[Paste your programme status data here]"}`,
    tips:["Add 'Audience: non-technical board members' if needed","'Decisions Needed' forces action, not just awareness","Run twice: once for content, once asking Claude to 'cut 20% of words'"],
    steps:["Gather workstream statuses, wins, issues, and budget info","Paste all of it into the input above","Run — one-pager structure in seconds","Review 'Decisions Needed' section most carefully","Print or paste into your slide deck as the opening page"],
  },
  {
    id:"e1", category:"escalation", categoryLabel:"Escalation & Incidents", emoji:"🚨",
    title:"Escalation Draft Generator", difficulty:"Beginner", time:"90 sec",
    tags:["escalation","incident","urgent","comms","manager","crisis"],
    problem:"Something just broke or missed. You need to escalate fast and professionally — without panic, blame, or missing context.",
    inputLabel:"Describe the situation + who you're escalating to",
    inputPlaceholder:"e.g. Situation: Production database went down at 14:32 today. 3 enterprise clients affected, unable to access their dashboards. Identified a failed migration script — rollback in progress, ETA 30 mins. Escalating to: VP Engineering and Head of Customer Success.",
    promptTemplate:(d)=>`You are a calm, senior Delivery PM. Draft an escalation message based on the situation below.

STRUCTURE:
- Situation (what happened, when, impact)
- Root Cause (known or suspected)
- Immediate Actions Taken
- What I Need From You (specific ask)
- ETA for next update

TONE: Urgent but composed. Own the situation, don't assign blame. Be specific about the ask.

SITUATION & AUDIENCE:
${d||"[Describe what happened + who you are escalating to]"}`,
    tips:["'We have a workaround' vs 'no workaround yet' changes tone significantly","'This started 2 hours ago' gives Claude urgency context","Run twice — once for your manager, once for the client"],
    steps:["Describe what happened in 2-3 plain sentences","Add who you're escalating to","Run — structured escalation in 10 seconds","Check 'What I Need From You' — make the ask crystal clear","Send within 5 minutes — speed signals control"],
  },
  {
    id:"e2", category:"escalation", categoryLabel:"Escalation & Incidents", emoji:"🚨",
    title:"Post-Mortem Drafter", difficulty:"Intermediate", time:"5 min",
    tags:["post-mortem","incident","blameless","RCA","timeline","review"],
    problem:"Post-mortems are painful to write. Raw notes, tired team — but leadership wants a polished document by EOD.",
    inputLabel:"Paste your incident notes or Slack thread",
    inputPlaceholder:"e.g. 14:32 - DB migration script failed silently. 14:45 - First client report via Zendesk. 15:00 - On-call engineer paged, identified root cause. 15:20 - Rollback initiated. 16:05 - Service restored. Root cause: migration script didn't validate schema. 847 users affected for 93 minutes...",
    promptTemplate:(d)=>`Write a blameless post-mortem document from the notes below.

SECTIONS:
1. Incident Summary (severity, duration, impact)
2. Timeline (key events in chronological order)
3. Root Cause Analysis (use 5 Whys if applicable)
4. What Went Well
5. What Went Wrong
6. Action Items (owner, due date, priority)

PRINCIPLE: Blameless. Focus on systems and processes, not individuals.

RAW NOTES / SLACK THREAD:
${d||"[Paste your incident notes here]"}`,
    tips:["'Blameless' keeps it constructive — Claude avoids naming individuals","Add 'customer-facing impact: yes' to calibrate severity","Paste Slack thread directly — Claude extracts the timeline"],
    steps:["Gather raw notes — Slack thread, incident log, bullet points","Paste into the input box above","Run — structured post-mortem instantly","Review Root Cause section carefully — needs your real knowledge","Get team sign-off on action item owners before sharing"],
  },
  {
    id:"e3", category:"escalation", categoryLabel:"Escalation & Incidents", emoji:"🚨",
    title:"Risk Register Updater", difficulty:"Beginner", time:"3 min",
    tags:["risk","register","RAID","mitigation","governance","log"],
    problem:"Your risk register is always out of date. Every review exposes gaps — but updating it manually takes an hour you don't have.",
    inputLabel:"Paste meeting notes or sprint updates with new risk info",
    inputPlaceholder:"e.g. Sprint review flagged: 1) Third-party API might sunset in Q3 — no comms from vendor yet. 2) Key developer going on parental leave in 6 weeks, no handover plan. 3) UAT environment keeps going down — infra team says it's low priority. Client deadline is fixed at end of quarter.",
    promptTemplate:(d)=>`You are a Delivery PM. Update the risk register based on new information below.

FOR EACH NEW OR CHANGED RISK OUTPUT:
- Risk ID (auto-assign if new)
- Risk Description (1-2 sentences)
- Likelihood (High / Medium / Low)
- Impact (High / Medium / Low)
- Overall Rating
- Owner
- Mitigation Action
- Status (Open / Mitigated / Accepted / Closed)

NEW INFORMATION:
${d||"[Paste meeting notes, sprint review, or standup updates]"}`,
    tips:["Leave input blank to generate a fresh register from scratch","Add 'Focus on delivery timeline risks' to filter noise","Run after every sprint review to keep it current automatically"],
    steps:["Copy your latest meeting notes or sprint review","Paste into the input box above","Run — risks extracted and rated automatically","Review ratings against your own judgment","Paste the output into your RAID log or Confluence"],
  },
  {
    id:"e4", category:"escalation", categoryLabel:"Escalation & Incidents", emoji:"🚨",
    title:"Difficult Conversation Preparer", difficulty:"Advanced", time:"5 min",
    tags:["stakeholder","conflict","difficult","conversation","negotiation","pushback"],
    problem:"You need to deliver bad news, push back on scope, or manage a difficult stakeholder. You want to plan the conversation before you walk in.",
    inputLabel:"Describe the conversation context",
    inputPlaceholder:"e.g. I need to tell the client we're 3 weeks late due to scope changes they requested mid-sprint but didn't formally approve. They're already frustrated from a previous delay. I want to maintain the relationship and agree a revised timeline without conceding more free work.",
    promptTemplate:(d)=>`Help me prepare for a difficult PM conversation.

CONTEXT:
${d||"[Describe the conversation type, who you're speaking with, the core message, what you're worried they'll say, and what outcome you want]"}

PREPARE:
1. Recommended opening (first 2-3 sentences to say out loud)
2. The core message — framed clearly and without blame
3. Top 3 objections they might raise + how to respond to each
4. How to close with a clear next step
5. What NOT to say in this conversation`,
    tips:["The more context you give, the better the prep","Run it as roleplay: 'Now act as [their name] and push back'","The 'What NOT to say' section is often the most valuable part"],
    steps:["Describe the full context in the input box — don't sanitise","Run to get your opening and objection responses","Practice the opening out loud before the conversation","Keep objection responses nearby during the meeting","After: run a debrief to extract learnings"],
  },
  {
    id:"sp1", category:"sprint", categoryLabel:"Sprint & Delivery", emoji:"⚡",
    title:"Sprint Risk Radar", difficulty:"Beginner", time:"2 min",
    tags:["sprint","risk","velocity","blocker","standup","mid-sprint"],
    problem:"Mid-sprint and something feels off — but you can't pinpoint what. You need a second brain to pressure-test your delivery.",
    inputLabel:"Paste your sprint board summary or standup notes",
    inputPlaceholder:"e.g. Sprint 18, Day 5 of 10. 14 tickets: 5 done, 6 in progress, 3 not started. Two engineers working on same API endpoint. QA environment down since Tuesday. One engineer OOO Friday. Sprint goal: complete user auth flow end-to-end.",
    promptTemplate:(d)=>`Act as a delivery risk analyst. Review this sprint status and identify risks I might be missing.

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
${d||"[Paste sprint board summary, standup notes, or Jira export]"}`,
    tips:["Run on Wednesday — enough data, still time to act","Include OOO and capacity notes — Claude factors these in","Use the standup questions verbatim"],
    steps:["Copy your sprint board status or standup notes","Paste into the input box above","Run mid-sprint","Use 'Questions to ask in standup' word for word","Run every sprint and compare — patterns appear over 3-4 sprints"],
  },
  {
    id:"sp2", category:"sprint", categoryLabel:"Sprint & Delivery", emoji:"⚡",
    title:"Retro Insight Extractor", difficulty:"Intermediate", time:"4 min",
    tags:["retro","retrospective","patterns","team","improvement","cross-sprint"],
    problem:"Retros generate great conversation but insights disappear. The same problems recur because no one tracks themes across sprints.",
    inputLabel:"Paste retrospective notes from 3+ sprints",
    inputPlaceholder:"e.g. Sprint 15: Good — new deployment pipeline saves time. Improve — blocked by Platform team again, third sprint running.  Sprint 16: Good — team demo went well. Improve — unclear sprint goals at start.  Sprint 17: Good — QA joined planning. Improve — Platform blocker STILL unresolved...",
    promptTemplate:(d)=>`Analyze these retrospective notes from multiple sprints and identify systemic patterns.

FIND:
1. Recurring themes (what keeps coming up?)
2. Unresolved action items from previous retros
3. Team sentiment trend (improving / declining / stable)
4. Top 3 process improvements with highest ROI
5. What the team is doing well (don't only focus on problems)

FORMAT: Executive summary + detailed breakdown. Actionable, not academic.

RETRO NOTES:
${d||"[Paste multi-sprint retro notes here — messy is fine]"}`,
    tips:["Label each sprint in the paste (Sprint 12, Sprint 13)","Ask Claude to 'prioritise by frequency AND team energy cost'","Works best with 3+ sprints of data"],
    steps:["Collect retro notes from last 3-5 sprints","Label each sprint clearly and paste them all in","Run — Claude surfaces patterns you're too close to see","Share 'What Went Well' with the team first","Turn top 3 improvements into sprint items with owners"],
  },
  {
    id:"sp3", category:"sprint", categoryLabel:"Sprint & Delivery", emoji:"⚡",
    title:"Sprint Goal Writer", difficulty:"Beginner", time:"2 min",
    tags:["sprint","goal","planning","objective","focus","kickoff"],
    problem:"Sprint goals are always vague or missing. A clear sprint goal aligns the team and makes success measurable.",
    inputLabel:"Paste your sprint backlog + business context",
    inputPlaceholder:"e.g. Tickets: user login flow, password reset, email verification, session management, logout. Business context: this sprint is the final blocker before we can onboard paying customers. Launch date is fixed at end of month.",
    promptTemplate:(d)=>`Write a clear, measurable sprint goal based on the work below.

A good sprint goal:
- Is 1-2 sentences
- Describes the outcome, not the tasks
- Is measurable (you can say yes/no at the end of sprint)
- Aligns to a business objective
- Motivates the team

Also give me: 3 alternative versions (one ambitious, one safe, one mid-range)

SPRINT BACKLOG & CONTEXT:
${d||"[Paste your sprint ticket list and business context]"}`,
    tips:["The goal should survive even if 20% of tickets get cut","Post the sprint goal in your team Slack at sprint start","Reference it at end: did we hit the goal? Why/why not?"],
    steps:["List or paste the tickets planned for this sprint","Add 1-2 sentences on the business goal this sprint supports","Run — get a sharp, testable sprint goal + 3 alternatives","Share with team at sprint planning for buy-in","Reference it at the sprint review"],
  },
  {
    id:"sp4", category:"sprint", categoryLabel:"Sprint & Delivery", emoji:"⚡",
    title:"Dependency Mapper", difficulty:"Intermediate", time:"3 min",
    tags:["dependency","blocker","cross-team","planning","risk","handoff"],
    problem:"Cross-team dependencies are the #1 silent killer of sprint velocity. Surface them early, before they become blockers.",
    inputLabel:"Paste your sprint or programme plan",
    inputPlaceholder:"e.g. Our team needs: API spec from Platform team (needed by Day 3), test data from Data team (needed by Day 5), design sign-off from UX (needed before dev starts). Platform team said they'll have the spec 'early next week'. Data team hasn't confirmed. UX is in another timezone.",
    promptTemplate:(d)=>`Analyse this sprint/programme plan and identify all cross-team dependencies.

FOR EACH DEPENDENCY OUTPUT:
- What: The dependency
- Who depends on whom: Team A waiting on Team B for X
- When needed by
- Risk Level: High / Medium / Low
- Suggested Action: What should the PM do right now?

Also flag: circular dependencies, dependencies with no named owner.

PLAN / BACKLOG / NOTES:
${d||"[Paste your sprint plan, programme plan, or standup notes]"}`,
    tips:["Run at sprint planning to catch issues before the sprint starts","Add 'delivery deadline: [date]' to sharpen risk ratings","Export output as a table to paste into your RAID log"],
    steps:["Paste your sprint plan, backlog, or cross-team notes","Add your delivery deadline if there is one","Run — all dependencies listed with risk levels","Immediately contact owners of High risk dependencies","Add to your RAID log and track weekly"],
  },
  {
    id:"sp5", category:"sprint", categoryLabel:"Sprint & Delivery", emoji:"⚡",
    title:"Release Readiness Checker", difficulty:"Intermediate", time:"4 min",
    tags:["release","readiness","go-live","checklist","deployment","go-no-go"],
    problem:"Every release has last-minute surprises. You need a systematic go/no-go assessment before you push to production.",
    inputLabel:"Paste your release info, test results, and sign-off status",
    inputPlaceholder:"e.g. Release v2.4.1 — scheduled Friday 18:00. Test coverage 87%, 2 open P2 bugs (both have workarounds). Staging tested: yes. Rollback plan: yes. Sign-offs: Product ✅ QA ✅ Security ❌ (pending). Client notified: yes. Support briefed: no. Monitoring: basic alerts only.",
    promptTemplate:(d)=>`Act as a senior release manager. Assess release readiness and give a Go / No-Go recommendation.

EVALUATE:
1. Code quality (test coverage, open bugs, code review)
2. Environment readiness (staging tested, infra provisioned)
3. Rollback plan (exists and tested?)
4. Stakeholder sign-off (product, QA, security, business)
5. Communication plan (users notified? support briefed?)
6. Monitoring & alerting (in place for new features?)
7. Data migrations (tested and reversible?)

OUTPUT:
- Overall: GO ✅ / NO-GO ❌ / CONDITIONAL GO ⚠️
- What's ready
- What's blocking
- Conditions for Go (if conditional)
- Recommended release window

RELEASE INFORMATION:
${d||"[Paste your release notes, test results, or sign-off status]"}`,
    tips:["Run 48 hours before release — time to fix conditional issues","Add 'We cannot delay — business deadline is X' for conditional Go","Share output with engineering lead to align on final decision"],
    steps:["Gather test results, open bugs, sign-off status, infra notes","Paste into the input above","Run — Go/No-Go with clear reasoning","Review blockers list with your tech lead immediately","Turn conditions into a checklist for the 24 hours before release"],
  },
];

const CATEGORIES = [
  { id:"all",         label:"All Prompts",            emoji:"🔍" },
  { id:"stakeholder", label:"Stakeholder Reporting",  emoji:"📊" },
  { id:"escalation",  label:"Escalation & Incidents", emoji:"🚨" },
  { id:"sprint",      label:"Sprint & Delivery",      emoji:"⚡" },
];

const ROADMAP = [
  { phase:"Now — Live", status:"live", items:[
    { name:"Prompt Playbook", desc:"13 prompts across 3 PM pain points — stakeholder, escalation, sprint & delivery" },
    { name:"RAID Log Agent", desc:"Workflow Lab — paste meeting notes → structured RAID log ready to share in seconds" },
    { name:"Workflow Lab", desc:"Slack Summariser — 4 ready-to-use prompts for Claude.ai with Slack MCP" },
    { name:"Prompt Search", desc:"Search all prompts by keyword, category, or pain point" },
    { name:"Light / Dark Mode", desc:"Readable in any environment — toggle in the top right" },
  ]},
  { phase:"Next — Building", status:"building", items:[
    { name:"Case Study Journal", desc:"Real delivery problems, exact prompts used, measurable outcomes" },
    { name:"Jira Integration Prompts", desc:"Prompt workflows that work with Jira exports and API data" },
  ]},
  { phase:"Later — Planned", status:"planned", items:[
    { name:"Live Backend Tools", desc:"Vercel serverless functions to power real-time Slack and Jira integrations" },
    { name:"Community Prompts", desc:"PMs submit prompts — curated and quality-checked before publishing" },
    { name:"Weekly PM AI Digest", desc:"Email digest of new prompts and AI workflow tips" },
  ]},
];

// ── HELPERS ───────────────────────────────────────────────────
const mkClaudeUrl  = (p) => `https://claude.ai/new?q=${encodeURIComponent(p)}`;
const mkGPTUrl     = (p) => `https://chatgpt.com/?q=${encodeURIComponent(p)}`;
const mkGeminiUrl  = (p) => `https://gemini.google.com/app?q=${encodeURIComponent(p.slice(0,500))}`;

// ── COMPONENTS ────────────────────────────────────────────────
function Chip({ children, color, small }) {
  return (
    <span style={{
      display:"inline-block", background:`${color}12`, color,
      border:`1px solid ${color}30`, borderRadius:4,
      padding:small?"1px 7px":"3px 10px",
      fontSize:small?10:11, fontWeight:700, letterSpacing:"0.09em",
      textTransform:"uppercase", fontFamily:"'DM Mono', monospace",
    }}>{children}</span>
  );
}

function DiffPip({ level, T }) {
  const map = { Beginner:T.teal, Intermediate:T.amber, Advanced:T.coral };
  return <Chip color={map[level]||T.mutedLight} small>{level}</Chip>;
}

function CopyIcon({ text, T }) {
  const [done, setDone] = useState(false);
  function go(e) {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setDone(true);
    setTimeout(()=>setDone(false), 2000);
  }
  return (
    <button onClick={go} title="Copy prompt" style={{
      background: done ? `${T.accent}12` : T.isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)",
      border:`1px solid ${done ? T.accent+"50" : T.border}`,
      color: done ? T.accent : T.mutedLight,
      borderRadius:6, padding:"4px 9px", cursor:"pointer",
      fontSize:11, display:"flex", alignItems:"center", gap:5,
      fontFamily:"'DM Mono', monospace", fontWeight:700,
      letterSpacing:"0.04em", transition:"all 0.2s",
    }}>
      {done
        ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>COPIED</>
        : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>COPY</>
      }
    </button>
  );
}

function RunLinks({ promptText, T }) {
  const links = [
    { label:"Claude",  url:mkClaudeUrl(promptText),  color:T.accent },
    { label:"ChatGPT", url:mkGPTUrl(promptText),     color:T.teal },
    { label:"Gemini",  url:mkGeminiUrl(promptText),  color:T.amber },
  ];
  return (
    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
      {links.map(l=>(
        <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" style={{
          display:"inline-flex", alignItems:"center", gap:5,
          background:`${l.color}10`, border:`1px solid ${l.color}30`,
          color:l.color, borderRadius:7, padding:"6px 12px",
          fontSize:11, fontWeight:700, fontFamily:"'DM Mono', monospace",
          letterSpacing:"0.05em", textDecoration:"none", transition:"all 0.2s",
        }}>↗ Run with {l.label}</a>
      ))}
    </div>
  );
}

function PromptCard({ prompt, T }) {
  const [open,    setOpen]    = useState(false);
  const [tab,     setTab]     = useState("prompt");
  const [data,    setData]    = useState("");
  const [copiedB, setCopiedB] = useState(false);

  const filled = prompt.promptTemplate(data);
  const ac = prompt.category==="stakeholder" ? T.accent
           : prompt.category==="escalation"  ? T.coral
           : T.amber;

  return (
    <div style={{
      background:T.card, border:`1px solid ${open ? ac+"45" : T.border}`,
      borderRadius:12, marginBottom:10, overflow:"hidden",
      transition:"border-color 0.2s, box-shadow 0.2s",
      boxShadow: open ? `0 2px 20px ${ac}12` : "none",
    }}>
      {/* Header */}
      <div onClick={()=>setOpen(!open)} style={{ padding:"15px 18px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", gap:7, marginBottom:6, flexWrap:"wrap", alignItems:"center" }}>
            <span>{prompt.emoji}</span>
            <DiffPip level={prompt.difficulty} T={T}/>
            <span style={{ color:T.mutedLight, fontSize:11, fontFamily:"'DM Mono', monospace" }}>⏱ {prompt.time}</span>
            {prompt.isNew && <span style={{ background:"#16a34a", color:"#fff", fontSize:9, fontWeight:800, letterSpacing:"0.12em", padding:"2px 7px", borderRadius:3, textTransform:"uppercase" }}>NEW</span>}
          </div>
          <div style={{ fontSize:15, fontWeight:700, color:T.textBright, marginBottom:3 }}>{prompt.title}</div>
          <div style={{ fontSize:12, color:T.mutedLight, lineHeight:1.55 }}>{prompt.problem}</div>
        </div>
        <span style={{ color:T.mutedLight, fontSize:14, flexShrink:0, marginTop:4, display:"inline-block", transform:open?"rotate(180deg)":"rotate(0deg)", transition:"transform 0.2s" }}>▾</span>
      </div>

      {open && (
        <div style={{ borderTop:`1px solid ${T.border}`, padding:"15px 18px" }}>
          {/* Inner tabs */}
          <div style={{ display:"flex", marginBottom:16, borderBottom:`1px solid ${T.border}` }}>
            {[{id:"prompt",label:"📋 Prompt"},{id:"howto",label:"📖 Step-by-Step"}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                background:"none", border:"none",
                borderBottom:`2px solid ${tab===t.id?ac:"transparent"}`,
                color:tab===t.id?ac:T.mutedLight,
                padding:"5px 14px", fontSize:11, fontWeight:700,
                fontFamily:"'DM Mono', monospace", letterSpacing:"0.06em",
                cursor:"pointer", textTransform:"uppercase", marginBottom:-1, transition:"all 0.15s",
              }}>{t.label}</button>
            ))}
          </div>

          {tab==="prompt" && (
            <>
              {/* Data input */}
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:10, color:T.mutedLight, fontFamily:"'DM Mono', monospace", letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:5 }}>📥 {prompt.inputLabel}</div>
                <textarea value={data} onChange={e=>setData(e.target.value)} placeholder={prompt.inputPlaceholder} rows={3} style={{ width:"100%", background:T.surface, border:`1px solid ${data?ac+"50":T.border}`, borderRadius:8, padding:"9px 11px", color:T.textBright, fontSize:12, fontFamily:"inherit", resize:"vertical", lineHeight:1.6, outline:"none", transition:"border-color 0.2s" }}/>
                {data && <div style={{ fontSize:10, color:ac, fontFamily:"'DM Mono', monospace", marginTop:3 }}>✓ Prompt auto-filled with your data</div>}
              </div>

              {/* Prompt box with top-right copy */}
              <div style={{ position:"relative", marginBottom:12 }}>
                <div style={{ position:"absolute", top:9, right:9, zIndex:2 }}>
                  <CopyIcon text={filled} T={T}/>
                </div>
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, padding:"12px 14px", paddingRight:84 }}>
                  <pre style={{ margin:0, fontSize:12, color:T.text, fontFamily:"'DM Mono', monospace", whiteSpace:"pre-wrap", lineHeight:1.75, maxHeight:220, overflowY:"auto" }}>{filled}</pre>
                </div>
              </div>

              {/* Tips */}
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:10, color:T.mutedLight, fontFamily:"'DM Mono', monospace", letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:7 }}>💡 Pro Tips</div>
                {prompt.tips.map((tip,i)=>(
                  <div key={i} style={{ display:"flex", gap:8, marginBottom:5 }}>
                    <span style={{ color:ac, flexShrink:0 }}>→</span>
                    <span style={{ fontSize:12, color:T.mutedLight, lineHeight:1.55 }}>{tip}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                <button onClick={()=>{navigator.clipboard.writeText(filled);setCopiedB(true);setTimeout(()=>setCopiedB(false),2000);}} style={{ background:copiedB?`${T.accent}12`:`${ac}10`, border:`1px solid ${copiedB?T.accent:ac}40`, color:copiedB?T.accent:ac, borderRadius:7, padding:"7px 14px", fontSize:11, fontWeight:700, fontFamily:"'DM Mono', monospace", letterSpacing:"0.06em", cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", gap:5 }}>
                  {copiedB?<><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>COPIED</>:<><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>COPY PROMPT</>}
                </button>
                <RunLinks promptText={filled} T={T}/>
              </div>
            </>
          )}

          {tab==="howto" && (
            <div>
              <div style={{ fontSize:12, color:T.mutedLight, marginBottom:14, lineHeight:1.65, background:`${ac}08`, border:`1px solid ${ac}20`, borderRadius:8, padding:"9px 13px" }}>
                🌱 New to AI prompting? Follow these steps exactly — no experience needed.
              </div>
              {prompt.steps.map((step,i)=>(
                <div key={i} style={{ display:"flex", gap:12, marginBottom:14, alignItems:"flex-start" }}>
                  <div style={{ width:26, height:26, borderRadius:"50%", flexShrink:0, background:`${ac}10`, border:`1px solid ${ac}35`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:ac, fontFamily:"'DM Mono', monospace" }}>{i+1}</div>
                  <div style={{ paddingTop:3, fontSize:13, color:T.text, lineHeight:1.65 }}>{step}</div>
                </div>
              ))}
              <div style={{ background:`${ac}06`, border:`1px dashed ${ac}28`, borderRadius:8, padding:"11px 14px", marginTop:4 }}>
                <div style={{ fontSize:10, color:ac, fontFamily:"'DM Mono', monospace", fontWeight:700, letterSpacing:"0.1em", marginBottom:4 }}>WHERE TO RUN THIS</div>
                <div style={{ fontSize:12, color:T.mutedLight, lineHeight:1.6 }}>Use <strong style={{color:T.textBright}}>"↗ Run with Claude"</strong> to open Claude.ai with the prompt pre-filled. Or copy and paste into any LLM. Both are free to start.</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SlackHowTo({ T }) {
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [activeStep, setActiveStep] = useState(null);
  const prompts = [
    { label:"Quick Channel Summary", desc:"Fast PM briefing from any Slack channel",
      prompt:`Read the last 30 messages from Slack channel #[your-channel-name] and give me a PM briefing:\n\n- TL;DR (2-3 sentences)\n- Action items (owner + urgency: high/medium/low)\n- Blockers mentioned\n- Key decisions made\n- Overall sentiment (positive / neutral / tense / urgent)\n- Anyone who needs a follow-up from me` },
    { label:"Escalation Signal Scanner", desc:"Find hidden escalation risks before they blow up",
      prompt:`Read the last 50 messages from #[channel-name] and identify escalation risks.\n\nFlag:\n- Unresolved blockers older than 24 hours\n- Frustrated language from stakeholders or team\n- Decisions raised but never confirmed\n- Work deprioritised without communication\n- Anyone who went quiet who should be active\n\nFormat as a risk briefing I can forward to my manager.` },
    { label:"Daily Standup Digest", desc:"Turn a standup channel into a structured digest",
      prompt:`Read today's messages from #[standup-channel] and create a standup digest.\n\nFor each person who posted:\n- What they completed yesterday\n- What they're working on today\n- Any blockers mentioned\n\nThen:\n- Team-level blockers summary\n- Risks to today's sprint goals\n- Anyone who didn't post (flag as absent)\n\nKeep under 250 words.` },
    { label:"Cross-Team Dependency Check", desc:"Surface dependencies across multiple channels",
      prompt:`Read the last 30 messages from each of: #[channel-1], #[channel-2], #[channel-3]\n\nIdentify cross-team dependencies:\n- Team A waiting on Team B for X\n- Handoffs not yet confirmed\n- Shared resources being contested\n- Timeline misalignments\n\nFormat as a table: Who | Waiting For | What | By When | Risk Level` },
  ];
  function copy(text,idx){ navigator.clipboard.writeText(text); setCopiedIdx(idx); setTimeout(()=>setCopiedIdx(null),2000); }
  return (
    <div>
      <div style={{ background:T.amberDim, border:`1px solid ${T.amber}28`, borderRadius:10, padding:"12px 16px", marginBottom:20, display:"flex", gap:10, alignItems:"flex-start" }}>
        <span style={{ fontSize:16, flexShrink:0 }}>💡</span>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:T.amber, marginBottom:3 }}>Why it runs in Claude.ai, not directly here</div>
          <div style={{ fontSize:12, color:T.mutedLight, lineHeight:1.65 }}>GitHub Pages is a static site — browsers block direct API calls to Slack and Claude (CORS security). These prompts run natively in <strong style={{color:T.textBright}}>Claude.ai</strong> where Slack MCP is a first-class integration.</div>
        </div>
      </div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:10, color:T.mutedLight, fontFamily:"'DM Mono', monospace", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12 }}>3 steps to get started</div>
        {[
          {n:"1",title:"Connect Slack to Claude.ai",desc:"claude.ai → Settings → Integrations → Connect Slack. Free account works."},
          {n:"2",title:"Open a new Claude conversation",desc:"Go to claude.ai and start a fresh chat."},
          {n:"3",title:"Paste a prompt, replace the channel name, press Enter",desc:"Claude reads your Slack channel live and returns a structured PM briefing."},
        ].map((s,i)=>(
          <div key={i} style={{ display:"flex", gap:12, marginBottom:12, alignItems:"flex-start" }}>
            <div style={{ width:26, height:26, borderRadius:"50%", flexShrink:0, background:T.accentDim, border:`1px solid ${T.accent}35`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:T.accent, fontFamily:"'DM Mono', monospace" }}>{s.n}</div>
            <div style={{ paddingTop:3 }}>
              <div style={{ fontSize:13, fontWeight:600, color:T.textBright, marginBottom:1 }}>{s.title}</div>
              <div style={{ fontSize:12, color:T.mutedLight, lineHeight:1.55 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:10, color:T.mutedLight, fontFamily:"'DM Mono', monospace", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>Copy a prompt → paste into Claude.ai</div>
      {prompts.map((p,i)=>(
        <div key={i} style={{ background:T.card, border:`1px solid ${activeStep===i ? T.teal+"50" : T.border}`, borderRadius:10, padding:"13px 16px", marginBottom:10, transition:"border-color 0.2s", cursor:"pointer" }} onClick={()=>setActiveStep(activeStep===i?null:i)}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom: activeStep===i ? 10 : 0, gap:8 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:T.textBright, marginBottom:1 }}>{p.label}</div>
              <div style={{ fontSize:11, color:T.mutedLight }}>{p.desc}</div>
            </div>
            <div style={{ display:"flex", gap:6, flexShrink:0, alignItems:"center" }}>
              <button onClick={e=>{ e.stopPropagation(); copy(p.prompt,i); }} style={{ background:copiedIdx===i?T.accentDim:"transparent", border:`1px solid ${copiedIdx===i?T.accent:T.border}`, color:copiedIdx===i?T.accent:T.mutedLight, borderRadius:6, padding:"4px 10px", fontSize:11, fontFamily:"'DM Mono', monospace", fontWeight:700, letterSpacing:"0.06em", cursor:"pointer", transition:"all 0.2s", whiteSpace:"nowrap" }}>
                {copiedIdx===i?"✓ COPIED":"COPY"}
              </button>
              <span style={{ color:T.mutedLight, fontSize:12, display:"inline-block", transform:activeStep===i?"rotate(180deg)":"rotate(0deg)", transition:"transform 0.2s" }}>▾</span>
            </div>
          </div>
          {activeStep===i && (
            <pre style={{ margin:0, fontSize:11, color:T.mutedLight, fontFamily:"'DM Mono', monospace", whiteSpace:"pre-wrap", lineHeight:1.7, background:T.surface, borderRadius:6, padding:"9px 11px" }}>{p.prompt}</pre>
          )}
        </div>
      ))}
      <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, background:T.accent, color:"#fff", borderRadius:10, padding:"12px 20px", fontSize:12, fontWeight:700, fontFamily:"'DM Mono', monospace", letterSpacing:"0.08em", textDecoration:"none", marginTop:12 }}>
        OPEN CLAUDE.AI → RUN THESE PROMPTS LIVE ↗
      </a>
    </div>
  );
}

function RAIDWorkflow({ T }) {
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [activeStep, setActiveStep] = useState(null);

  const prompts = [
    {
      label: "Full RAID Extraction",
      desc: "Paste meeting notes → structured RAID log with all four quadrants",
      prompt: `You are a Delivery PM maintaining a RAID log. Extract all Risks, Actions, Issues, and Decisions from the notes below. Output a structured RAID log update.

FORMAT each item as:

RISKS (things that could go wrong)
| ID | Description | Likelihood (H/M/L) | Impact (H/M/L) | Owner | Mitigation | Status |

ACTIONS (agreed next steps with owners)
| ID | Action | Owner | Due Date | Priority (H/M/L) | Status |

ISSUES (problems actively affecting the project right now)
| ID | Description | Impact | Owner | Resolution Plan | Status |

DECISIONS (agreed choices that should be recorded)
| ID | Decision Made | Rationale | Made By | Date | Impact |

RULES:
- Assign IDs as R001, A001, I001, D001 etc.
- Infer due dates from context (e.g. "by EOD Friday" → use relative date)
- If owner is not named, write "TBC"
- Default status: Risks → Open, Actions → In Progress, Issues → Open, Decisions → Closed
- Do not invent items — only extract what is explicitly or clearly implied
- After the tables, add a "⚠️ Watch List" of the top 2-3 items needing immediate attention

MEETING NOTES:
[Paste your meeting notes, standup thread, or sprint review here]`,
    },
    {
      label: "Actions Only (Fast)",
      desc: "Extract just the action items — owner, due date, priority",
      prompt: `You are a Delivery PM. Extract all action items from the notes below. Be strict — only include things that were explicitly agreed as next steps.

FORMAT:
| ID | Action | Owner | Due Date | Priority (H/M/L) | Notes |

RULES:
- IDs: A001, A002...
- If no owner named, write "TBC"
- If no due date, write "TBC"
- Priority: H = blocks delivery, M = important but not blocking, L = nice to have
- After the table, flag any actions with no owner or no due date as "⚠️ Needs clarification"

NOTES:
[Paste your meeting notes here]`,
    },
    {
      label: "Risk Register Update",
      desc: "Surface new risks and update existing ones from this week's updates",
      prompt: `You are a Delivery PM updating a risk register after a sprint review. Extract all risks — including subtle ones — from the notes below.

FORMAT:
| ID | Risk Description | Likelihood (H/M/L) | Impact (H/M/L) | Owner | Mitigation Action | Review Date | Status |

THEN provide:
- Top 3 risks that need immediate owner attention (explain why)
- Any risks that appear to have been resolved (flag for closure)
- One-line executive summary of overall risk posture

RULES:
- IDs: R001, R002...
- Look for: delays, dependencies on external parties, resourcing gaps, technical unknowns, stakeholder misalignment
- If mitigation isn't mentioned, suggest a practical one based on context
- Status options: Open / Mitigating / Escalated / Closed

NOTES:
[Paste meeting notes, sprint review, or standup updates here]`,
    },
    {
      label: "Decision Log Update",
      desc: "Turn informal decisions made in meetings into a formal decision record",
      prompt: `You are a Delivery PM maintaining a decision log. Extract all decisions — including informal ones — from the notes below.

FORMAT:
| ID | Decision | Rationale | Made By | Date | Alternatives Considered | Impact | Status |

RULES:
- IDs: D001, D002...
- Include implicit decisions (e.g. "we agreed to proceed" = a decision)
- If rationale wasn't stated, write "Not documented — recommend clarifying"
- If alternatives weren't discussed, write "None documented"
- Status: Confirmed / Under Review / Reversed

After the table:
- Flag any decisions that lack a named decision-maker (governance risk)
- Flag any decisions that could be reversed easily vs those that are hard to undo

NOTES:
[Paste your meeting notes or discussion thread here]`,
    },
  ];

  function copy(text, idx) {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  return (
    <div>
      {/* Why this works as a workflow */}
      <div style={{ background:T.amberDim, border:`1px solid ${T.amber}28`, borderRadius:10, padding:"12px 16px", marginBottom:20, display:"flex", gap:10, alignItems:"flex-start" }}>
        <span style={{ fontSize:16, flexShrink:0 }}>💡</span>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:T.amber, marginBottom:3 }}>Your RAID log, always up to date — in 60 seconds</div>
          <div style={{ fontSize:12, color:T.mutedLight, lineHeight:1.65 }}>Paste meeting notes into any prompt below, run in <strong style={{color:T.textBright}}>Claude.ai, ChatGPT, or Gemini</strong>, and get a paste-ready RAID log update. No formatting, no manual extraction.</div>
        </div>
      </div>

      {/* Steps */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:10, color:T.mutedLight, fontFamily:"'DM Mono', monospace", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12 }}>3 steps to run this</div>
        {[
          {n:"1", title:"Copy your meeting notes", desc:"Standup thread, sprint review, client call — any unstructured notes work."},
          {n:"2", title:"Choose a prompt below and copy it", desc:"Full RAID for sprint reviews. Actions Only for standups. Risk Register for weekly governance."},
          {n:"3", title:"Paste notes into the prompt, run in any AI", desc:"Replace the placeholder text with your notes. Claude, ChatGPT, and Gemini all work."},
        ].map((s,i) => (
          <div key={i} style={{ display:"flex", gap:12, marginBottom:12, alignItems:"flex-start" }}>
            <div style={{ width:26, height:26, borderRadius:"50%", flexShrink:0, background:T.accentDim, border:`1px solid ${T.accent}35`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:T.accent, fontFamily:"'DM Mono', monospace" }}>{s.n}</div>
            <div style={{ paddingTop:3 }}>
              <div style={{ fontSize:13, fontWeight:600, color:T.textBright, marginBottom:1 }}>{s.title}</div>
              <div style={{ fontSize:12, color:T.mutedLight, lineHeight:1.55 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Prompt cards */}
      <div style={{ fontSize:10, color:T.mutedLight, fontFamily:"'DM Mono', monospace", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>Choose a prompt → paste your notes → run</div>
      {prompts.map((p, i) => (
        <div key={i} style={{ background:T.card, border:`1px solid ${activeStep===i ? T.accent+"50" : T.border}`, borderRadius:10, padding:"13px 16px", marginBottom:10, transition:"border-color 0.2s", cursor:"pointer" }} onClick={() => setActiveStep(activeStep===i ? null : i)}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom: activeStep===i ? 10 : 0, gap:8 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:T.textBright, marginBottom:1 }}>{p.label}</div>
              <div style={{ fontSize:11, color:T.mutedLight }}>{p.desc}</div>
            </div>
            <div style={{ display:"flex", gap:6, flexShrink:0, alignItems:"center" }}>
              <button onClick={e => { e.stopPropagation(); copy(p.prompt, i); }} style={{ background:copiedIdx===i ? T.accentDim : "transparent", border:`1px solid ${copiedIdx===i ? T.accent : T.border}`, color:copiedIdx===i ? T.accent : T.mutedLight, borderRadius:6, padding:"4px 10px", fontSize:11, fontFamily:"'DM Mono', monospace", fontWeight:700, letterSpacing:"0.06em", cursor:"pointer", transition:"all 0.2s", whiteSpace:"nowrap" }}>
                {copiedIdx===i ? "✓ COPIED" : "COPY"}
              </button>
              <span style={{ color:T.mutedLight, fontSize:12, display:"inline-block", transform:activeStep===i ? "rotate(180deg)" : "rotate(0deg)", transition:"transform 0.2s" }}>▾</span>
            </div>
          </div>
          {activeStep===i && (
            <pre style={{ margin:0, fontSize:11, color:T.mutedLight, fontFamily:"'DM Mono', monospace", whiteSpace:"pre-wrap", lineHeight:1.7, background:T.surface, borderRadius:6, padding:"9px 11px" }}>{p.prompt}</pre>
          )}
        </div>
      ))}

      {/* CTA */}
      <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, background:T.accent, color:"#fff", borderRadius:10, padding:"12px 20px", fontSize:12, fontWeight:700, fontFamily:"'DM Mono', monospace", letterSpacing:"0.08em", textDecoration:"none", marginTop:12 }}>
        OPEN CLAUDE.AI → RUN THESE PROMPTS LIVE ↗
      </a>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────
export default function PMHub() {
  const [dark,       setDark]      = useState(false);   // LIGHT default
  const [activeTab,  setActiveTab] = useState("playbook");
  const [search,     setSearch]    = useState("");
  const [activeCat,  setActiveCat] = useState("all");
  const [mounted,    setMounted]   = useState(false);
  const searchRef = useRef(null);

  useEffect(()=>{ setTimeout(()=>setMounted(true),80); },[]);
  useEffect(()=>{
    function h(e){ if((e.metaKey||e.ctrlKey)&&e.key==="k"){ e.preventDefault(); setActiveTab("playbook"); setTimeout(()=>searchRef.current?.focus(),50); } }
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[]);

  const T = dark ? DARK : LIGHT;

  const catColor = id => id==="stakeholder" ? T.accent : id==="escalation" ? T.coral : id==="sprint" ? T.amber : T.accent;

  const filtered = ALL_PROMPTS.filter(p=>{
    const matchCat = activeCat==="all" || p.category===activeCat;
    const q = search.toLowerCase().trim();
    if(!q) return matchCat;
    return matchCat && (p.title.toLowerCase().includes(q)||p.problem.toLowerCase().includes(q)||p.tags.some(t=>t.includes(q))||p.categoryLabel.toLowerCase().includes(q));
  });

  return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.text, fontFamily:"'Sora', sans-serif", transition:"background 0.3s,color 0.3s" }}>
      <style>{`
        html,body,#root{background:${T.bg}!important;margin:0;padding:0;min-height:100vh;transition:background 0.3s;}
        *,*::before,*::after{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;background:${T.bg};}
        ::-webkit-scrollbar-track{background:${T.bg};}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.35;}}
        textarea::placeholder{color:${T.muted};}
        textarea:focus{border-color:${T.accent}!important;outline:none;}
        input::placeholder{color:${T.muted};}
        input:focus{border-color:${T.accent}!important;outline:none;}
        a{transition:opacity 0.2s;} a:hover{opacity:0.8;}
        button:hover{opacity:0.88;}
      `}</style>

      <div style={{ maxWidth:920, margin:"0 auto", padding:"0 24px" }}>

        {/* ── HERO ── */}
        <div style={{ paddingTop:48, paddingBottom:40, borderBottom:`1px solid ${T.border}`, opacity:mounted?1:0, animation:mounted?"fadeUp 0.4s ease both":"none", display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:24 }}>
          <div style={{ flex:1, minWidth:260 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:T.accent, animation:"pulse 2s ease-in-out infinite" }}/>
              <span style={{ fontSize:11, color:T.accent, fontFamily:"'DM Mono', monospace", letterSpacing:"0.14em", textTransform:"uppercase" }}>Delivery PM × AI Workflows</span>
            </div>
            <h1 style={{ fontFamily:"'Sora', sans-serif", fontSize:"clamp(44px,8vw,74px)", fontWeight:800, margin:"0 0 14px", lineHeight:0.93, letterSpacing:"-0.03em", color:T.white }}>
              PM<br/>
              <span style={{ color:T.accent }}>AI</span><br/>
              HUB
            </h1>
            <p style={{ fontSize:15, color:T.mutedLight, lineHeight:1.75, margin:"0 0 18px", maxWidth:420 }}>
              Practical AI workflows for Delivery PMs — 13 prompts + 2 live workflows. Paste your data, get an exec-ready output, launch in one click. Built by <strong style={{ color:T.textBright }}>Nikhil Thomas A</strong>.
            </p>
            <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:14 }}>
              <Chip color={T.accent}>Stakeholder</Chip>
              <Chip color={T.coral}>Escalation</Chip>
              <Chip color={T.amber}>Sprint</Chip>
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <a href="https://nikhil-thomas-a.github.io/portfolio/" target="_blank" rel="noopener noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:6, color:T.accent, fontSize:12, textDecoration:"none", fontFamily:"'DM Mono', monospace", letterSpacing:"0.04em", border:`1px solid ${T.accent}40`, borderRadius:6, padding:"5px 11px", fontWeight:700 }}>
                ← Portfolio
              </a>
              <a href="https://www.linkedin.com/in/nikhil-thomas-a-58538117a/" target="_blank" rel="noopener noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:6, color:T.mutedLight, fontSize:12, textDecoration:"none", fontFamily:"'DM Mono', monospace", letterSpacing:"0.04em", border:`1px solid ${T.border}`, borderRadius:6, padding:"5px 11px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill={T.mutedLight}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                Nikhil Thomas A
              </a>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10, alignItems:"flex-end" }}>
            {/* Theme toggle */}
            <button onClick={()=>setDark(!dark)} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, padding:"6px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:7, color:T.mutedLight, fontSize:11, fontFamily:"'DM Mono', monospace", fontWeight:700, letterSpacing:"0.04em", transition:"all 0.2s" }}>
              {dark?"☀ LIGHT MODE":"🌙 DARK MODE"}
            </button>
            {/* Stats */}
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:13, padding:"17px 20px", minWidth:185 }}>
              {[{n:"13",label:"Ready-to-use prompts",c:T.accent},{n:"3",label:"PM pain point areas",c:T.teal},{n:"4",label:"Slack AI prompts",c:T.amber},{n:"∞",label:"Hours saved/week",c:T.coral}].map((s,i,arr)=>(
                <div key={i} style={{ paddingBottom:i<arr.length-1?11:0, marginBottom:i<arr.length-1?11:0, borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none" }}>
                  <div style={{ fontSize:22, fontWeight:800, color:s.c, fontFamily:"'Sora', sans-serif", lineHeight:1 }}>{s.n}</div>
                  <div style={{ fontSize:11, color:T.mutedLight, marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Keyboard hint */}
        <div style={{ textAlign:"right", padding:"7px 0 0", opacity:0.45 }}>
          <span style={{ fontSize:10, color:T.mutedLight, fontFamily:"'DM Mono', monospace" }}>
            <kbd style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:3, padding:"1px 5px", fontSize:10 }}>⌘K</kbd> to search
          </span>
        </div>

        {/* ── TABS ── */}
        <div style={{ display:"flex", borderBottom:`1px solid ${T.border}`, marginBottom:26, marginTop:4 }}>
          {[{id:"playbook",label:"🎓 Prompt Playbook"},{id:"tools",label:"⚙️ Workflow Lab"},{id:"roadmap",label:"🗺️ Roadmap"}].map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{ background:"none", border:"none", borderBottom:`2px solid ${activeTab===tab.id?T.accent:"transparent"}`, color:activeTab===tab.id?T.accent:T.mutedLight, padding:"11px 18px", fontSize:13, fontWeight:600, fontFamily:"'DM Mono', monospace", letterSpacing:"0.04em", cursor:"pointer", marginBottom:-1, transition:"all 0.2s" }}>{tab.label}</button>
          ))}
        </div>

        {/* ══ PLAYBOOK ══ */}
        {activeTab==="playbook" && (
          <div style={{ animation:"fadeUp 0.3s ease both" }}>
            {/* Search */}
            <div style={{ position:"relative", marginBottom:12 }}>
              <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:T.mutedLight, fontSize:13 }}>🔍</span>
              <input ref={searchRef} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search — try 'retro', 'exec', 'escalation', 'release'…" style={{ width:"100%", background:T.card, border:`1px solid ${search?T.accent+"60":T.border}`, borderRadius:9, padding:"10px 36px", color:T.textBright, fontSize:13, fontFamily:"inherit", transition:"border-color 0.2s" }}/>
              {search && <button onClick={()=>setSearch("")} style={{ position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:T.mutedLight, fontSize:15, cursor:"pointer", padding:"0 3px" }}>✕</button>}
            </div>
            {/* Category filter */}
            <div style={{ display:"flex", gap:7, marginBottom:20, flexWrap:"wrap" }}>
              {CATEGORIES.map(cat=>(
                <button key={cat.id} onClick={()=>setActiveCat(cat.id)} style={{ background:activeCat===cat.id?`${catColor(cat.id)}10`:"transparent", border:`1px solid ${activeCat===cat.id?catColor(cat.id):T.border}`, borderRadius:8, padding:"6px 13px", color:activeCat===cat.id?catColor(cat.id):T.mutedLight, fontSize:12, fontWeight:600, fontFamily:"'DM Mono', monospace", display:"flex", alignItems:"center", gap:5, transition:"all 0.18s", cursor:"pointer" }}>
                  <span>{cat.emoji}</span><span>{cat.label}</span>
                  <span style={{ fontSize:10, opacity:0.6 }}>({ALL_PROMPTS.filter(p=>cat.id==="all"||p.category===cat.id).length})</span>
                </button>
              ))}
            </div>
            {(search||activeCat!=="all") && <div style={{ fontSize:11, color:T.mutedLight, fontFamily:"'DM Mono', monospace", marginBottom:12 }}>{filtered.length} prompt{filtered.length!==1?"s":""} found{search&&<span> for "<span style={{color:T.accent}}>{search}</span>"</span>}</div>}
            {filtered.length>0
              ? filtered.map(p=><PromptCard key={p.id} prompt={p} T={T}/>)
              : <div style={{ textAlign:"center", padding:"44px 0", color:T.mutedLight }}>
                  <div style={{ fontSize:30, marginBottom:10 }}>🔍</div>
                  <div style={{ fontSize:14, color:T.textBright, marginBottom:5 }}>No prompts match "{search}"</div>
                  <div style={{ fontSize:12, marginBottom:14 }}>Try: escalation, retro, exec, sprint, risk, release, meeting</div>
                  <button onClick={()=>{setSearch("");setActiveCat("all");}} style={{ background:T.accentDim, border:`1px solid ${T.accent}28`, color:T.accent, borderRadius:7, padding:"7px 14px", fontSize:12, fontFamily:"'DM Mono', monospace", cursor:"pointer" }}>CLEAR SEARCH</button>
                </div>
            }
          </div>
        )}

        {/* ══ TOOLS ══ */}
        {activeTab==="tools" && (
          <div style={{ animation:"fadeUp 0.3s ease both" }}>
            <div style={{ marginBottom:20 }}>
              <h2 style={{ fontFamily:"'Sora', sans-serif", fontSize:22, fontWeight:800, color:T.white, margin:"0 0 5px" }}>Workflow Lab</h2>
              <p style={{ color:T.mutedLight, fontSize:14, margin:0 }}>AI-powered workflows for Delivery PMs — run natively in Claude.ai with Slack connected.</p>
            </div>
            {/* Slack workflow */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <span style={{ fontSize:19 }}>💬</span>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:T.white }}>Slack Channel Summariser</span>
                  <Chip color={T.teal} small>Run in Claude.ai</Chip>
                </div>
                <div style={{ fontSize:12, color:T.mutedLight, marginTop:2 }}>4 ready-to-use prompts — paste into Claude.ai with Slack MCP connected</div>
              </div>
            </div>
            <SlackHowTo T={T}/>

            {/* Divider */}
            <div style={{ display:"flex", alignItems:"center", gap:12, margin:"30px 0 22px" }}>
              <div style={{ flex:1, height:1, background:T.border }}/>
              <span style={{ fontSize:10, color:T.mutedLight, fontFamily:"'DM Mono', monospace", letterSpacing:"0.1em", textTransform:"uppercase" }}>also live</span>
              <div style={{ flex:1, height:1, background:T.border }}/>
            </div>

            {/* RAID workflow */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <span style={{ fontSize:19 }}>🗂️</span>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:T.white }}>RAID Log Agent</span>
                  <Chip color={T.accent} small>Run in any AI</Chip>
                  <span style={{ background:"#16a34a", color:"#fff", fontSize:9, fontWeight:800, letterSpacing:"0.12em", padding:"2px 7px", borderRadius:3, textTransform:"uppercase" }}>NEW</span>
                </div>
                <div style={{ fontSize:12, color:T.mutedLight, marginTop:2 }}>4 prompts — paste meeting notes, get a paste-ready RAID log update in seconds</div>
              </div>
            </div>
            <RAIDWorkflow T={T}/>

            {/* Coming soon */}
            <div style={{ marginTop:30 }}>
              <div style={{ fontSize:10, color:T.mutedLight, fontFamily:"'DM Mono', monospace", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>Coming Soon</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(210px, 1fr))", gap:11 }}>
                {[{emoji:"📊",name:"Status Report Bot",desc:"Connects to Jira + Slack, drafts your weekly report"},{emoji:"🔥",name:"Escalation Triage",desc:"Classifies incidents by severity, routes to right owner"}].map((t,i)=>(
                  <div key={i} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"16px", opacity:0.5 }}>
                    <div style={{ fontSize:21, marginBottom:9 }}>{t.emoji}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:T.textBright, marginBottom:4 }}>{t.name}</div>
                    <p style={{ margin:0, fontSize:12, color:T.mutedLight, lineHeight:1.5 }}>{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ ROADMAP ══ */}
        {activeTab==="roadmap" && (
          <div style={{ animation:"fadeUp 0.3s ease both" }}>
            <div style={{ marginBottom:22 }}>
              <h2 style={{ fontFamily:"'Sora', sans-serif", fontSize:22, fontWeight:800, color:T.white, margin:"0 0 5px" }}>What's Being Built</h2>
              <p style={{ color:T.mutedLight, fontSize:14, margin:0 }}>This hub grows with real PM needs. Here's what's live, next, and planned.</p>
            </div>
            {ROADMAP.map((phase,pi)=>{
              const pc = pi===0?T.accent:pi===1?T.teal:T.amber;
              return (
                <div key={pi} style={{ marginBottom:24 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:pc, animation:pi===0?"pulse 1.8s ease-in-out infinite":"none", boxShadow:pi===0?`0 0 6px ${pc}`:"none" }}/>
                    <span style={{ fontSize:11, color:pc, fontFamily:"'DM Mono', monospace", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>{phase.phase}</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:11 }}>
                    {phase.items.map((item,ii)=>(
                      <div key={ii} style={{ background:T.card, border:`1px solid ${pi===0?pc+"28":T.border}`, borderRadius:10, padding:"14px 16px", opacity:pi===2?0.6:1 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:5 }}>
                          <span style={{ fontSize:13, fontWeight:700, color:T.textBright }}>{item.name}</span>
                          {pi===0&&<Chip color={T.accent} small>Live</Chip>}
                          {pi===1&&<Chip color={T.teal} small>Soon</Chip>}
                        </div>
                        <p style={{ margin:0, fontSize:12, color:T.mutedLight, lineHeight:1.6 }}>{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {/* About */}
            <div style={{ background:T.accentDim, border:`1px dashed ${T.accent}28`, borderRadius:12, padding:"22px" }}>
              <div style={{ fontSize:14, fontWeight:700, color:T.textBright, marginBottom:5 }}>Built by Nikhil Thomas A</div>
              <p style={{ color:T.mutedLight, fontSize:13, margin:"0 0 13px", lineHeight:1.65 }}>Delivery Program Manager exploring the intersection of AI and programme delivery. Every prompt here comes from a real problem — running sprints, managing stakeholders, handling escalations at 11pm.</p>
              <a href="https://www.linkedin.com/in/nikhil-thomas-a-58538117a/" target="_blank" rel="noopener noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:6, background:T.accentDim, border:`1px solid ${T.accent}38`, color:T.accent, borderRadius:7, padding:"8px 14px", fontSize:12, fontWeight:700, fontFamily:"'DM Mono', monospace", letterSpacing:"0.06em", textDecoration:"none" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill={T.accent}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                CONNECT ON LINKEDIN →
              </a>
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{ borderTop:`1px solid ${T.border}`, marginTop:50, padding:"18px 0", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
          <span style={{ fontFamily:"'Sora', sans-serif", fontSize:15, fontWeight:800, color:T.accent }}>PM AI Hub</span>
          <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
            <a href="https://nikhil-thomas-a.github.io/portfolio/" target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:T.mutedLight, fontFamily:"'DM Mono', monospace", textDecoration:"none" }}>Nikhil Thomas A</a>
            <span style={{ fontSize:11, color:T.muted }}>·</span>
            <a href="https://nikhil-thomas-a.github.io/startup-ops-toolkit/" target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:T.mutedLight, fontFamily:"'DM Mono', monospace", textDecoration:"none" }}>Startup Ops Toolkit</a>
            <span style={{ fontSize:11, color:T.muted }}>·</span>
            <span style={{ fontSize:11, color:T.muted, fontFamily:"'DM Mono', monospace" }}>Free forever</span>
          </div>
        </div>

      </div>
    </div>
  );
}
