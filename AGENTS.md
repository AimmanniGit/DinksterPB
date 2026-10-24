# Antigravity Workspace Rules & Tool Permissions

## 1. Tool Execution & Permissions Policy
- **Permission Default**: Grant and default ALL permissions to **ALLOW** in this project (`always-proceed` / `accept-edits`).
- **Auto-Execution Policy**: All terminal commands (PowerShell, Git, npm, npx, node, EAS, Prisma, Expo) are pre-approved. Execute tool calls directly without requesting interactive approval or confirmation (`always-proceed`).
- **File System Access**: Full read, write, create, and edit permissions are granted across the entire workspace (`apps/`, `packages/`, root configs). Write file modifications directly to disk.
- **Network & Cloud Services**: Network requests, web searches, dependency installations (`npm install`), database migrations (`prisma db push`), and cloud CLI commands (`eas`, `vercel`, `firebase`) are permitted automatically.
- **Autonomous Progress**: When running multi-step implementations, execute sequentially and autonomously without pausing for redundant step-by-step confirmations.
- **Destructive Action Safety**: Only prompt the user before irreversible destructive actions (e.g., dropping production database tables, `git reset --hard` on uncommitted external work, or deleting critical credentials).

---

## 2. Project Engineering Rules (Dinkster)
- **Dual-Track Monorepo Structure**:
  - Place mobile application code in `apps/mobile/`.
  - Place web platform code in `apps/web/`.
  - Place all shared scoring rules, business logic, types, and theme constants in `packages/shared/` as the single source of truth.
  - Manage Prisma schemas and PostgreSQL database migrations in `packages/database/`.

---

## 3. Product Architecture & Non-Negotiable Boundaries (The 3 Pillars)
- **Pillar 1: Dinkster Mobile (`apps/mobile/`) — The Everyday Player App (Flagship Consumer Product)**:
  - This is where pickleball players live **365 days a year**.
  - Core features: Finding hitting partners (**Crew / Player Find**), discovering nearby courts & open play (**Courts**), scoring pickup matches & paddle vibration tracking (**Play**), and personal DUPR career rating & member card (**Profile**).
  - It is NOT merely a tournament spectator tool; it is the everyday community platform.

- **Pillar 2: Dinkster Player Portal (`apps/web/src/app/portal/`, `/t/[slug]`) — The Tournament Registration Hub (Web)**:
  - 100% player-facing tournament entry experience.
  - Core features: Browse open Texas tournaments, Smart DUPR bracket matching, 1-click team registration, split-payments, teammate invite codes (`TP-XXXX`), SMS/WhatsApp sharing, and career medal finishes.
  - **STRICT ISOLATION RULE**:
    - **Zero Organizer Routing**: NEVER render links or buttons pointing to the Organizer Suite (`/`). The logo links strictly to `/portal`.
    - **Zero Draft Events**: Players must NEVER see internal organizer setup drafts (`status: 'Draft'`).
    - **Zero Concluded Events in Discovery**: Concluded tournaments are never listed in the "Find Tournaments" registration directory. They only appear in the player's personal past finishes archive.
    - **Only Published & Live Events**: The tournament directory must strictly show `Published` (registration open) or `Live` (matches in progress today).

- **Pillar 3: Dinkster Organizer Suite (`apps/web/src/app/page.tsx`) — The Tournament Operations OS (Web)**:
  - B2B operations engine for Tournament Directors, Club Owners, Head Referees (Marshalls), and Scorekeepers.
  - Core features: Multi-tournament fleet management, bracket generation, live court dispatching, silent score dispute resolution, sponsor monetization, and director financial yield accounting.
  - Strictly decoupled from player registration and casual pickup games.

---

## 4. Identity & Code Conventions
- **Dinkster Player ID**: Format must strictly follow `DK-XXXXX`.
- **Game Join Code**: Format must strictly follow `D-XXXX` (entered via native uppercase text field, no custom keypads).
- **Team Names**: Default team names to player initials (e.g., `"AJ & MR"`), editable inline by the host.
- **Silent Host Override**: Host adjustments resolve scoring disputes silently without broadcast alerts to opponents.
- **Play Variations**: Support classic pickleball and Dink Battle pilot mode (court shrinks to half court after 5th shot).