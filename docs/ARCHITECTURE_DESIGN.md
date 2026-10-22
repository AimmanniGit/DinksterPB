# Dinkster: High-Level Architecture & System Design (A&D)

**Document Type:** High-Level System Architecture & Peer Review Brief  
**Author:** Achut Immani (Founder & Lead Architect)  
**Status:** Approved for Implementation (Sprint 1 Active)  
**Target Audience:** Engineering Leads, System Architects & Technical Advisors  

---

## 1. System Overview & Product Intent

Dinkster is a cross-platform social sports platform built specifically for pickleball. It solves the two biggest bottlenecks in amateur sports:
1. **The Discovery Bottleneck (Finding People):** Tinder-style swipe discovery based on DUPR skill rating, schedule availability, and proximity, supported by 2-hour court check-ins.
2. **The Operational Bottleneck (Playing & Scoring):** Real-time, multi-device on-court scoring across phones and the Apple Watch, backed by tournament desk management and AI-assisted scheduling.

### Architectural Boundary: The Two Audiences
Dinkster is divided into two distinct product surfaces to prevent feature bloat:

```mermaid
flowchart LR
    subgraph AUDIENCE_A["Audience A: Players & Coaches (Casual / Social)"]
        W1["Wing 1: Player Mobile App<br/>(iOS & Apple Watch)"]
    end

    subgraph AUDIENCE_B["Audience B: Organizers, Desks & Refs (Operational)"]
        W2["Wing 2: Court Desk Kiosk"]
        W3["Wing 3: Event Hosting & Regs"]
        W4["Wing 4: Agentic Copilot"]
    end

    W1 -.->|Permanent DK-XXXXX ID| AUDIENCE_B
    W1 -.->|Results & DUPR Queue| AUDIENCE_B
```

- **Player App (Wing 1):** Built exclusively for players and coaches. Tournament bracket trees, court calls, and administrative alerts are **strictly suppressed** from the mobile app to keep the user experience social, fast, and clean.
- **Organizer Platform (Wings 2, 3, 4):** A responsive web and tablet-kiosk application for tournament directors, court desk staff, and referees.

---

## 2. High-Level Architecture & Component Model

The system is organized as a unified monorepo running two decoupled, parallel runtime tracks:

```mermaid
flowchart TD
    subgraph REPO["Dinkster Monorepo (Workspaces)"]
        SHARED["@dinkster/shared<br/>• Pure TS Scoring Engine<br/>• Locked Types & IDs<br/>• 5 Visual Theme Palettes"]
        DB["@dinkster/database<br/>• Prisma Schema<br/>• PostgreSQL Migrations<br/>• Security Triggers"]
        MOBILE["apps/mobile (Track A)<br/>• React Native / Expo SDK 51<br/>• Swift / WatchKit Target<br/>• Firestore Client & Zustand"]
        WEB["apps/web (Track B)<br/>• Next.js 14 App Router<br/>• Tailwind CSS<br/>• Server Actions & Stripe"]

        SHARED --> MOBILE
        SHARED --> WEB
        DB --> WEB
    end

    subgraph CLOUD["Cloud & Infrastructure Tier"]
        subgraph GCP["Google Cloud & Firebase (Mobile Sync)"]
            FS["Firestore Native (nam5 Multi-Region)<br/>• Live Game Listeners (&lt;100ms)<br/>• Crew Chat & Swipes"]
            FBA["Firebase Auth (Email, Apple, Google)"]
            APN["Cloud Functions & APNs Push"]
        end

        subgraph SUPA["Supabase Cloud (Relational & Financial)"]
            PG["PostgreSQL 15 (ACID)<br/>• Tournaments & Divisions<br/>• Stripe Payments & Payouts<br/>• Audit ChangeLog"]
        end

        subgraph BUILD["Build & Deployment Pipeline"]
            EAS["Expo EAS Cloud<br/>• Compiles iOS & Watch binaries from Windows"]
            FAH["Firebase App Hosting<br/>• Next.js on Google Cloud Run & CDN"]
            GH["GitHub (AimmanniGit/DinksterPB)"]
        end
    end

    MOBILE <--> GCP
    MOBILE -.-> EAS
    WEB <--> SUPA
    WEB -.-> FAH
    GH --> EAS
    GH --> FAH
```

---

## 3. Technology Stack & Rationale

| Layer | Technology | Why Selected | Trade-offs Considered |
|---|---|---|---|
| **Mobile Client** | React Native (Expo SDK 51, TypeScript) | Single codebase targeting iOS and Android with near-native performance. | Native Swift was rejected to allow fast dual-platform updates. |
| **Watch Companion** | Swift / WatchKit via `@bacons/apple-targets` | Enables native wrist tap-to-score and Digital Crown undo over `WatchConnectivity`. | Standalone watch app deferred to Phase 2; uses phone as bridge. |
| **Mobile Realtime Data** | Cloud Firestore (`nam5` Multi-Region) | Sub-100ms document synchronization, offline caching on courts, native reactive listeners. | Supabase Realtime evaluated; Firestore chosen for proven mobile offline reliability. |
| **Web Platform** | Next.js 14 App Router + Tailwind CSS | Server-side rendering for SEO (public event pages) and fast client interactions for desk kiosks. | Vite SPA rejected due to lack of SEO for tournament landing pages. |
| **Relational Database** | PostgreSQL 15 via Supabase & Prisma ORM | Strict relational integrity, schema migrations, complex joins for tournament draws, and audit logging. | Firestore rejected for tournaments due to lack of multi-table ACID transactions. |
| **Payments** | Stripe Connect | Direct splits: entry fees go to organizers; 10% platform fee retained automatically. | Custom payment processor rejected for legal/payout compliance. |
| **Cloud Hosting (Web)** | Firebase App Hosting / Google Cloud Run | Consolidates all web, database, and auth billing under one Google Cloud account (`dinkster-pb`). | Vercel evaluated; Firebase chosen to avoid multi-vendor sprawl. |
| **CI / CD (Mobile)** | Expo Application Services (EAS Build) | Enables building native iOS and Apple Watch binaries from a Windows development environment. | Local Mac mini runner rejected in favor of zero-maintenance cloud workers. |

