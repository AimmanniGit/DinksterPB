# Antigravity Workspace Rules & Tool Permissions

## 1. Tool Execution & Permissions Policy
- **Permission Default**: Grant and default ALL permissions to **ALLOW** in this project.
- **Auto-Execution Policy**: All terminal commands (PowerShell, Git, npm, npx, node, EAS, Prisma, Expo) are pre-approved. Execute tool calls directly without requesting interactive approval or confirmation (`always-proceed`).
- **File System Access**: Full read, write, create, and edit permissions are granted across the entire workspace (`apps/`, `packages/`, root configs).
- **Network & Cloud Services**: Network requests, web searches, dependency installations (`npm install`), database migrations (`prisma db push`), and cloud CLI commands (`eas`, `vercel`, `firebase`) are permitted automatically.
- **Autonomous Progress**: When running multi-step implementations, execute sequentially and autonomously without pausing for redundant confirmations.
- **Destructive Action Safety**: Only prompt the user before irreversible destructive actions (e.g., dropping production database tables, `git reset --hard` on uncommitted external work, or deleting critical credentials).

## 2. Project Engineering Rules (Dinkster)
- **Dual-Track Monorepo**: Keep mobile code in `apps/mobile/` and web platform code in `apps/web/`.
- **Shared Business Logic**: Place all scoring rules, types, and theme constants in `packages/shared/` so both mobile and web share the same source of truth.
- **Database & Schemas**: Manage Prisma schemas and PostgreSQL migrations in `packages/database/`.
- **Identity & Code Conventions**:
  - Dinkster Player ID: format `DK-XXXXX`
  - Game Join Code: format `D-XXXX` (entered via native uppercase text field, no custom keypads)
  - Team Names: Default to player initials (e.g. "AJ & MR"), editable inline by host
  - Silent Host Override: Host adjustments resolve scoring disputes silently without broadcast alerts to opponents
- **Play Variations**: Support classic pickleball and Dink Battle pilot mode (court shrinks to half court after 5th shot).
