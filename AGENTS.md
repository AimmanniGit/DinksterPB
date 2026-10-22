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

## 3. Identity & Code Conventions
- **Dinkster Player ID**: Format must strictly follow `DK-XXXXX`.
- **Game Join Code**: Format must strictly follow `D-XXXX` (entered via native uppercase text field, no custom keypads).
- **Team Names**: Default team names to player initials (e.g., `"AJ & MR"`), editable inline by the host.
- **Silent Host Override**: Host adjustments resolve scoring disputes silently without broadcast alerts to opponents.
- **Play Variations**: Support classic pickleball and Dink Battle pilot mode (court shrinks to half court after 5th shot).