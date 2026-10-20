# Dinkster context export

Purpose: hand-off from the mockup and architecture work (Oct 2026) to the original Dinkster project. Paste section 0 into the project chat. Attach the zip.

Source tags: [project] from saved project notes. [session] stated by the founder in this work. [assumed] proposed default, needs founder confirmation. [verified] tested in a headless browser.

## 0. Paste-in summary

Dinkster is a pickleball-first social sports app. The core of the player app is a social loop: swipe to find people, match, chat, propose a game, play with a D code, score it, and sync to DUPR. Courts, the Benefits Aggregator, Coach/Player mode, and the Apple Watch support that loop. Dink Battle is a new play variation (court shrinks to half court after the 5th shot), planned as a pilot.

There are two audiences. The player app (Wing 1) is for players. The organizer platform (Wings 2, 3, 4: court desk, hosting and registration, adaptive copilot) is a separate web product for organizers. Organizer features are suppressed from the player app.

Timed matches are not part of Dinkster. Game codes use the `D-` prefix, for example `D-7741`. Player IDs stay `DK-XXXXX`. Mockups: mobile v6 and web v5. Current mobile mockup supersedes v3 and v4 in the project.

## 1. Core concept

| Item | Detail | Source |
|---|---|---|
| Product | Pickleball-first social sports app, iOS and Apple Watch | [project] |
| Core loop | Discover people, match, chat, propose a game, play, score, DUPR sync, play again | [session] |
| Differentiator 1 | Social discovery with swipe, built to get people playing together | [session] |
| Differentiator 2 | Benefits Aggregator (WellHub, ClassPass, Aetna and similar in one view) | [project] |
| Modes | Coach and Player mode changes Courts and Profile | [project] |
| Sports | Pickleball live, tennis Phase 2, badminton Phase 3 | [project] |

## 2. Audiences and products

| Product | Audience | Wings | Surface |
|---|---|---|---|
| Player app | Players, coaches | Wing 1 | Mobile (iOS first), Apple Watch, iPad layout |
| Organizer platform | Organizers, court desk staff, referees | Wings 2, 3, 4 | Web, tablet kiosk |

Decision [session]: Wings 2, 3, 4 are a different audience. They stay out of the player app. Player-side tournament registration, court calls, and rule-change alerts are removed from the player mockup.

Consequence to confirm: the earlier plan had the two products sharing one Match record. That is no longer required.

## 3. Player app spec (Wing 1)

Tabs in mockup v6: Discover, Play, Courts, Crew, Profile.

**Discover** [session]
- Swipe deck. Right means let's play. Left means pass. Star means stand out (shown first to them).
- Card: initials avatar, name, DUPR, distance, games played, verified, liked you, vibe tags, looking for, one prompt answer, why you match.
- Filters: All, Liked you, My level, Weekends, Singles, Doubles.
- Mutual like produces a match sheet: Propose a game, Say hi, Keep swiping.
- Open games mode: games forming nearby, request to join, start an open game.
- Social goal: meet 3 new players this week.
- Liked you list.

**Crew** [session]
- List of matches with state: new match, game proposed, game planned, played together.
- Chat with icebreaker chips.
- Propose a game: three time and place options, D code attached. Other side accepts. Accepted game opens the lobby with that player already in.
- Played together prompts Play again.

**Play** [project, v3 depth]
- Lobby: D code, player slots, guest without app, team names default to initials, Classic or Dink Battle, game to 11 or 15, 1 game or best of 3.
- Join: type the D code in a text field. The phone keyboard opens by itself. Accepts a pasted `D-7741`.
- Coin toss: heads or tails pick, winner chooses serve, receive, or side.
- Live score: set tabs, call-out, serve indicator, undo, side out, host override (silent to others), switch-ends prompt, stats, share by iMessage, AirDrop, QR.
- Apple Watch: tap to score, Digital Crown undo, complication, invite notification.

