# PM AI Hub

> Practical AI workflows for Delivery Program Managers — built by someone who has run real standups, written real escalations, and sat through more sprint retros than they'd like to admit.

🌐 **Live site:** [nikhil-thomas-a.github.io/pm-ai-hub](https://nikhil-thomas-a.github.io/pm-ai-hub)

---

## Why This Exists

Most AI tools are built *for* developers, *by* developers. The PM experience is an afterthought — generic prompts, abstract use cases, no grounding in delivery reality.

This is different. Every prompt, tool, and case study here was designed for **the actual problems a Delivery PM faces**: mid-sprint escalations, stakeholder reporting under pressure, delivery risk conversations with leadership, and retros that need to uncover root causes without turning into blame sessions.

---

## What's Inside

### Prompt Playbook

Copy-paste prompts for the three highest-leverage PM pain points:

| Category | What It Solves | Time Saved |
|---|---|---|
| **Stakeholder Reporting** | Turns raw sprint data into exec-ready updates | ~45 min/week |
| **Escalation & Incidents** | Drafts escalations and post-mortems under pressure | ~30 min/incident |
| **Sprint & Delivery Tracking** | Spots risks early, surfaces patterns across retros | ~1 hr/sprint |

Each prompt includes the exact text, difficulty level, time estimate, pro tips, and a step-by-step guide.

---

### Workflow Lab

Live AI-powered tools PMs can use right now:

**Slack Summariser**
Reads a Slack channel dump and extracts:
- Active blockers (with owner if mentioned)
- Decisions made
- Action items with due dates
- Escalation candidates

*Powered by Claude API + Slack MCP integration.*

---

### Case Study Journal

Real delivery problems, exact prompts used, measurable outcomes.

#### Case Study 1 — Sprint Risk Escalation (Hypothetical)
**Situation:** Sprint day 6. Three stories blocked on a third-party API. Stakeholder expecting demo in 4 days.

**Prompt used:** PM AI Hub escalation template (30-second draft)

**Output:** Structured escalation email drafted in under 2 minutes, covering: impact summary, root cause, options considered, recommended path, and ask.

**Time saved vs. manual drafting:** ~25 minutes. More importantly — sent within 10 minutes of identifying the issue, not 2 hours later after agonising over wording.

---

#### Case Study 2 — Retro Insight Extraction
**Situation:** 6-sprint retrospective data sitting in Miro. Need to find systemic patterns before quarterly planning.

**Prompt used:** Pattern extraction prompt from Playbook

**Output:** Claude identified 3 recurring themes across 6 retros (dependency delays, unclear acceptance criteria, insufficient testing time), ranked by frequency and severity.

**Time saved:** ~3 hours of manual synthesis → 8-minute prompt session.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| AI | Claude API (Anthropic — claude-sonnet) |
| Integration | Slack MCP |
| CI/CD | GitHub Actions → GitHub Pages |
| Hosting | GitHub Pages |

---

## Run Locally

```bash
git clone https://github.com/nikhil-thomas-a/pm-ai-hub.git
cd pm-ai-hub
npm install
npm run dev
```

Open `http://localhost:5173`

No API key needed for browsing — AI features require a Claude API key set as `VITE_CLAUDE_API_KEY` in `.env`.

---

## Roadmap

- [ ] **Risk radar** — paste sprint data, get a structured risk assessment
- [ ] **Retro analyser** — upload retro notes, get recurring themes + action items
- [ ] **AI training explainer** — plain-English guide to SFT, RLHF, RLEF, and eval metrics (Pass@K, HumanEval) for PMs working with AI teams
- [ ] **Delivery health score** — weekly programme health score from Jira data

---

## Built By

**Nikhil Thomas A** — Delivery Program Manager exploring the intersection of AI and programme delivery.

[LinkedIn](https://www.linkedin.com/in/nikhil-thomas-a-58538117a/) · [Data Portfolio](https://github.com/nikhil-thomas-a/data-portfolio) · [AI Training Playbook](https://github.com/nikhil-thomas-a/ai-training-playbook)
