import { ESOCS_RANKS } from '@/lib/constants';
import { EcclesiasticalRank, Gender, MandatoryLevyBreakdown } from '@/types';

export function getRankById(rankId: string): EcclesiasticalRank | undefined {
  return ESOCS_RANKS.find((r) => r.id === rankId);
}

export function getRankByName(name: string): EcclesiasticalRank | undefined {
  if (!name) return undefined;
  const clean = name.trim().toLowerCase();

  // 1. Exact Name match
  const exact = ESOCS_RANKS.find((r) => r.name.toLowerCase() === clean);
  if (exact) return exact;

  // 2. Exact ID match
  const byId = ESOCS_RANKS.find((r) => r.id.toLowerCase() === clean);
  if (byId) return byId;

  // 3. Match without parenthetical color badge (e.g. "Apostle" matches "Apostle (White)")
  const cleanNoParen = clean.replace(/\s*\(.*?\)\s*/g, '').trim();
  const parenMatch = ESOCS_RANKS.find(
    (r) => r.name.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim() === cleanNoParen
  );
  if (parenMatch) return parenMatch;

  // 4. Substring fallback
  return ESOCS_RANKS.find(
    (r) =>
      r.name.toLowerCase().includes(clean) ||
      clean.includes(r.name.toLowerCase())
  );
}

export interface RankValidationResult {
  isValid: boolean;
  targetRank?: EcclesiasticalRank;
  expectedNextRank?: EcclesiasticalRank;
  allowedNextRanks: EcclesiasticalRank[];
  errorReason?: string;
  tenureYears: number;
  meetsTenure: boolean;
  tenureWarning?: string;
  levyBreakdown?: MandatoryLevyBreakdown;
}

/**
 * Strict canonical hierarchy validation preventing rank skipping.
 * Example: Pastor -> Next must be Evangelist. If Apostle is selected, returns isValid: false with canonical explanation.
 */
export function validateRankProgression(
  currentRankName: string,
  targetRankName: string,
  gender: Gender = 'male',
  currentRankYear: number = 2022,
  currentYear: number = 2026
): RankValidationResult {
  const currentRank = getRankByName(currentRankName);
  const targetRank = getRankByName(targetRankName);
  const tenureYears = Math.max(0, currentYear - (currentRankYear || currentYear));

  // Determine allowed next ranks for this candidate based on gender and sequential orderLevel + 1
  const allowedNextRanks: EcclesiasticalRank[] = [];

  for (const rank of ESOCS_RANKS) {
    if (rank.genderEligibility !== 'both' && rank.genderEligibility !== gender) {
      continue;
    }

    if (currentRank) {
      // Must be exactly the immediate next level (orderLevel + 1)
      if (rank.orderLevel === currentRank.orderLevel + 1) {
        allowedNextRanks.push(rank);
      }
    } else if (rank.orderLevel === 1) {
      // Foundational entry level from Brother / Sister
      allowedNextRanks.push(rank);
    }
  }

  const expectedNextRank = allowedNextRanks[0];

  // If target rank is not found
  if (!targetRank) {
    return {
      isValid: false,
      expectedNextRank,
      allowedNextRanks,
      errorReason: 'Please select a valid target ordination rank recognized by the Holy Order.',
      tenureYears,
      meetsTenure: false,
    };
  }

  // Gender check
  if (targetRank.genderEligibility !== 'both' && targetRank.genderEligibility !== gender) {
    return {
      isValid: false,
      targetRank,
      expectedNextRank,
      allowedNextRanks,
      errorReason: `The rank of "${targetRank.name}" is restricted to ${
        targetRank.genderEligibility === 'male' ? 'Brethren (Male Order)' : 'Sisters (Female Order)'
      }.`,
      tenureYears,
      meetsTenure: false,
    };
  }

  // Canonical Order Level Comparison
  if (currentRank) {
    // 1. Trying to select same or lower rank
    if (targetRank.orderLevel <= currentRank.orderLevel) {
      return {
        isValid: false,
        targetRank,
        expectedNextRank,
        allowedNextRanks,
        errorReason: `Canonical Error: "${targetRank.name}" is not an elevation from your current rank of "${currentRank.name}".`,
        tenureYears,
        meetsTenure: false,
      };
    }

    // 2. Trying to SKIP ranks (Jumping order level > current + 1)
    if (targetRank.orderLevel > currentRank.orderLevel + 1) {
      return {
        isValid: false,
        targetRank,
        expectedNextRank,
        allowedNextRanks,
        errorReason: `Canonical Hierarchy Violation: As "${currentRank.name}", your canonical next rank is "${
          expectedNextRank?.name || 'the next immediate order'
        }". Direct ascension to "${targetRank.name}" without serving as "${
          expectedNextRank?.name || 'intermediate rank'
        }" is strictly prohibited by ESOCS Holy Order constitution.`,
        tenureYears,
        meetsTenure: false,
      };
    }

    // 3. Minimum Tenure in Current Rank Check
    const requiredYears = targetRank.minimumYearsInCurrentRank || 3;
    const meetsTenure = tenureYears >= requiredYears;
    const tenureWarning = !meetsTenure
      ? `Tenure Flag: "${targetRank.name}" requires a minimum of ${requiredYears} years of active service in current rank "${currentRank.name}" (Your recorded tenure: ${tenureYears} years since ${currentRankYear}). Requires special Provincial dispensation attestation.`
      : undefined;

    return {
      isValid: true,
      targetRank,
      expectedNextRank,
      allowedNextRanks,
      tenureYears,
      meetsTenure,
      tenureWarning,
      levyBreakdown: targetRank.levyBreakdown,
    };
  }

  return {
    isValid: true,
    targetRank,
    expectedNextRank,
    allowedNextRanks,
    tenureYears,
    meetsTenure: true,
    levyBreakdown: targetRank.levyBreakdown,
  };
}