**Courts** [project]
- Find courts: map, Free, Indoor, Outdoor, Available now filters, claim a free court, book with slot prices, 10% platform fee, Apple Pay, Card, Link, confirmation ID, calendar invite, start lobby.
- Benefits: WellHub, ClassPass, Insurance eligible sessions by venue, notes on benefit rules.
- Coach mode: My sessions, rate, clients, availability, earnings.

**Profile** [project]
- Dinkster ID, DUPR verified, multi-sport rows with phase tags, memberships and balances, match history, coach profile, connects count.

**Copilot (player)** [session]
- Log a score from a text message, find a game, find a partner. Flags invalid finals such as 11-10.

**Dink Battle** [session]
- Play variation. After the 5th shot of a rally, the court shrinks to half court. Dinks decide the point. Lobs and hard shots land out.
- Mockup: shot counter, half court graphic, Out by button.
- Later: pilot tournament division on the organizer platform.

## 4. Organizer platform (Wings 2, 3, 4)

- Wing 3 Hosting: event page builder, divisions, registration, waiver, DUPR seeding, Stripe Connect split, refunds, sponsors with court naming.
- Wing 2 Court desk: court board, court calls, referee scorecard, kiosk mode, disputes, incidents.
- Wing 4 Copilot: draft a tournament from a sentence, rule pivots with preview and confirm, rollback, change log.
- Guardrails: never edit COMPLETED matches, overrides only on scheduled or pending, finish-time change shown before confirm, every change logged.
- Timed games removed. The copilot pivot demo shortens games to 9, win by 2.
- Mockup: web v5. Audience is organizer, desk, and referee.

## 5. Decisions

Locked before this work [project]:
1. Team names default to player initials, editable by host.
2. Singles and doubles from Phase 1.
3. Host override wins score disputes and is silent to others.
4. Singles: server keeps serving until they lose the point. Doubles: two-server rule.
5. Apple Watch is Phase 1.
6. Dinkster ID format `DK-XXXXX`.
7. Mockup first, then code.

New [session]:
1. Social swipe discovery is the core of the player app.
2. Organizer wings are suppressed from the player app.
3. No timed matches.
4. Game codes are `D-XXXX`. Join by typing, not a keypad.
5. Pickleball icon, not basketball style.
6. Dink Battle is a play variation and a future pilot tournament.
7. Offline sync is not a concern now.
8. Separate mockups for the mobile app and the web app.

Assumed, confirm [assumed]:
1. Player discovery moves from Phase 2 to Phase 1 (see section 6).
2. Switch ends when the first team reaches 6 (carried from v3).
3. Toss winner who picks a side gives first serve to the other team.
4. In best of 3, the first server alternates each set.
5. Matching is mutual like. Super match shows you first.
6. Original v3 fonts and palettes are the brand (restored in v5 and v6).

## 6. Roadmap impact

Project notes had player discovery in Phase 2 [project]. It is now core [session].

| Track | Phase | Scope |
|---|---|---|
| Player app | 1 | Social loop (Discover, Crew, propose), lobby, join by D code, toss, score, Watch, DUPR sync, Courts, Benefits |
| Player app | 2 | Tennis, payments depth, video, ladders |
| Player app | 3 | Badminton, coaching marketplace |
| Organizer platform | A | Wing 4 copilot core, schema, guardrails, evals |
| Organizer platform | B | Hosting, registration, Stripe split |
| Organizer platform | C | Court desk, referee, kiosk |
| Pilot | Later | Dink Battle division at one event |

The Phase 1 TestFlight items still open [project]: auth screens, profile with Dinkster ID, score tracker port, lobby and join screens in React Native. The social loop adds scope to Phase 1. Decide what moves out.

## 7. Technical status

Project stack [project]: React Native, Expo, TypeScript, Firebase and Firestore, GCP, TestFlight.

