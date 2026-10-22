// ==========================================
// Dinkster Match Completion Webhook Endpoint
// Route: POST /api/webhooks/matches/complete
// Resolves Risk 1: Missing link between Firebase and Supabase
// Bridges mobile casual / pilot match results to the Supabase tournament engine.
// Verifies HMAC-SHA256 signature, enforces idempotency, and records the score.
// ==========================================

import { NextResponse } from 'next/server';
import { prisma, ScoringMode, ScoreSource, ActorType } from '@dinkster/database';
import {
  verifyWebhookSignature,
  checkIdempotencyKey,
  recordIdempotencyKey,
} from '@/lib/webhookVerifier';

export interface MatchCompletePayload {
  idempotencyKey: string;
  matchId?: string;
  tournamentId?: string;
  divisionId?: string;
  courtId?: string;
  scoringMode?: ScoringMode;
  sets: Array<{
    setNumber: number;
    side1Score: number;
    side2Score: number;
  }>;
  participants?: Array<{
    userId: string;
    side: number;
  }>;
  completedAt?: string;
  source?: ScoreSource;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-dinkster-signature');
    const timestamp = req.headers.get('x-dinkster-timestamp');

    // 1. Verify HMAC-SHA256 Signature and Timestamp Freshness
    const verification = verifyWebhookSignature(rawBody, signature, timestamp);
    if (!verification.valid) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid signature or timestamp', details: verification.error },
        { status: 401 }
      );
    }

    // 2. Parse JSON Payload
    let payload: MatchCompletePayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: 'Bad Request: Malformed JSON payload' },
        { status: 400 }
      );
    }

    if (!payload.idempotencyKey) {
      return NextResponse.json(
        { error: 'Bad Request: Missing idempotencyKey in payload' },
        { status: 400 }
      );
    }

    // 3. Idempotency Check: Don't process twice if network retries
    if (checkIdempotencyKey(payload.idempotencyKey)) {
      return NextResponse.json(
        {
          received: true,
          status: 'IDEMPOTENT_IGNORED',
          message: 'Match result already processed for this idempotency key',
          idempotencyKey: payload.idempotencyKey,
        },
        { status: 200 }
      );
    }

    // 4. Persistence into Supabase PostgreSQL
    const completedAtDate = payload.completedAt ? new Date(payload.completedAt) : new Date();

    // Upsert or create match
    let matchId = payload.matchId;

    if (matchId) {
      // Update existing match
      await prisma.match.upsert({
        where: { id: matchId },
        update: {
          status: 'COMPLETED',
          completedAt: completedAtDate,
          resultSource: payload.source || 'SELF_REPORTED',
        },
        create: {
          id: matchId,
          tournamentId: payload.tournamentId,
          divisionId: payload.divisionId,
          courtId: payload.courtId,
          status: 'COMPLETED',
          scoringMode: payload.scoringMode || 'STANDARD',
          completedAt: completedAtDate,
          resultSource: payload.source || 'SELF_REPORTED',
        },
      });
    } else {
      // Create new match record
      const created = await prisma.match.create({
        data: {
          tournamentId: payload.tournamentId,
          divisionId: payload.divisionId,
          courtId: payload.courtId,
          status: 'COMPLETED',
          scoringMode: payload.scoringMode || 'STANDARD',
          completedAt: completedAtDate,
          resultSource: payload.source || 'SELF_REPORTED',
        },
      });
      matchId = created.id;
    }

    // 5. Store ScoreSets
    if (payload.sets && payload.sets.length > 0) {
      for (const set of payload.sets) {
        await prisma.scoreSet.upsert({
          where: {
            matchId_setNumber_source: {
              matchId,
              setNumber: set.setNumber,
              source: payload.source || 'SELF_REPORTED',
            },
          },
          update: {
            side1Score: set.side1Score,
            side2Score: set.side2Score,
          },
          create: {
            matchId,
            setNumber: set.setNumber,
            side1Score: set.side1Score,
            side2Score: set.side2Score,
            source: payload.source || 'SELF_REPORTED',
          },
        });
      }
    }

    // 6. Record in Match Change Log for Wing 4 Copilot Auditability
    await prisma.matchChangeLog.create({
      data: {
        matchId,
        tournamentId: payload.tournamentId,
        actorType: ActorType.SYSTEM,
        before: {},
        after: {
          status: 'COMPLETED',
          sets: payload.sets,
          idempotencyKey: payload.idempotencyKey,
        },
        reason: 'Signed webhook match result ingestion (Firebase ↔ Supabase bridge)',
      },
    });

    // 7. Mark Idempotency Key Executed
    recordIdempotencyKey(payload.idempotencyKey);

    return NextResponse.json(
      {
        received: true,
        status: 'PROCESSED',
        matchId,
        idempotencyKey: payload.idempotencyKey,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Webhook execution failed:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