export function getEligibleNextRanks(
  currentRankName: string,
  gender: Gender,
  yearsInRank: number
): { eligibleRanks: EcclesiasticalRank[]; ineligibleReasons: Record<string, string> } {
  const currentRank = getRankByName(currentRankName);
  const eligibleRanks: EcclesiasticalRank[] = [];
  const ineligibleReasons: Record<string, string> = {};

  for (const rank of ESOCS_RANKS) {
    // Gender check
    if (rank.genderEligibility !== 'both' && rank.genderEligibility !== gender) {
      ineligibleReasons[rank.id] = `Rank restricted to ${rank.genderEligibility === 'male' ? 'Brethren (Male)' : 'Sisters (Female)'}`;
      continue;
    }

    // Prerequisite check
    if (currentRank) {
      if (rank.orderLevel <= currentRank.orderLevel) {
        ineligibleReasons[rank.id] = `Current rank is higher or equal to this rank`;
        continue;
      }
      if (rank.orderLevel > currentRank.orderLevel + 1) {
        ineligibleReasons[rank.id] = `Must attain intermediate rank of ${rank.prerequisiteRankName || 'prior level'} first`;
        continue;
      }
      if (yearsInRank < rank.minimumYearsInCurrentRank) {
        ineligibleReasons[rank.id] = `Requires minimum ${rank.minimumYearsInCurrentRank} years in ${currentRank.name} (Current: ${yearsInRank} yrs)`;
        continue;
      }
    }

    eligibleRanks.push(rank);
  }

  return { eligibleRanks, ineligibleReasons };
}