The backend recommendation changed during this work:
- Earlier recommendation: one Supabase Postgres backend for all wings, because players and organizers shared one Match record.
- Revised recommendation [assumed]: keep Firebase for the player app. Use Postgres for the organizer platform. Share only the Dinkster ID. No live bridge until a bridge is chosen.
- Reason: with the organizer wings suppressed from the player app, the shared record is not needed. The existing RN and Firebase scaffold stays valid, and Firestore and push notifications fit chat, matching, and live scores.
- `prisma/schema.prisma` in this package models the organizer platform. Its casual Match fields are not needed for the player app.

Founder decision needed: confirm the split backend or choose one backend.

Suggested player-app data (Firestore paths):
- `users/{uid}`: profile, DUPR, play style, vibe tags, looking for, prompt answer, availability, location area.
- `swipes/{uid}/targets/{targetUid}`: direction, super flag, time.
- `matches/{matchId}`: two uids, created time, state.
- `matches/{matchId}/messages/{id}`: sender, text, time.
- `matches/{matchId}/proposals/{id}`: time, place, D code, state.
- `openGames/{id}`: host, level, time, venue, slots, requests.
- `games/{gameId}`: code `D-XXXX`, sets, host, participants including guests with a name and no uid.
- Mutual-like detection and push notifications through Cloud Functions.

Safety for a swipe and chat product [assumed, medium confidence, verify against current App Store rules]: report and block, content filtering, rating-based visibility, approximate location only, age gating. Treat as Phase 1 requirements, not later.

## 8. Mockup inventory

| File | What it is | Status |
|---|---|---|
| dinkster-mobile-v6.html | Player app, social core, v3 depth, Dink Battle, iPad layout, Watch | [verified] clicked through, screenshots reviewed |
| dinkster-web-v5.html | Organizer, desk, referee, copilot | [verified] clicked through, screenshots reviewed |
| docs/ARCHITECTURE.md | Wings, copilot tiers, guardrails, roadmap | Updated for the audience split |
| docs/V3_V4_REVIEW.md | v3 audit, v4 defects, v5 fix log | Reference |
| prisma/schema.prisma | Organizer platform schema | Needs rework for the split (see section 7) |

Both mockups use the five v3 themes and v3 fonts. All data is mock and in memory. Nothing persists.

Not verified: D code keyboard on real iOS and Android devices. Font rendering (fonts did not load in test renders). Keyboard-only navigation. Real swipe gesture feel on a touch device.

Version history: v3 (project, casual play depth). v4 (added tournaments and copilot, drifted from v3 styling, defects). v5 (v3 palettes, fonts, data restored, v3 depth ported, defects fixed). v6 mobile (social core, organizer features removed from the player app). Web stays at v5.

## 9. Open questions for the founder

1. Backend: split (Firebase player, Postgres organizer) or one backend?
2. Confirm player discovery is Phase 1 and decide what moves to Phase 2.
3. Dink Battle rules: what counts as half court (shorter toward the net, one side, diagonal), how serve and the kitchen work after the shrink, how line calls work, whether the serve and return count as shots, scoring and game length.
4. Swipe style or a more conversation-first style: the mockup uses swipe with a prompt on each card and an icebreaker chat. Confirm.
5. Safety scope for swipe and chat in Phase 1.
6. `D-` game code and `DK-` player ID both stay. Confirm.
7. Switch-ends rule at 6 points.
8. Bridge between the two products later: wanted or not.

## 10. Next steps for the project Claude

1. Review this export and confirm section 5 assumptions and section 9 questions with the founder.
2. Update the React Native tab structure to Discover, Play, Courts, Crew, Profile.
3. Port the v6 mockup screens to React Native in this order: Discover and match, Crew chat and propose, lobby and D code join, score, courts.
4. Build the social backend and push notifications (section 7).
5. Rework the organizer schema if Postgres is confirmed. Remove casual Match fields.
6. Keep Dink Battle as a game type flag with rule values in config until the rules are settled.

## 11. IP note

The founder plans to trademark or patent Dink Battle. Public disclosure of a new format can affect patent rights in some countries. Confirm filing strategy with an IP attorney before sharing the rules or mockups outside the team. A trademark search is needed for the name. This is not legal advice.