---

## 4. Core Domain Entities & Locked Conventions

```mermaid
classDiagram
    class User {
        +UUID id
        +String dinksterId "DK-XXXXX"
        +String displayName
        +Decimal duprRating
        +UserRole role
    }

    class Game {
        +String gameCode "D-XXXX"
        +MatchFormat format "singles | doubles"
        +GameMode mode "classic | dink"
        +Int targetScore "11 | 15"
        +Int bestOf "1 | 3"
        +ScoreState state
        +String hostId
    }

    class Tournament {
        +UUID id
        +String name
        +String slug
        +TournamentStatus status
        +Int platformFeeBps "1000 = 10%"
    }

    class Division {
        +UUID id
        +String name
        +DivisionFormat format
        +Decimal skillMin
        +Decimal skillMax
        +Int entryFeeCents
    }

    class Match {
        +UUID id
        +UUID tournamentId
        +MatchStatus status
        +Int rulesVersion
        +Int version "Optimistic Lock"
    }

    class MatchChangeLog {
        +UUID id
        +ActorType actorType "USER | COPILOT"
        +JSON before
        +JSON after
        +String reason
    }

    Tournament "1" --> "*" Division
    Division "1" --> "*" Match
    Match "1" --> "*" MatchChangeLog
    User "1" --> "*" Game
```

### Locked Product Directives
1. **Identity & Codes:**
   - Permanent Player ID: Strictly **`DK-XXXXX`** (e.g., `DK-X7K2P`).
   - Game Join Code: Strictly **`D-XXXX`** (e.g., `D-7741`), uppercase alphanumeric, typed into a standard OS keyboard (custom keypads prohibited).
   - Team Naming: Defaults to player initials (e.g., `"AJ & MR"` vs. `"JC & SK"`), editable inline by the host.
2. **Scoring Engine (`@dinkster/shared`):**
   - Traditional side-out scoring (point scored only when serving).
   - Doubles: Two-server rule (first team to serve starts on Server 2). Singles: Server continues until rally lost.
   - Deciding Set Side Switch: Switch ends when the first team reaches 6 points.
   - **Silent Host Override:** Host adjustments resolve scoring disputes silently without broadcast alerts to opponents.
3. **Dink Battle (Proprietary Pilot Variation):**
   - After the 5th shot of a rally, the court shrinks to half court. Dinks decide the point; lobs and deep drives land out.
   - Implemented as a configurable game mode flag (`GameMode.DINK_BATTLE`) in the engine.
4. **Copilot Guardrails (Wing 4):**
   - Tool tiers: `READ` &rarr; `PROPOSE` &rarr; `COMMIT`.
   - `COMPLETED` matches are strictly immutable (enforced by service layer and Postgres triggers).
   - All rule pivots (e.g., shortening pool matches to 9 during rain delays) compute projected finish deltas and log before/after snapshots to `MatchChangeLog`.

---

## 5. Security, Privacy & Integrity

1. **Check-In Privacy Mask:**
   - Court check-in requires geofence verification (within 500m of venue).
   - Exact coordinates are never stored or broadcast. Opponents see only `First Name + Last Initial` and DUPR rating.
   - Presence auto-expires via TTL after 2 hours.
2. **Score Precedence:**
   - `HOST_OVERRIDE` > `REFEREE` > `SELF_REPORTED` > `IMPORTED`. Lower authority cannot overwrite higher authority.
3. **Database Guardrails:**
   - Row-Level Security (RLS) policies isolate tournament organizer data.
   - Optimistic concurrency control via `Match.version` prevents race conditions during live score submissions.

---

## 6. Peer Review Checklist & Discussion Topics

For technical advisors and peer reviewers, the primary areas for evaluation are:

- [ ] **Dual-Database Strategy:** Is the split between Firestore (mobile presence, chat, live scores) and Supabase Postgres (tournaments, payments, audit logs) justified by the separation of audiences, or should it eventually be consolidated?
- [ ] **Apple Watch Connectivity:** Does relying on `WatchConnectivity` through the phone handle latency well on the court, or should direct WiFi/Cellular Watch websockets be prioritized for Phase 2?
- [ ] **Offline Resilience:** While casual play relies on local state with optimistic sync, should a dedicated local SQLite queue be introduced for tournament referee tablets in low-connectivity venues?
- [ ] **Dink Battle IP Protection:** Does keeping rule parameters in JSON config sufficiently isolate the pilot format while patent and trademark filings are underway?
