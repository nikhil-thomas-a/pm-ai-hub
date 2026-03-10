import { useState, useEffect, useRef } from "react";

// ── THEME SYSTEM ──────────────────────────────────────────────
const DARK = {
  bg:          "#0C0A0A",
  surface:     "#131010",
  card:        "#1A1616",
  cardHover:   "#201B1B",
  border:      "#2A2020",
  borderHover: "#3D2A2A",
  accent:      "#E5484D",
  accentSoft:  "#FF6166",
  accentDim:   "rgba(229,72,77,0.1)",
  accentGlow:  "rgba(229,72,77,0.2)",
  coral:       "#FF8B7B",
  coralDim:    "rgba(255,139,123,0.1)",
  amber:       "#F0A500",
  amberDim:    "rgba(240,165,0,0.1)",
  teal:        "#00B8A2",
  tealDim:     "rgba(0,184,162,0.1)",
  text:        "#C9B8B8",
  textBright:  "#EDE0E0",
  muted:       "#4A3030",
  mutedLight:  "#7A5555",
  white:       "#FFF5F5",
  isDark: true,
};

const LIGHT = {
  bg:          "#FDFAFA",
  surface:     "#F5EFEF",
  card:        "#FFFFFF",
  cardHover:   "#FDF0F0",
  border:      "#E8D8D8",
  borderHover: "#D4BABA",
  accent:      "#D13235",
  accentSoft:  "#E5484D",
  accentDim:   "rgba(209,50,53,0.08)",
  accentGlow:  "rgba(209,50,53,0.15)",
  coral:       "#C0392B",
  coralDim:    "rgba(192,57,43,0.08)",
  amber:       "#C07800",
  amberDim:    "rgba(192,120,0,0.08)",
  teal:        "#007A6E",
  tealDim:     "rgba(0,122,110,0.08)",
  text:        "#4A3030",
  textBright:  "#1A0A0A",
  muted:       "#B89090",
  mutedLight:  "#8A6060",
  white:       "#1A0A0A",
  isDark: false,
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
    promptTemplate:(data)=>`You are a senior Delivery PM. Given the following sprint data, write a concise weekly status report for executive stakeholders.

FORMAT:
- Overall Status: [🟢 Green / 🟡 Amber / 🔴 Red]
- Summary (2 sentences max)
- Wins This Week (bullet points)
- Blockers & Risks (with owner and mitigation)
- Next Week Focus (3 priorities)

TONE: Confident, direct, no jargon. Executives should scan it in 60 seconds.

SPRINT DATA:
${data||"[Paste your Jira sprint summary / standup notes here]"}`,
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
    promptTemplate:(data)=>`I need to communicate the same project update to three different stakeholders. Rewrite the update below THREE times:

1. CTO VERSION: Technical depth, system risks, engineering velocity
2. CPO VERSION: Feature progress, user impact, roadmap alignment
3. CLIENT VERSION: Milestone status, value delivered, what's next

Keep each under 150 words. No internal jargon in the client version.

UPDATE TO ADAPT:
${data||"[Paste your raw update here]"}`,
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
    promptTemplate:(data)=>`You are a Delivery PM. Summarise these meeting notes into clean, shareable minutes.

OUTPUT FORMAT:
- Date & Attendees
- Purpose of Meeting (1 sentence)
- Key Decisions Made (bullet list)
- Action Items (Owner | Task | Due Date)
- Parking Lot / Open Questions
- Next Meeting: [date if mentioned]

TONE: Professional, neutral, blameless. Under 300 words total.

RAW NOTES:
${data||"[Paste your raw meeting notes here]"}`,
    tips:["Works on voice-to-text transcripts","Add 'Flag decisions needing leadership sign-off' for governance projects","Output pastes cleanly into Confluence"],
    steps:["Take rough notes during the meeting (voice memo, typed, anything)","Paste into the input box above","Run — clean minutes in seconds","Review action items and confirm owners","Share with attendees within 30 minutes"],
  },
  {
    id:"s4", category:"stakeholder", categoryLabel:"Stakeholder Reporting", emoji:"📊",
    title:"Exec Briefing One-Pager", difficulty:"Intermediate", time:"4 min",
    tags:["exec","briefing","one-pager","steering","board","committee"],
    problem:"You have 5 minutes in a steering committee. You need a tight, credible one-pager that covers everything without losing the room.",
    inputLabel:"Paste your programme status data",
    inputPlaceholder:"e.g. 3 workstreams: Data (Green), UX (Amber — designer off sick), Infra (Green). Key win: UAT passed with 98% pass rate. Issue: data migration tool needs re-scoping (+2 weeks). Budget: 72% consumed, 65% through delivery. Decision needed: approve phase 2 scope...",
    promptTemplate:(data)=>`Create a concise executive briefing one-pager for a steering committee review.

SECTIONS:
1. Programme at a Glance (traffic light + 1 sentence per workstream)
2. Top 3 Achievements This Period
3. Critical Issues & Mitigations (max 3)
4. Budget Status (on track / at risk — % consumed vs planned)
5. Key Decisions Needed from Leadership
6. Outlook for Next Period (2-3 bullets)

MAX LENGTH: Fits one printed page. No waffle.

PROGRAMME DATA:
${data||"[Paste your programme status data here]"}`,
    tips:["Add 'Audience: non-technical board members' if needed","'Decisions Needed' forces action, not just awareness","Run twice: once for content, once asking Claude to 'cut 20% of words'"],
    steps:["Gather workstream statuses, wins, issues, and budget info","Paste all of it into the input above","Run — one-pager structure in seconds","Review 'Decisions Needed' section most carefully","Print or paste into your slide deck as the opening page"],
  },
  {
    id:"e1", category:"escalation", categoryLabel:"Escalation & Incidents", emoji:"🚨",
    title:"Escalation Draft Generator", difficulty:"Beginner", time:"90 sec",
    tags:["escalation","incident","urgent","comms","manager","crisis"],
    problem:"Something just broke or missed. You need to escalate fast and professionally — without panic, blame, or missing context.",
    inputLabel:"Describe the situation + who you're escalating to",
    inputPlaceholder:"e.g. Situation: Production database went down at 14:32 today. 3 enterprise clients affected, unable to access their dashboards. We identified a failed migration script — rollback in progress, ETA 30 mins. Escalating to: VP Engineering and Head of Customer Success.",
    promptTemplate:(data)=>`You are a calm, senior Delivery PM. Draft an escalation message based on the situation below.

STRUCTURE:
- Situation (what happened, when, impact)
- Root Cause (known or suspected)
- Immediate Actions Taken
- What I Need From You (specific ask)
- ETA for next update

TONE: Urgent but composed. Own the situation, don't assign blame. Be specific about the ask.

SITUATION & AUDIENCE:
${data||"[Describe what happened + who you are escalating to]"}`,
    tips:["'We have a workaround' vs 'no workaround yet' changes tone significantly","'This started 2 hours ago' gives Claude urgency context","Run twice — once for your manager, once for the client"],
    steps:["Describe what happened in 2-3 plain sentences","Add who you're escalating to","Run — structured escalation in 10 seconds","Check 'What I Need From You' — make the ask crystal clear","Send within 5 minutes — speed signals control"],
  },
  {
    id:"e2", category:"escalation", categoryLabel:"Escalation & Incidents", emoji:"🚨",
    title:"Post-Mortem Drafter", difficulty:"Intermediate", time:"5 min",
    tags:["post-mortem","incident","blameless","RCA","timeline","review"],
    problem:"Post-mortems are painful to write. Raw notes, tired team — but leadership wants a polished document by EOD.",
    inputLabel:"Paste your incident notes or Slack thread",
    inputPlaceholder:"e.g. 14:32 - DB migration script failed silently. 14:45 - First client report came in via Zendesk. 15:00 - On-call engineer paged, identified root cause. 15:20 - Rollback initiated. 16:05 - Service restored. Root cause: migration script didn't validate schema before running. 847 users affected for 93 minutes...",
    promptTemplate:(data)=>`Write a blameless post-mortem document from the notes below.

SECTIONS:
1. Incident Summary (severity, duration, impact)
2. Timeline (key events in chronological order)
3. Root Cause Analysis (use 5 Whys if applicable)
4. What Went Well
5. What Went Wrong
6. Action Items (owner, due date, priority)

PRINCIPLE: Blameless. Focus on systems and processes, not individuals.

RAW NOTES / SLACK THREAD:
${data||"[Paste your incident notes here]"}`,
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
    promptTemplate:(data)=>`You are a Delivery PM. Update the risk register based on new information below.

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
${data||"[Paste meeting notes, sprint review, or standup updates]"}`,
    tips:["Leave input blank to generate a fresh register from scratch","Add 'Focus on delivery timeline risks' to filter noise","Run after every sprint review to keep it current automatically"],
    steps:["Copy your latest meeting notes or sprint review","Paste into the input box above","Run — risks extracted and rated automatically","Review ratings against your own judgment","Paste the output into your RAID log or Confluence"],
  },
  {
    id:"e4", category:"escalation", categoryLabel:"Escalation & Incidents", emoji:"🚨",
    title:"Difficult Conversation Preparer", difficulty:"Advanced", time:"5 min",
    tags:["stakeholder","conflict","difficult","conversation","negotiation","pushback"],
    problem:"You need to deliver bad news, push back on scope, or manage a difficult stakeholder. You want to plan the conversation before you walk in.",
    inputLabel:"Describe the conversation context",
    inputPlaceholder:"e.g. I need to tell the client we're 3 weeks late on the delivery due to scope changes they requested mid-sprint but didn't formally approve. They're already frustrated from a previous delay. I want to maintain the relationship and agree a revised timeline without conceding more free work.",
    promptTemplate:(data)=>`Help me prepare for a difficult PM conversation.

CONTEXT:
${data||"[Describe the conversation type, who you're speaking with, the core message, what you're worried they'll say, and what outcome you want]"}

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
    inputPlaceholder:"e.g. Sprint 18, Day 5 of 10. 14 tickets in sprint: 5 done, 6 in progress, 3 not started. Two engineers working on same API endpoint (potential conflict). QA environment down since Tuesday. One engineer OOO Friday. Sprint goal: complete user auth flow end-to-end.",
    promptTemplate:(data)=>`Act as a delivery risk analyst. Review this sprint status and identify risks I might be missing.

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
${data||"[Paste sprint board summary, standup notes, or Jira export]"}`,
    tips:["Run on Wednesday — enough data, still time to act","Include OOO and capacity notes — Claude factors these in","Use the standup questions verbatim"],
    steps:["Copy your sprint board status or standup notes","Paste into the input box above","Run mid-sprint","Use 'Questions to ask in standup' word for word","Run every sprint and compare — patterns appear over 3-4 sprints"],
  },
  {
    id:"sp2", category:"sprint", categoryLabel:"Sprint & Delivery", emoji:"⚡",
    title:"Retro Insight Extractor", difficulty:"Intermediate", time:"4 min",
    tags:["retro","retrospective","patterns","team","improvement","cross-sprint"],
    problem:"Retros generate great conversation but insights disappear. The same problems recur because no one tracks themes across sprints.",
    inputLabel:"Paste retrospective notes from 3+ sprints",
    inputPlaceholder:"e.g. Sprint 15 retro: Good — new deployment pipeline saves time. Improve — blocked by Platform team again, third sprint running. Action: PM to escalate.  Sprint 16: Good — team demo went well. Improve — unclear sprint goals at start. Sprint 17: Good — QA joined planning. Improve — Platform blocker STILL unresolved...",
    promptTemplate:(data)=>`Analyze these retrospective notes from multiple sprints and identify systemic patterns.

FIND:
1. Recurring themes (what keeps coming up?)
2. Unresolved action items from previous retros
3. Team sentiment trend (improving / declining / stable)
4. Top 3 process improvements with highest ROI
5. What the team is doing well (don't only focus on problems)

FORMAT: Executive summary + detailed breakdown. Actionable, not academic.

RETRO NOTES:
${data||"[Paste multi-sprint retro notes here — messy is fine]"}`,
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
    promptTemplate:(data)=>`Write a clear, measurable sprint goal based on the work below.

A good sprint goal:
- Is 1-2 sentences
- Describes the outcome, not the tasks
- Is measurable (you can say yes/no at the end of sprint)
- Aligns to a business objective
- Motivates the team

Also give me: 3 alternative versions (one ambitious, one safe, one mid-range)

SPRINT BACKLOG & CONTEXT:
${data||"[Paste your sprint ticket list and business context]"}`,
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
    promptTemplate:(data)=>`Analyse this sprint/programme plan and identify all cross-team dependencies.

FOR EACH DEPENDENCY OUTPUT:
- What: The dependency
- Who depends on whom: Team A waiting on Team B for X
- When needed by
- Risk Level: High / Medium / Low
- Suggested Action: What should the PM do right now?

Also flag: circular dependencies, dependencies with no named owner.

PLAN / BACKLOG / NOTES:
${data||"[Paste your sprint plan, programme plan, or standup notes]"}`,
    tips:["Run at sprint planning to catch issues before the sprint starts","Add 'delivery deadline: [date]' to sharpen risk ratings","Export output as a table to paste into your RAID log"],
    steps:["Paste your sprint plan, backlog, or cross-team notes","Add your delivery deadline if there is one","Run — all dependencies listed with risk levels","Immediately contact owners of High risk dependencies","Add to your RAID log and track weekly"],
  },
  {
    id:"sp5", category:"sprint", categoryLabel:"Sprint & Delivery", emoji:"⚡",
    title:"Release Readiness Checker", difficulty:"Intermediate", time:"4 min",
    tags:["release","readiness","go-live","checklist","deployment","go-no-go"],
    problem:"Every release has last-minute surprises. You need a systematic go/no-go assessment before you push to production.",
    inputLabel:"Paste your release info, test results, and sign-off status",
    inputPlaceholder:"e.g. Release v2.4.1 — scheduled Friday 18:00. Test coverage 87%, 2 open P2 bugs (both have workarounds). Staging tested: yes. Rollback plan: yes (DB snapshot at 17:30). Sign-offs: Product ✅ QA ✅ Security ❌ (review pending). Client notified: yes. Support briefed: no. Monitoring: basic alerts only.",
    promptTemplate:(data)=>`Act as a senior release manager. Assess release readiness and give a Go / No-Go recommendation.

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
${data||"[Paste your release notes, test results, or sign-off status]"}`,
    tips:["Run 48 hours before release — time to fix conditional issues","Add 'We cannot delay — business deadline is X' for conditional Go with conditions","Share output with engineering lead to align on final decision"],
    steps:["Gather test results, open bugs, sign-off status, infra notes","Paste into the input above","Run — Go/No-Go with clear reasoning","Review blockers list with your tech lead immediately","Turn conditions into a checklist for the 24 hours before release"],
  },
];

const CATEGORIES = [
  { id:"all",         label:"All Prompts",            emoji:"🔍", color: null },
  { id:"stakeholder", label:"Stakeholder Reporting",  emoji:"📊", color: null },
  { id:"escalation",  label:"Escalation & Incidents", emoji:"🚨", color: null },
  { id:"sprint",      label:"Sprint & Delivery",      emoji:"⚡", color: null },
];

const ROADMAP = [
  { phase:"Now — Live", status:"live", items:[
    { name:"Prompt Playbook", desc:"13 prompts across 3 PM pain points with step-by-step guides and smart data input" },
    { name:"Workflow Lab", desc:"Slack Summariser — 4 ready-to-use prompts for Claude.ai with Slack MCP" },
    { name:"Prompt Search", desc:"Search all prompts by keyword, category, or pain point" },
    { name:"Light / Dark Mode", desc:"Readable in any environment — toggle in the top right" },
  ]},
  { phase:"Next — Building", status:"building", items:[
    { name:"RAID Log Agent", desc:"Paste meeting notes → auto-populated RAID log ready to share" },
    { name:"Case Study Journal", desc:"Real delivery problems, exact prompts used, measurable outcomes" },
    { name:"Jira Integration Prompts", desc:"Prompt workflows that work with Jira exports and API data" },
  ]},
  { phase:"Later — Planned", status:"planned", items:[
    { name:"Live Backend Tools", desc:"Vercel serverless functions to power real-time Slack and Jira integrations" },
    { name:"Community Prompts", desc:"PMs submit prompts — curated and quality-checked before publishing" },
    { name:"Weekly PM AI Digest", desc:"Email digest of new prompts and AI workflow tips" },
  ]},
];

// ── HELPERS ────────────────────────────────────────────────────
function buildClaudeUrl(prompt) {
  return `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;
}
function buildChatGPTUrl(prompt) {
  return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
}
function buildGeminiUrl(prompt) {
  return `https://gemini.google.com/app?q=${encodeURIComponent(prompt.slice(0,500))}`;
}

// ── COMPONENTS ─────────────────────────────────────────────────

function Chip({ children, color, small, onClick, active }) {
  return (
    <span onClick={onClick} style={{
      display:"inline-block",
      background: active ? `${color}22` : `${color}12`,
      color, border:`1px solid ${active ? color+"60" : color+"30"}`,
      borderRadius:4, padding: small?"1px 7px":"3px 10px",
      fontSize: small?10:11, fontWeight:700, letterSpacing:"0.1em",
      textTransform:"uppercase", fontFamily:"'DM Mono', monospace",
      cursor: onClick?"pointer":"default", transition:"all 0.15s",
    }}>{children}</span>
  );
}

function DiffPip({ level, T }) {
  const map = { Beginner:T.teal, Intermediate:T.amber, Advanced:T.coral };
  return <Chip color={map[level]||T.mutedLight} small>{level}</Chip>;
}

function CopyIcon({ text, T }) {
  const [done, setDone] = useState(false);
  function copy(e) {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setDone(true);
    setTimeout(()=>setDone(false), 2000);
  }
  return (
    <button onClick={copy} title="Copy to clipboard" style={{
      background: done ? `${T.accent}15` : T.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
      border:`1px solid ${done ? T.accent+"50" : T.border}`,
      color: done ? T.accent : T.mutedLight,
      borderRadius:6, padding:"5px 8px", cursor:"pointer",
      fontSize:11, display:"flex", alignItems:"center", gap:5,
      fontFamily:"'DM Mono', monospace", fontWeight:700,
      letterSpacing:"0.04em", transition:"all 0.2s", flexShrink:0,
    }}>
      {done ? (
        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> COPIED</>
      ) : (
        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> COPY</>
      )}
    </button>
  );
}

function RunLinks({ promptText, T }) {
  const links = [
    { label:"Claude", url:buildClaudeUrl(promptText), color:T.accent,
      icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg> },
    { label:"ChatGPT", url:buildChatGPTUrl(promptText), color:T.teal,
      icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/></svg> },
    { label:"Gemini", url:buildGeminiUrl(promptText), color:T.amber,
      icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> },
  ];
  return (
    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
      {links.map(l => (
        <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" style={{
          display:"inline-flex", alignItems:"center", gap:5,
          background:`${l.color}12`, border:`1px solid ${l.color}35`,
          color:l.color, borderRadius:7, padding:"7px 12px",
          fontSize:11, fontWeight:700, fontFamily:"'DM Mono', monospace",
          letterSpacing:"0.05em", textDecoration:"none",
          transition:"all 0.2s", whiteSpace:"nowrap",
        }}>
          {l.icon} Run with {l.label} ↗
        </a>
      ))}
    </div>
  );
}

