'use client';

import React, { useState } from 'react';
import { TvBroadcastView } from '../../components/tv';
import {
  INITIAL_EVENT,
  INITIAL_COURTS,
  generateCourts,
  INITIAL_SPONSORS,
  generateInitialMatches,
} from '../../constants/initialState';
import { CourtDeskState, TournamentMatch, Sponsor } from '../../types/organizer';

export default function TvPage() {
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
    />
  );
}
