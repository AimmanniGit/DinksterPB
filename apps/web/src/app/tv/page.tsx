'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TvBroadcastView } from '../../components/tv';
import {
  INITIAL_EVENT,
  INITIAL_COURTS,
  generateCourts,
  INITIAL_SPONSORS,
  generateInitialMatches,
  INITIAL_BRACKET_DATA,
} from '../../constants/initialState';
import { CourtDeskState, TournamentMatch, Sponsor } from '../../types/organizer';

function TvPageContent() {
  const searchParams = useSearchParams();
  const requestedMode = (searchParams.get('mode') || searchParams.get('stage') || searchParams.get('view')) as
    | 'jumbotron'
    | 'spotlight'
    | 'bracket'
    | 'cycle'
    | 'podium'
    | 'courts'
    | 'pools'
    | null;

  const [courts] = useState<CourtDeskState[]>(generateCourts(INITIAL_EVENT.totalCourts || 8, INITIAL_COURTS));
  const [matches] = useState<TournamentMatch[]>(generateInitialMatches());
  const [sponsors] = useState<Sponsor[]>(INITIAL_SPONSORS);

  return (
    <TvBroadcastView
      tournamentName={INITIAL_EVENT.name}
      venueName={INITIAL_EVENT.venue}
      courts={courts}
      matches={matches}
      sponsors={sponsors}
      bracketData={INITIAL_BRACKET_DATA}
      initialMode={requestedMode || 'jumbotron'}
    />
  );
}

export default function TvPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-bold">Loading TV Cast...</div>}>
      <TvPageContent />
    </Suspense>
  );
}
