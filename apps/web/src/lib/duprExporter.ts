// ==========================================
// Dinkster DUPR Tournament Results Exporter
// Generates official CSV & JSON payloads for direct submission
// to the DUPR (Dynamic Universal Pickleball Rating) platform.
// Maps internal DK-XXXXX records to sanctioned DUPR player IDs.
// ==========================================

export interface DuprMatchExportRecord {
  tournamentName: string;
  matchDate: string;
  divisionName: string;
  round: string;
  team1Player1Name: string;
  team1Player1DuprId: string;
  team1Player2Name?: string;
  team1Player2DuprId?: string;
  team2Player1Name: string;
  team2Player1DuprId: string;
  team2Player2Name?: string;
  team2Player2DuprId?: string;
  set1Score: string;
  set2Score?: string;
  set3Score?: string;
  winningTeam: 1 | 2;
}

/**
 * Generates an official DUPR-compatible CSV string from match records.
 */
export function generateDuprCsv(records: DuprMatchExportRecord[]): string {
  const headers = [
    'Tournament Name',
    'Match Date',
    'Division',
    'Round',
    'Team 1 Player 1 Name',
    'Team 1 Player 1 DUPR ID',
    'Team 1 Player 2 Name',
    'Team 1 Player 2 DUPR ID',
    'Team 2 Player 1 Name',
    'Team 2 Player 1 DUPR ID',
    'Team 2 Player 2 Name',
    'Team 2 Player 2 DUPR ID',
    'Set 1',
    'Set 2',
    'Set 3',
    'Winning Team',
  ];

  const escapeCsvField = (val?: string | number) => {
    if (val === undefined || val === null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = records.map((r) =>
    [
      r.tournamentName,
      r.matchDate,
      r.divisionName,
      r.round,
      r.team1Player1Name,
      r.team1Player1DuprId,
      r.team1Player2Name || '',
      r.team1Player2DuprId || '',
      r.team2Player1Name,
      r.team2Player1DuprId,
      r.team2Player2Name || '',
      r.team2Player2DuprId || '',
      r.set1Score,
      r.set2Score || '',
      r.set3Score || '',
      r.winningTeam === 1 ? 'Team 1' : 'Team 2',
    ]
      .map(escapeCsvField)
      .join(',')
  );

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Triggers a browser download of the generated CSV file.
 */
export function downloadDuprCsv(filename: string, csvContent: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
