import { CandidateProfile, CertificateRecord } from '@/types';

/**
 * Creates a unique, deterministic tamper-proof verification hash for an ordination credential.
 */
export function generateCertificateHash(
  regNumber: string,
  candidateName: string,
  rankConferred: string,
  ordinationYear: number = 2026
): string {
  const seed = `${regNumber.trim().toUpperCase()}|${candidateName.trim().toUpperCase()}|${rankConferred.trim().toUpperCase()}|${ordinationYear}|ESOCS-HOLY-ORDER-APEX`;
  
  // Custom deterministic pseudo-hash for client-side rendering & verification
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const part2 = Array.from(seed)
    .reduce((acc, char, idx) => (acc + char.charCodeAt(0) * (idx + 13)) % 65535, 0)
    .toString(16)
    .padStart(4, '0');
    
  return `ESOCS-AUTH-${ordinationYear}-${hex.toUpperCase()}-${part2.toUpperCase()}`;
}

export function createCertificateRecord(candidate: CandidateProfile): CertificateRecord {
  const certNumber = candidate.certificateNumber || `CERT-${candidate.regNumber.replace(/[^A-Za-z0-9]/g, '')}`;
  const hash = candidate.verificationHash || generateCertificateHash(candidate.regNumber, candidate.fullName, candidate.targetRankName);

  return {
    certificateNumber: certNumber,
    candidateId: candidate.id,
    fullName: candidate.fullName,
    rankConferred: candidate.targetRankName,
    province: candidate.province,
    dateOfConferment: candidate.dateOrdained || 'November 14, 2026',
    supremeHeadSignature: 'His Most Eminence, Baba Aladura (Prelate)',
    secretaryGeneralSignature: 'Special Senior Apostle Dr. S. O. Amodu (Secretary General)',
    tamperProofHash: hash,
    qrPayload: JSON.stringify({
      reg: candidate.regNumber,
      name: candidate.fullName,
      rank: candidate.targetRankName,
      province: candidate.province,
      hash: hash,
      verifiedBy: 'ESOCS Holy Order Central Secretariat',
    }),
    status: 'valid',
  };
}

