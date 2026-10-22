// ==========================================
// Dinkster Tenant-Scoped Tournaments API Endpoint
// Route: GET, POST /api/v1/tournaments
// Combines Risk 2 (BFF Firebase Auth Bridge) & Risk 3 (Prisma Tenant Isolation)
// Guarantees an organizer can NEVER view or mutate another tenant's tournaments.
// ==========================================

import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { createTenantClient, TenantIsolationError } from '@dinkster/database';

export async function GET(req: Request) {
  // 1. Authenticate Firebase Auth token & resolve Postgres identity (Risk 2)
  const authResult = await authenticateRequest(req);
  if (!authResult.authenticated || !authResult.user) {
    return NextResponse.json(
      { error: authResult.error || 'Unauthorized' },
      { status: authResult.statusCode || 401 }
    );
  }

  try {
    // 2. Initialize Tenant-Scoped Prisma Client with verified Organizer ID (Risk 3)
    const tenantDb = createTenantClient(authResult.user.id);

    // 3. Query automatically scoped to organizerId
    const tournaments = await tenantDb.tournament.findMany({
      include: {
        divisions: {
          select: {
            id: true,
            name: true,
            format: true,
            scoringMode: true,
            entryFeeCents: true,
          },
        },
        _count: {
          select: {
            matches: true,
            sponsors: true,
            incidents: true,
          },
        },
      },
      orderBy: { startsAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      organizer: {
        dinksterId: authResult.user.dinksterId,
        displayName: authResult.user.displayName,
      },
      tournaments,
    });
  } catch (error: any) {
    if (error instanceof TenantIsolationError) {
      return NextResponse.json(
        { error: 'Tenant Isolation Violation', details: error.message },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const authResult = await authenticateRequest(req);
  if (!authResult.authenticated || !authResult.user) {
    return NextResponse.json(
      { error: authResult.error || 'Unauthorized' },
      { status: authResult.statusCode || 401 }
    );
  }

  try {
    const body = await req.json();
    const { name, slug, startsAt, endsAt, platformFeeBps } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Bad Request: name and slug are required' },
        { status: 400 }
      );
    }

    const tenantDb = createTenantClient(authResult.user.id);

    // Creates tournament guaranteed to belong to this organizer
    const tournament = await tenantDb.tournament.create({
      data: {
        organizerId: authResult.user.id,
        name,
        slug,
        startsAt: startsAt ? new Date(startsAt) : new Date(),
        endsAt: endsAt ? new Date(endsAt) : new Date(Date.now() + 86400000),
        platformFeeBps: platformFeeBps ?? 1000,
      },
    });

    return NextResponse.json({ success: true, tournament }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Tournament Creation Failed', message: error.message },
      { status: 500 }
    );
  }
}