export function getRobingSpecifications(rankId: string): {
  vestmentColor: string;
  stoleType: string;
  capOrCrown: string;
  insigniaNotes: string;
} {
  const rank = getRankById(rankId) || getRankByName(rankId);
  if (!rank) {
    return {
      vestmentColor: 'Pure White Linen Sacred Robe with Golden Trim',
      stoleType: 'Standard Liturgical Stole',
      capOrCrown: 'Holy Order Prayer Cap',
      insigniaNotes: 'Standard altar ministrant prayer vestments.',
    };
  }

  // Specific canonical robing specifications for the exact ranks
  switch (rank.id) {
    case 'rank_supervising_apostle_general_green':
    case 'rank_apostle_general_green':
      return {
        vestmentColor: 'Apex Patriarchal Emerald Green & Royal Gold Robe with Velvet Cuffs',
        stoleType: 'Supreme Apex Green Stole with Embroidered Seven Golden Stars and Golden Tassels',
        capOrCrown: 'Supreme High Priest Mitre with Gold Plated Star Emblem',
        insigniaNotes: 'Authorized to carry the Supreme Patriarchal Holy Staff, Sacred Seal, and Synod Ring.',
      };

    case 'rank_special_senior_apostle_blue':
      return {
        vestmentColor: 'Royal Blue Velvet & Ivory Brocade Robe with Gold Piping',
        stoleType: 'Royal Blue Velvet Stole with Cross of Glory and Seven Golden Stars',
        capOrCrown: 'Provincial Bishopric Blue Velvet Biretta with Gold Crest',
        insigniaNotes: 'Authorized for Provincial Synod Throne, Pastoral Episcopal Staff, and Golden Seal.',
      };

    case 'rank_senior_apostle_yellow':
      return {
        vestmentColor: 'Gold-Yellow Damask Robe with White Satin Trim & Gold Cuffs',
        stoleType: 'Yellow / Gold Bishopric Stole with Golden Cross Embroidery',
        capOrCrown: 'Senior Elder Yellow & Gold Mitre / Biretta',
        insigniaNotes: 'Authorized for District Governance, Pastoral Staff, and Altar Consecration.',
      };

    case 'rank_super_apostle_pink':
      return {
        vestmentColor: 'Pure White Robe with Ceremonial Pink Velvet Border & Gold Trim',
        stoleType: 'Pink Liturgical Satin Stole with Embroidered Cross of Zion',
        capOrCrown: 'Apostolic Pink & Gold Prayer Cap',
        insigniaNotes: 'Authorized for Zonal Sanctuary Oversight and Laying of Hands.',
      };

    case 'rank_apostle_white':
      return {
        vestmentColor: 'Pure White Sacred Linen Robe with Gold Fringe',
        stoleType: 'White Liturgical Silk Stole with Golden Cross Embroidery',
        capOrCrown: 'Cherubim & Seraphim Apostolic White Crown Cap',
        insigniaNotes: 'Foundational Apostolic Pillar, authorized for Sanctuary Administration.',
      };

    case 'rank_special_senior_mother_in_israel':
      return {
        vestmentColor: 'Imperial Crimson Robe with Royal Gold Brocade & Velvet Cuffs',
        stoleType: 'Apex Matriarchal Embroidered Crimson & Gold Stole with Seven Stars',
        capOrCrown: 'Grand Matriarch Crown with Golden Crest & Pearl Trimmings',
        insigniaNotes: 'Advisory Board High Dignitary, Custodian of Holy Ordinances and Supreme Matron Council.',
      };

    case 'rank_senior_mother_in_israel':
      return {
        vestmentColor: 'Crimson Velvet & White Satin Robe with Gold Borders',
        stoleType: 'Senior Matron Crimson & Gold Stole',
        capOrCrown: 'Senior Matriarch Embroidered Crown',
        insigniaNotes: 'Provincial Matron Leadership, Custodian of Spiritual Altars & Holy Mount Vigils.',
      };

    case 'rank_mother_in_israel':
      return {
        vestmentColor: 'Bishopric Purple Robe with Satin Trim and Gold Embroidery',
        stoleType: 'Purple & Gold Cross-Woven Matriarchal Stole',
        capOrCrown: 'Matron Purple Velvet Cap with Golden Fringe',
        insigniaNotes: 'Matriarch of the Holy Order, Leader of Family Counseling and Prayer Altars.',
      };

    case 'rank_prophetess':
      return {
        vestmentColor: 'Pure White Robe with Purple Liturgical Stole and Gold Trimmings',
        stoleType: 'Purple Prophetic Stole with Golden Star of David',
        capOrCrown: 'Prophetic White & Purple Diadem',
        insigniaNotes: 'Prophetic Oracle, Leader of Holy Mount Intercession and Vigil Services.',
      };

    case 'rank_mary':
      return {
        vestmentColor: 'Pure White Sacred Robe with Sky Blue / White Silk Stole',
        stoleType: 'White & Blue Liturgical Band with Gold Cross',
        capOrCrown: 'Holy Mary White Diadem',
        insigniaNotes: 'Emblem of Purity, Maternal Intercession and Sanctuary Sanctification.',
      };

    case 'rank_deborah':
      return {
        vestmentColor: 'Pure White Sacred Robe with Golden Trim & Brown/Gold Cuffs',
        stoleType: 'Deborah Liturgical Stole with Embroidered Olive Branch',
        capOrCrown: 'Cherubim Sister Diadem with Gold Cross',
        insigniaNotes: 'Spiritual Judge & Counselor, Prayer Warrior in Israel.',
      };

    case 'rank_dorcas':
      return {
        vestmentColor: 'Pure White Sacred Robe with Gold Trim & Blue Piping',
        stoleType: 'Dorcas Benevolence Stole with Golden Thread',
        capOrCrown: 'Cherubim White Prayer Cap',
        insigniaNotes: 'Custodian of Charity, Almsgiving, and Sanctuary Vestments.',
      };

    case 'rank_evangelist':
    case 'rank_pastor':
    case 'rank_rabbi':
    case 'rank_leader_male':
    case 'rank_lady_leader':
    case 'rank_lady_aladura':
    case 'rank_aladura_male':
    default:
      return {
        vestmentColor: 'Pure White Sacred Robe with Embroidered Gold Borders',
        stoleType: 'Liturgical White Band with Golden Fringe',
        capOrCrown: 'Cherubim White Prayer Cap / Diadem',
        insigniaNotes: 'Sanctified altar ministrant vestments.',
      };
  }
}
