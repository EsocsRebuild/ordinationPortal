import { CandidateProfile } from '@/types';

export function exportCandidatesToCSV(candidates: CandidateProfile[], filename = 'ESOCS-Ordination-Roster-2026.csv') {
  const headers = [
    'Reg Number',
    'Full Name',
    'Gender',
    'Province',
    'District',
    'Parish',
    'Current Rank',
    'Target Rank',
    'Stage',
    'Theology Score',
    'Interview Score',
    'Dues Status',
    'Seat Number',
    'Certificate Number',
    'Verification Hash',
  ];

  const rows = candidates.map((c) => [
    `"${c.regNumber}"`,
    `"${c.fullName}"`,
    `"${c.gender}"`,
    `"${c.province}"`,
    `"${c.district}"`,
    `"${c.parish}"`,
    `"${c.currentRank}"`,
    `"${c.targetRankName}"`,
    `"${c.stage}"`,
    `"${c.theologyScore ?? 'N/A'}"`,
    `"${c.interviewScore ?? 'N/A'}"`,
    `"${c.duesStatus}"`,
    `"${c.seatNumber ?? 'Unassigned'}"`,
    `"${c.certificateNumber ?? 'Pending'}"`,
    `"${c.verificationHash ?? 'N/A'}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

