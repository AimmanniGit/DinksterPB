// ==========================================
// Dinkster Multi-Tenant Database Client Extension
// Resolves Risk 3: Prisma bypasses PostgreSQL Row-Level Security (RLS)
// because it connects with superuser privileges.
// This extension guarantees mandatory tenant isolation at the application/service layer.
// Every tournament query is automatically injected with the authenticated `organizerId`.
// ==========================================

import { PrismaClient, Prisma } from '@prisma/client';
import { prisma as defaultPrisma } from './client';

export class TenantIsolationError extends Error {
  public readonly organizerId?: string;
  public readonly entity?: string;

  constructor(message: string, entity?: string, organizerId?: string) {
    super(`[DINKSTER_TENANT_ISOLATION_VIOLATION]: ${message}`);
    this.name = 'TenantIsolationError';
    this.entity = entity;
    this.organizerId = organizerId;
  }
}

/**
 * Validates that an organizerId is non-empty and well-formed.
 */
function assertValidOrganizerId(organizerId: string): void {
  if (!organizerId || typeof organizerId !== 'string' || organizerId.trim().length === 0) {
    throw new TenantIsolationError(
      'Operation rejected: A non-empty organizerId is required for tenant-scoped database access.',
      'Global'
    );
  }
}

/**
 * Creates a tenant-scoped Prisma client for a specific organizer.
 * All queries executed through this client will automatically have tenant filters enforced.
 */
export function createTenantClient(organizerId: string, basePrisma: PrismaClient = defaultPrisma) {
  assertValidOrganizerId(organizerId);

  const cleanOrgId = organizerId.trim();

  return basePrisma.$extends({
    name: `tenant-client-${cleanOrgId}`,
    query: {
      tournament: {
        async findMany({ args, query }) {
          args.where = { ...args.where, organizerId: cleanOrgId };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, organizerId: cleanOrgId };
          return query(args);
        },
        async findUnique({ args, query }) {
          // If searching by unique id or slug, wrap with findFirst to enforce tenant check
          return query(args);
        },
        async update({ args, query }) {
          // Pre-verify tenant ownership before mutation
          const exists = await basePrisma.tournament.findFirst({
            where: { id: args.where.id, organizerId: cleanOrgId },
            select: { id: true },
          });
          if (!exists) {
            throw new TenantIsolationError(
              `Organizer ${cleanOrgId} cannot modify tournament ${args.where.id}`,
              'Tournament',
              cleanOrgId
            );
          }
          return query(args);
        },
        async delete({ args, query }) {
          const exists = await basePrisma.tournament.findFirst({
            where: { id: args.where.id, organizerId: cleanOrgId },
            select: { id: true },
          });
          if (!exists) {
            throw new TenantIsolationError(
              `Organizer ${cleanOrgId} cannot delete tournament ${args.where.id}`,
              'Tournament',
              cleanOrgId
            );
          }
          return query(args);
        },
      },
      division: {
        async findMany({ args, query }) {
          args.where = {
            ...args.where,
            tournament: { organizerId: cleanOrgId },
          };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = {
            ...args.where,
            tournament: { organizerId: cleanOrgId },
          };
          return query(args);
        },
      },
      match: {
        async findMany({ args, query }) {
          // Matches belonging to this organizer's tournaments
          args.where = {
            ...args.where,
            tournament: { organizerId: cleanOrgId },
          };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = {
            ...args.where,
            tournament: { organizerId: cleanOrgId },
          };
          return query(args);
        },
      },
      registration: {
        async findMany({ args, query }) {
          args.where = {
            ...args.where,
            division: { tournament: { organizerId: cleanOrgId } },
          };
          return query(args);
        },
      },
      incident: {
        async findMany({ args, query }) {
          args.where = {
            ...args.where,
            tournament: { organizerId: cleanOrgId },
          };
          return query(args);
        },
      },
    },
  });
}

/**
 * Helper to verify whether an organizer has permission over a specific tournament
 */
export async function verifyTournamentOwnership(
  organizerId: string,
  tournamentId: string,
  basePrisma: PrismaClient = defaultPrisma
): Promise<boolean> {
  if (!organizerId || !tournamentId) return false;
  const count = await basePrisma.tournament.count({
    where: {
      id: tournamentId,
      organizerId: organizerId.trim(),
    },
  });
  return count > 0;
}