function PromptCard({ prompt, T }) {
  const [open, setOpen]       = useState(false);
  const [tab, setTab]         = useState("prompt");
  const [inputData, setInput] = useState("");
  const [copiedBottom, setCopiedBottom] = useState(false);

  const filledPrompt = prompt.promptTemplate(inputData);
  const ac = prompt.category === "stakeholder" ? T.accent
           : prompt.category === "escalation"  ? T.coral
           : T.amber;

  function copyBottom() {
    navigator.clipboard.writeText(filledPrompt);
    setCopiedBottom(true);
    setTimeout(()=>setCopiedBottom(false), 2000);
  }

  return (
    <div style={{
      background:T.card, border:`1px solid ${open ? ac+"45" : T.border}`,
      borderRadius:12, marginBottom:12, overflow:"hidden",
      transition:"border-color 0.2s, box-shadow 0.2s",
      boxShadow: open ? `0 4px 24px ${ac}15` : "none",
    }}>
      {/* Header */}
      <div onClick={()=>setOpen(!open)} style={{
        padding:"16px 20px", cursor:"pointer",
        display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12,
      }}>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", gap:7, marginBottom:7, flexWrap:"wrap", alignItems:"center" }}>
            <span style={{ fontSize:15 }}>{prompt.emoji}</span>
            <DiffPip level={prompt.difficulty} T={T} />
            <span style={{ color:T.mutedLight, fontSize:11, fontFamily:"'DM Mono', monospace" }}>⏱ {prompt.time}</span>
          </div>
          <div style={{ fontSize:15, fontWeight:700, color:T.textBright, marginBottom:4 }}>{prompt.title}</div>
          <div style={{ fontSize:12, color:T.mutedLight, lineHeight:1.55 }}>{prompt.problem}</div>
        </div>
        <span style={{
          color:T.mutedLight, fontSize:14, flexShrink:0, marginTop:4,
          display:"inline-block",
          transform:open?"rotate(180deg)":"rotate(0deg)", transition:"transform 0.2s",
        }}>▾</span>
      </div>

      {open && (
        <div style={{ borderTop:`1px solid ${T.border}`, padding:"16px 20px" }}>
          {/* Inner tabs */}
          <div style={{ display:"flex", gap:0, marginBottom:18, borderBottom:`1px solid ${T.border}` }}>
            {[{id:"prompt",label:"📋 Prompt"},{id:"howto",label:"📖 Step-by-Step"}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                background:"none", border:"none",
                borderBottom:`2px solid ${tab===t.id ? ac : "transparent"}`,
                color:tab===t.id ? ac : T.mutedLight,
                padding:"6px 16px", fontSize:11, fontWeight:700,
                fontFamily:"'DM Mono', monospace", letterSpacing:"0.06em",
                cursor:"pointer", textTransform:"uppercase",
                marginBottom:-1, transition:"all 0.15s",
              }}>{t.label}</button>
            ))}
          </div>

          {tab==="prompt" && (
            <>
              {/* Smart data input */}
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:11, color:T.mutedLight, fontFamily:"'DM Mono', monospace", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>
                  📥 {prompt.inputLabel}
                </div>
                <textarea
                  value={inputData}
                  onChange={e=>setInput(e.target.value)}
                  placeholder={prompt.inputPlaceholder}
                  rows={3}
                  style={{
                    width:"100%", background:T.surface,
                    border:`1px solid ${inputData ? ac+"50" : T.border}`,
                    borderRadius:8, padding:"10px 12px",
                    color:T.textBright, fontSize:12,
                    fontFamily:"inherit", resize:"vertical",
                    lineHeight:1.6, outline:"none",
                    transition:"border-color 0.2s",
                    placeholder:T.muted,
                  }}
                />
                {inputData && (
                  <div style={{ fontSize:10, color:ac, fontFamily:"'DM Mono', monospace", marginTop:4 }}>
                    ✓ Prompt auto-filled with your data
                  </div>
                )}
              </div>

              {/* Prompt display with top-right copy */}
              <div style={{ position:"relative", marginBottom:14 }}>
                <div style={{
                  position:"absolute", top:10, right:10, zIndex:2,
                  display:"flex", alignItems:"center", gap:6,
                }}>
                  <CopyIcon text={filledPrompt} T={T} />
                </div>
                <div style={{
                  background:T.surface, border:`1px solid ${T.border}`,
                  borderRadius:8, padding:"14px 16px", paddingRight:80,
                }}>
                  <pre style={{
                    margin:0, fontSize:12, color:T.text,
                    fontFamily:"'DM Mono', monospace",
                    whiteSpace:"pre-wrap", lineHeight:1.75,
                    maxHeight:240, overflowY:"auto",
                  }}>{filledPrompt}</pre>
                </div>
              </div>

              {/* Pro tips */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:10, color:T.mutedLight, fontFamily:"'DM Mono', monospace", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>💡 Pro Tips</div>
                {prompt.tips.map((tip,i)=>(
                  <div key={i} style={{ display:"flex", gap:8, marginBottom:6 }}>
                    <span style={{ color:ac, flexShrink:0, lineHeight:1.6 }}>→</span>
                    <span style={{ fontSize:12, color:T.mutedLight, lineHeight:1.55 }}>{tip}</span>
                  </div>
                ))}
              </div>

              {/* Bottom actions: copy + run links */}
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
                <button onClick={copyBottom} style={{
                  background:copiedBottom ? `${T.accent}15` : `${ac}12`,
                  border:`1px solid ${copiedBottom ? T.accent : ac}45`,
                  color:copiedBottom ? T.accent : ac,
                  borderRadius:7, padding:"8px 16px", fontSize:12, fontWeight:700,
                  fontFamily:"'DM Mono', monospace", letterSpacing:"0.06em",
                  cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", gap:6,
                }}>
                  {copiedBottom
                    ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> COPIED</>
                    : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> COPY PROMPT</>
                  }
                </button>
                <RunLinks promptText={filledPrompt} T={T} />
              </div>
            </>
          )}

          {tab==="howto" && (
            <div>
              <div style={{ fontSize:12, color:T.mutedLight, marginBottom:16, lineHeight:1.65, background:`${ac}08`, border:`1px solid ${ac}20`, borderRadius:8, padding:"10px 14px" }}>
                🌱 New to AI prompting? Follow these steps exactly — no experience needed.
              </div>
              {prompt.steps.map((step,i)=>(
                <div key={i} style={{ display:"flex", gap:14, marginBottom:16, alignItems:"flex-start" }}>
                  <div style={{
                    width:28, height:28, borderRadius:"50%", flexShrink:0,
                    background:`${ac}12`, border:`1px solid ${ac}40`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:12, fontWeight:700, color:ac, fontFamily:"'DM Mono', monospace",
                  }}>{i+1}</div>
                  <div style={{ paddingTop:4, fontSize:13, color:T.text, lineHeight:1.65 }}>{step}</div>
                </div>
              ))}
              <div style={{ background:`${ac}08`, border:`1px dashed ${ac}30`, borderRadius:8, padding:"12px 16px", marginTop:4 }}>
                <div style={{ fontSize:10, color:ac, fontFamily:"'DM Mono', monospace", fontWeight:700, letterSpacing:"0.1em", marginBottom:5 }}>WHERE TO RUN THIS</div>
                <div style={{ fontSize:12, color:T.mutedLight, lineHeight:1.6 }}>
                  Use the <strong style={{ color:T.textBright }}>"Run with Claude"</strong> button on the Prompt tab — it opens Claude.ai with your prompt pre-filled. Or copy the prompt and paste it into any LLM. Free to start.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Slack how-to
function SlackHowTo({ T }) {
  const [copiedIdx, setCopiedIdx] = useState(null);
  const slackPrompts = [
    { label:"Quick Channel Summary", desc:"Fast PM briefing from any Slack channel",
      prompt:`Read the last 30 messages from Slack channel #[your-channel-name] and give me a PM briefing:\n\n- TL;DR (2-3 sentences — what is this channel about right now?)\n- Action items (with owner and urgency: high/medium/low)\n- Blockers mentioned\n- Key decisions made\n- Overall sentiment (positive / neutral / tense / urgent)\n- Anyone who needs a follow-up from me` },
    { label:"Escalation Signal Scanner", desc:"Find hidden escalation risks before they blow up",
      prompt:`Read the last 50 messages from #[channel-name] and identify escalation risks.\n\nFlag anything that signals:\n- Unresolved blockers older than 24 hours\n- Frustrated language from stakeholders or team\n- Decisions raised but never confirmed\n- Work deprioritised without communication\n- Anyone who went quiet who should be active\n\nFormat as a risk briefing I can forward to my manager.` },
    { label:"Daily Standup Digest", desc:"Turn a standup channel into a structured digest",
      prompt:`Read today's messages from #[standup-channel-name] and create a standup digest.\n\nFor each person who posted:\n- What they completed yesterday\n- What they're working on today\n- Any blockers mentioned\n\nThen add:\n- Team-level blockers summary\n- Any risks to today's sprint goals\n- Anyone who didn't post (flag as absent)\n\nKeep the whole thing under 250 words.` },
    { label:"Cross-Team Dependency Check", desc:"Surface dependencies across multiple channels",
      prompt:`Read the last 30 messages from each of these channels: #[channel-1], #[channel-2], #[channel-3]\n\nIdentify all cross-team dependencies:\n- Team A waiting on Team B for X\n- Handoffs that haven't been confirmed\n- Shared resources being contested\n- Timeline misalignments\n\nFormat as a table: Who | Waiting For | What | By When | Risk Level` },
  ];
  function copy(text,idx){ navigator.clipboard.writeText(text); setCopiedIdx(idx); setTimeout(()=>setCopiedIdx(null),2000); }
  return (
    <div>
      <div style={{ background:T.amberDim, border:`1px solid ${T.amber}30`, borderRadius:10, padding:"14px 18px", marginBottom:22, display:"flex", gap:12, alignItems:"flex-start" }}>
        <span style={{ fontSize:18, flexShrink:0 }}>💡</span>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:T.amber, marginBottom:4 }}>Why it runs in Claude.ai, not directly here</div>
          <div style={{ fontSize:12, color:T.mutedLight, lineHeight:1.65 }}>
            GitHub Pages is a static site — browsers block direct API calls to Slack and Claude (CORS security). These prompts run natively in <strong style={{ color:T.textBright }}>Claude.ai</strong> where Slack MCP is a first-class integration.
          </div>
        </div>
      </div>
      <div style={{ marginBottom:22 }}>
        <div style={{ fontSize:11, color:T.mutedLight, fontFamily:"'DM Mono', monospace", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:14 }}>3 steps to get started</div>
        {[
          { n:"1", title:"Connect Slack to Claude.ai", desc:"claude.ai → Settings → Integrations → Connect Slack. Free account works." },
          { n:"2", title:"Open a new Claude conversation", desc:"Go to claude.ai and start a fresh chat." },
          { n:"3", title:"Paste a prompt, replace the channel name, press Enter", desc:"Claude reads your Slack channel live and returns a structured PM briefing." },
        ].map((s,i)=>(
          <div key={i} style={{ display:"flex", gap:14, marginBottom:14, alignItems:"flex-start" }}>
            <div style={{ width:28, height:28, borderRadius:"50%", flexShrink:0, background:T.accentDim, border:`1px solid ${T.accent}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:T.accent, fontFamily:"'DM Mono', monospace" }}>{s.n}</div>
            <div style={{ paddingTop:4 }}>
              <div style={{ fontSize:13, fontWeight:600, color:T.textBright, marginBottom:2 }}>{s.title}</div>
              <div style={{ fontSize:12, color:T.mutedLight, lineHeight:1.55 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:11, color:T.mutedLight, fontFamily:"'DM Mono', monospace", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12 }}>Copy a prompt → paste into Claude.ai</div>
      {slackPrompts.map((p,i)=>(
        <div key={i} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"14px 18px", marginBottom:10, position:"relative" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8, gap:10 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:T.textBright, marginBottom:1 }}>{p.label}</div>
              <div style={{ fontSize:11, color:T.mutedLight }}>{p.desc}</div>
            </div>
            <button onClick={()=>copy(p.prompt,i)} style={{ background:copiedIdx===i?T.accentDim:"transparent", border:`1px solid ${copiedIdx===i?T.accent:T.border}`, color:copiedIdx===i?T.accent:T.mutedLight, borderRadius:6, padding:"4px 11px", fontSize:11, fontFamily:"'DM Mono', monospace", fontWeight:700, letterSpacing:"0.06em", cursor:"pointer", transition:"all 0.2s", whiteSpace:"nowrap", flexShrink:0 }}>
              {copiedIdx===i?"✓ COPIED":"COPY"}
            </button>
          </div>
          <pre style={{ margin:0, fontSize:11, color:T.mutedLight, fontFamily:"'DM Mono', monospace", whiteSpace:"pre-wrap", lineHeight:1.7, background:T.surface, borderRadius:7, padding:"10px 12px" }}>{p.prompt}</pre>
        </div>
      ))}
      <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:`linear-gradient(135deg, ${T.accent}, ${T.coral})`, color:"#fff", borderRadius:10, padding:"13px 24px", fontSize:12, fontWeight:700, fontFamily:"'DM Mono', monospace", letterSpacing:"0.08em", textDecoration:"none", transition:"opacity 0.2s", marginTop:14 }}>
        OPEN CLAUDE.AI → RUN THESE PROMPTS LIVE ↗
      </a>
    </div>
  );
}

// ── MAIN APP ────────────────────────────────────────────────────
export default function PMHub() {
  const [dark, setDark]           = useState(true);
  const [activeTab, setActiveTab] = useState("playbook");
  const [search, setSearch]       = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [mounted, setMounted]     = useState(false);
  const searchRef = useRef(null);

  useEffect(()=>{ setTimeout(()=>setMounted(true), 80); },[]);

  // Keyboard shortcut: Cmd/Ctrl+K to focus search
  useEffect(()=>{
    function handler(e) {
      if((e.metaKey||e.ctrlKey) && e.key==="k") {
        e.preventDefault();
        setActiveTab("playbook");
        setTimeout(()=>searchRef.current?.focus(), 50);
      }
    }
    window.addEventListener("keydown", handler);
    return ()=>window.removeEventListener("keydown", handler);
  },[]);

  const T = dark ? DARK : LIGHT;

  const filtered = ALL_PROMPTS.filter(p => {
    const matchCat = activeCat==="all" || p.category===activeCat;
    const q = search.toLowerCase().trim();
    if(!q) return matchCat;
    return matchCat && (
      p.title.toLowerCase().includes(q) ||
      p.problem.toLowerCase().includes(q) ||
      p.tags.some(t=>t.includes(q)) ||
      p.categoryLabel.toLowerCase().includes(q)
    );
  });

  const catColor = (id) => id==="stakeholder" ? T.accent : id==="escalation" ? T.coral : id==="sprint" ? T.amber : T.accent;

  return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.text, fontFamily:"'Sora', sans-serif", transition:"background 0.3s, color 0.3s" }}>
      <style>{`
        html,body,#root{background:${T.bg}!important;margin:0;padding:0;min-height:100vh;transition:background 0.3s;}
        *,*::before,*::after{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;background:${T.bg};}
        ::-webkit-scrollbar-track{background:${T.bg};}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px;}
        ::-webkit-scrollbar-corner{background:${T.bg};}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
        .tab-btn:hover{color:${T.textBright}!important;background:${T.accentDim}!important;}
        .pain-btn:hover{background:${T.accentDim}!important;}
        textarea::placeholder{color:${T.muted};}
        textarea:focus{border-color:${T.accent}!important;outline:none;}
        input::placeholder{color:${T.muted};}
        input:focus{border-color:${T.accent}!important;outline:none;}
        a{transition:opacity 0.2s;}
        a:hover{opacity:0.82;}
      `}</style>

      <div style={{ maxWidth:940, margin:"0 auto", padding:"0 24px", position:"relative", zIndex:1 }}>

        {/* ── HEADER ── */}
        <div style={{
          display:"flex", justifyContent:"space-between", alignItems:"flex-start",
          paddingTop:48, paddingBottom:42,
          borderBottom:`1px solid ${T.border}`,
          opacity:mounted?1:0,
          animation:mounted?"fadeUp 0.5s ease both":"none",
          flexWrap:"wrap", gap:24,
        }}>
          <div style={{ flex:1, minWidth:260 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:T.accent, animation:"pulse 2s ease-in-out infinite" }} />
              <span style={{ fontSize:11, color:T.accent, fontFamily:"'DM Mono', monospace", letterSpacing:"0.14em", textTransform:"uppercase" }}>
                Delivery PM × AI Workflows
              </span>
            </div>
            <h1 style={{ fontFamily:"'Sora', sans-serif", fontSize:"clamp(46px,8vw,76px)", fontWeight:800, margin:"0 0 16px", lineHeight:0.92, letterSpacing:"-0.03em", color:T.white }}>
              PM<br/>
              <span style={{ background:`linear-gradient(135deg, ${T.accent}, ${T.coral})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>AI</span><br/>
              HUB
            </h1>
            <p style={{ fontSize:15, color:T.mutedLight, lineHeight:1.75, margin:"0 0 20px", maxWidth:420 }}>
              Practical AI workflows for Delivery PMs — paste your data, get a ready-to-run prompt, launch in one click. Built by <strong style={{ color:T.textBright }}>Nikhil Thomas A</strong>.
            </p>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
              <Chip color={T.accent}>Stakeholder</Chip>
              <Chip color={T.coral}>Escalation</Chip>
              <Chip color={T.amber}>Sprint</Chip>
            </div>
            <a href="https://www.linkedin.com/in/nikhil-thomas-a-58538117a/" target="_blank" rel="noopener noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:7, color:T.mutedLight, fontSize:12, textDecoration:"none", fontFamily:"'DM Mono', monospace", letterSpacing:"0.04em", border:`1px solid ${T.border}`, borderRadius:6, padding:"6px 12px", transition:"all 0.2s" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill={T.mutedLight}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
              Nikhil Thomas A
            </a>
          </div>

          {/* Stats + Dark mode toggle */}
          <div style={{ display:"flex", flexDirection:"column", gap:12, alignItems:"flex-end" }}>
            {/* Theme toggle */}
            <button onClick={()=>setDark(!dark)} style={{
              background:T.card, border:`1px solid ${T.border}`,
              borderRadius:8, padding:"7px 14px", cursor:"pointer",
              display:"flex", alignItems:"center", gap:8,
              color:T.mutedLight, fontSize:12,
              fontFamily:"'DM Mono', monospace", fontWeight:700,
              letterSpacing:"0.04em", transition:"all 0.2s",
            }}>
              {dark ? <>☀️ LIGHT MODE</> : <>🌙 DARK MODE</>}
            </button>

            {/* Stats card */}
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:"18px 22px", minWidth:190 }}>
              {[
                { n:"13", label:"Ready-to-use prompts", c:T.accent },
                { n:"3",  label:"PM pain point areas",  c:T.teal },
                { n:"4",  label:"Slack AI prompts",     c:T.amber },
                { n:"∞",  label:"Hours saved/week",     c:T.coral },
              ].map((s,i,arr)=>(
                <div key={i} style={{ paddingBottom:i<arr.length-1?12:0, marginBottom:i<arr.length-1?12:0, borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none" }}>
                  <div style={{ fontSize:23, fontWeight:800, color:s.c, fontFamily:"'Sora', sans-serif", lineHeight:1 }}>{s.n}</div>
                  <div style={{ fontSize:11, color:T.mutedLight, marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Keyboard hint */}
        <div style={{ display:"flex", justifyContent:"flex-end", padding:"8px 0 0", opacity:0.5 }}>
          <span style={{ fontSize:10, color:T.mutedLight, fontFamily:"'DM Mono', monospace" }}>
            Press <kbd style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:3, padding:"1px 5px", fontSize:10 }}>⌘K</kbd> to search prompts
          </span>
        </div>

        {/* ── TABS ── */}
        <div style={{ display:"flex", borderBottom:`1px solid ${T.border}`, marginBottom:28, marginTop:4 }}>
          {[{id:"playbook",label:"🎓 Prompt Playbook"},{id:"tools",label:"⚙️ Workflow Lab"},{id:"roadmap",label:"🗺️ Roadmap"}].map(tab=>(
            <button key={tab.id} className="tab-btn" onClick={()=>setActiveTab(tab.id)} style={{
              background:"none", border:"none",
              borderBottom:`2px solid ${activeTab===tab.id?T.accent:"transparent"}`,
              color:activeTab===tab.id?T.accent:T.mutedLight,
              padding:"12px 20px", fontSize:13, fontWeight:600,
              fontFamily:"'DM Mono', monospace", letterSpacing:"0.04em",
              cursor:"pointer", marginBottom:-1, transition:"all 0.2s",
            }}>{tab.label}</button>
          ))}
        </div>

        {/* ══ PLAYBOOK ══ */}
        {activeTab==="playbook" && (
          <div style={{ animation:"fadeUp 0.3s ease both" }}>
            {/* Search */}
            <div style={{ position:"relative", marginBottom:14 }}>
              <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:T.mutedLight, fontSize:14 }}>🔍</span>
              <input ref={searchRef} value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Search prompts — try 'escalation', 'retro', 'exec', 'release'…"
                style={{ width:"100%", background:T.card, border:`1px solid ${search?T.accent+"60":T.border}`, borderRadius:9, padding:"11px 40px", color:T.textBright, fontSize:13, fontFamily:"inherit", transition:"border-color 0.2s" }} />
              {search && (
                <button onClick={()=>setSearch("")} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:T.mutedLight, fontSize:16, cursor:"pointer", padding:"0 4px" }}>✕</button>
              )}
            </div>

            {/* Category filters */}
            <div style={{ display:"flex", gap:8, marginBottom:22, flexWrap:"wrap" }}>
              {CATEGORIES.map(cat=>(
                <button key={cat.id} className="pain-btn" onClick={()=>setActiveCat(cat.id)} style={{
                  background:activeCat===cat.id?`${catColor(cat.id)}10`:"transparent",
                  border:`1px solid ${activeCat===cat.id?catColor(cat.id):T.border}`,
                  borderRadius:8, padding:"7px 14px",
                  color:activeCat===cat.id?catColor(cat.id):T.mutedLight,
                  fontSize:12, fontWeight:600, fontFamily:"'DM Mono', monospace",
                  display:"flex", alignItems:"center", gap:6, transition:"all 0.2s",
                }}>
                  <span>{cat.emoji}</span><span>{cat.label}</span>
                  <span style={{ fontSize:10, opacity:0.65 }}>({ALL_PROMPTS.filter(p=>cat.id==="all"||p.category===cat.id).length})</span>
                </button>
              ))}
            </div>

            {/* Results */}
            {(search||activeCat!=="all") && (
              <div style={{ fontSize:12, color:T.mutedLight, fontFamily:"'DM Mono', monospace", marginBottom:14 }}>
                {filtered.length} prompt{filtered.length!==1?"s":""} found{search&&<span> for "<span style={{color:T.accent}}>{search}</span>"</span>}
              </div>
            )}

            {filtered.length>0
              ? filtered.map(p=><PromptCard key={p.id} prompt={p} T={T}/>)
              : (
                <div style={{ textAlign:"center", padding:"44px 0", color:T.mutedLight }}>
                  <div style={{ fontSize:32, marginBottom:12 }}>🔍</div>
                  <div style={{ fontSize:14, color:T.textBright, marginBottom:6 }}>No prompts match "{search}"</div>
                  <div style={{ fontSize:12 }}>Try: escalation, retro, exec, sprint, status, risk, release, meeting</div>
                  <button onClick={()=>{setSearch("");setActiveCat("all");}} style={{ marginTop:14, background:T.accentDim, border:`1px solid ${T.accent}30`, color:T.accent, borderRadius:7, padding:"8px 16px", fontSize:12, fontFamily:"'DM Mono', monospace", cursor:"pointer" }}>CLEAR SEARCH</button>
                </div>
              )
            }
          </div>
        )}

        {/* ══ TOOLS ══ */}
        {activeTab==="tools" && (
          <div style={{ animation:"fadeUp 0.3s ease both" }}>
            <div style={{ marginBottom:22 }}>
              <h2 style={{ fontFamily:"'Sora', sans-serif", fontSize:24, fontWeight:800, color:T.white, margin:"0 0 6px" }}>Workflow Lab</h2>
              <p style={{ color:T.mutedLight, fontSize:14, margin:0 }}>AI-powered workflows for Delivery PMs — run natively in Claude.ai with Slack connected.</p>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <span style={{ fontSize:20 }}>💬</span>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:15, fontWeight:700, color:T.white }}>Slack Channel Summariser</span>
                  <Chip color={T.teal} small>Run in Claude.ai</Chip>
                </div>
                <div style={{ fontSize:12, color:T.mutedLight, marginTop:2 }}>4 ready-to-use prompts — paste into Claude.ai with Slack MCP connected</div>
              </div>
            </div>
            <SlackHowTo T={T}/>
            <div style={{ marginTop:28 }}>
              <div style={{ fontSize:11, color:T.mutedLight, fontFamily:"'DM Mono', monospace", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12 }}>Coming Soon</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:12 }}>
                {[{emoji:"📋",name:"RAID Log Agent",desc:"Paste meeting notes — RAID log auto-populated and ready to share"},{emoji:"📊",name:"Status Report Bot",desc:"Connects to Jira + Slack, drafts your weekly report for approval"},{emoji:"🔥",name:"Escalation Triage",desc:"Classifies incidents by severity and routes to the right owner"}].map((t,i)=>(
                  <div key={i} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"18px", opacity:0.5 }}>
                    <div style={{ fontSize:22, marginBottom:10 }}>{t.emoji}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:T.textBright, marginBottom:5 }}>{t.name}</div>
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
            <div style={{ marginBottom:24 }}>
              <h2 style={{ fontFamily:"'Sora', sans-serif", fontSize:24, fontWeight:800, color:T.white, margin:"0 0 6px" }}>What's Being Built</h2>
              <p style={{ color:T.mutedLight, fontSize:14, margin:0 }}>This hub grows with real PM needs. Here's what's live, next, and planned.</p>
            </div>
            {ROADMAP.map((phase,pi)=>{
              const pc = pi===0?T.accent:pi===1?T.teal:T.amber;
              return (
                <div key={pi} style={{ marginBottom:26 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:pc, animation:pi===0?"pulse 1.8s ease-in-out infinite":"none", boxShadow:pi===0?`0 0 8px ${pc}`:"none" }}/>
                    <span style={{ fontSize:11, color:pc, fontFamily:"'DM Mono', monospace", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>{phase.phase}</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(250px, 1fr))", gap:12 }}>
                    {phase.items.map((item,ii)=>(
                      <div key={ii} style={{ background:T.card, border:`1px solid ${pi===0?pc+"30":T.border}`, borderRadius:10, padding:"15px 17px", opacity:pi===2?0.6:1 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
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
            <div style={{ background:T.accentDim, border:`1px dashed ${T.accent}30`, borderRadius:12, padding:"24px", marginTop:8 }}>
              <div style={{ display:"flex", gap:18, alignItems:"flex-start", flexWrap:"wrap" }}>
                <div style={{ flex:1, minWidth:220 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:T.textBright, marginBottom:6 }}>Built by Nikhil Thomas A</div>
                  <p style={{ color:T.mutedLight, fontSize:13, margin:"0 0 14px", lineHeight:1.65 }}>Delivery Program Manager exploring the intersection of AI and programme delivery. Every prompt here comes from a real problem — running sprints, managing stakeholders, handling escalations at 11pm.</p>
                  <a href="https://www.linkedin.com/in/nikhil-thomas-a-58538117a/" target="_blank" rel="noopener noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:7, background:T.accentDim, border:`1px solid ${T.accent}40`, color:T.accent, borderRadius:8, padding:"9px 16px", fontSize:12, fontWeight:700, fontFamily:"'DM Mono', monospace", letterSpacing:"0.06em", textDecoration:"none" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill={T.accent}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                    CONNECT ON LINKEDIN →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{ borderTop:`1px solid ${T.border}`, marginTop:52, padding:"20px 0", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
          <span style={{ fontFamily:"'Sora', sans-serif", fontSize:15, fontWeight:800, background:`linear-gradient(135deg, ${T.accent}, ${T.coral})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>PM AI Hub</span>
          <div style={{ display:"flex", gap:14, alignItems:"center" }}>
            <a href="https://www.linkedin.com/in/nikhil-thomas-a-58538117a/" target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:T.mutedLight, fontFamily:"'DM Mono', monospace", textDecoration:"none" }}>Nikhil Thomas A</a>
            <span style={{ fontSize:11, color:T.muted }}>·</span>
            <span style={{ fontSize:11, color:T.muted, fontFamily:"'DM Mono', monospace" }}>Powered by Claude</span>
          </div>
        </div>

      </div>
    </div>
  );
}
