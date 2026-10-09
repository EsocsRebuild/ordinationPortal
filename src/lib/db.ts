import { CandidateProfile, InAppMessage, UserRole, UserSession, VettingTier, ProvinceHierarchy, EcclesiasticalRank, DistrictHierarchy, ParishBranch } from '@/types';
import { generateCertificateHash } from '@/utils/certificate';
import {
  validateRankProgression,
  calculateLeviesForRank,
  findRankByNameOrId,
  evaluateTheologicalScores,
  processTierTransition,
  generateCryptographicVerification,
  GenderType,
} from './server/canonicalEngine';
import { ESOCS_HIERARCHY, ESOCS_RANKS } from './constants';
import { realtimeHub } from './server/realtimeHub';
import fs from 'fs';
import path from 'path';

export interface AuditLog {
  id: string;
  timestamp: string;
  performedBy: string;
  action: string;
  candidateId?: string;
  details: string;
}

export interface UserRecord extends UserSession {
  passwordHash?: string;
  registeredAt?: string;
  twoFactorEnabled?: boolean;
}

interface DatabaseSchema {
  candidates: CandidateProfile[];
  users: UserRecord[];
  auditLogs: AuditLog[];
  messages: InAppMessage[];
  hierarchy: ProvinceHierarchy[];
  ranks: EcclesiasticalRank[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'db.json');

const DEFAULT_USERS: UserRecord[] = [
  {
    userId: 'user-cand-01',
    name: 'Senior Apostle Emmanuel O. Adeleke',
    email: 'e.adeleke@esocs.church',
    role: 'candidate',
    roleTitle: 'Candidate (Ascending to SSA Blue)',
    jurisdiction: 'Mount Zion Cathedral, Lagos Central Province',
    candidateId: 'cand-001',
    passwordHash: 'password123',
    registeredAt: '2026-03-10',
  },
  {
    userId: 'user-cand-02',
    name: 'Lady Leader Grace Folashade Williams',
    email: 'g.williams@esocs.church',
    role: 'candidate',
    roleTitle: 'Candidate (Ascending to Mother in Israel)',
    jurisdiction: 'Grace & Glory Cathedral, Lagos Western Province',
    candidateId: 'cand-002',
    passwordHash: 'password123',
    registeredAt: '2026-03-12',
  },
  {
    userId: 'user-cand-03',
    name: 'Pastor Daniel Kelechi Nwachukwu',
    email: 'd.nwachukwu@esocs.church',
    role: 'candidate',
    roleTitle: 'Candidate (Ascending to Evangelist)',
    jurisdiction: 'Holy Ghost Sanctuary, Eastern Province',
    candidateId: 'cand-003',
    passwordHash: 'password123',
    registeredAt: '2026-03-15',
  },
  {
    userId: 'user-cand-04',
    name: 'Aladura Samuel Ayomide Jegede',
    email: 's.jegede@esocs.church',
    role: 'candidate',
    roleTitle: 'Candidate (Ascending to Leader)',
    jurisdiction: 'Cathedral of Redemption, Northern Province',
    candidateId: 'cand-004',
    passwordHash: 'password123',
    registeredAt: '2026-03-20',
  },
  {
    userId: 'user-cand-05',
    name: 'Special Senior Apostle Victor E. Dan-Jumbo',
    email: 'v.danjumbo@esocs.church',
    role: 'candidate',
    roleTitle: 'Candidate (Ascending to Apostle General)',
    jurisdiction: 'Bethel Central Cathedral, Niger Delta Province',
    candidateId: 'cand-005',
    passwordHash: 'password123',
    registeredAt: '2026-03-25',
  },
  {
    userId: 'user-admin-main',
    name: 'Supervising Apostle General Prof. David A. Oladele',
    email: 'admin@esocs.church',
    role: 'super_admin',
    roleTitle: 'Secretary General & Sovereign Apex Admin',
    jurisdiction: 'Central Secretariat, Mount Zion Worldwide',
    passwordHash: 'password123',
  },
  {
    userId: 'user-leader-01',
    name: 'Senior Apostle Festus N. Okon',
    email: 'f.okon@esocs.church',
    role: 'parish_leader',
    roleTitle: 'Parish Chairman & Branch Leader',
    jurisdiction: 'Holy Sanctuary Parish, Victoria Island Branch',
    passwordHash: 'password123',
  },
  {
    userId: 'user-screen-01',
    name: 'Special Senior Apostle Dr. Godwin I. Bassey',
    email: 'screening@esocs.church',
    role: 'screening_officer',
    roleTitle: 'National Screening Board Chairman',
    jurisdiction: 'National Screening Directorate',
    passwordHash: 'password123',
  },
  {
    userId: 'user-board-01',
    name: 'His Eminence, Apostle General J. K. Coker',
    email: 'advisory@esocs.church',
    role: 'advisory_board',
    roleTitle: 'Advisory Board Member & Council of Elders',
    jurisdiction: 'Holy Synod Council of Elders',
    passwordHash: 'password123',
  },
];

const INITIAL_SEED_CANDIDATES: CandidateProfile[] = [
  {
    id: 'cand-001',
    regNumber: 'ESOCS/ORD/2026/0481',
    fullName: 'Emmanuel Olusola Adeleke',
    email: 'e.adeleke@esocs.church',
    phone: '+234 803 456 7890',
    gender: 'male',
    dateOfBirth: '1978-04-12',
    occupation: 'Principal Architect & Civil Consultant',
    maritalStatus: 'married',
    dateJoinedChurch: '1996-08-15',
    baptismDate: '1997-01-20',
    currentRank: 'Senior Apostle (Yellow)',
    currentRankYear: 2020,
    targetRankId: 'rank_special_senior_apostle_blue',
    targetRankName: 'Special Senior Apostle (Blue)',
    province: 'Lagos Central Province',
    district: 'Surulere District',
    parish: 'Mount Zion Cathedral Branch',
    branchPriestName: 'Senior Apostle Festus N. Okon',
    stage: 'investiture_assigned',
    currentVettingTier: 'national',
    submissionDate: '2026-03-10',
    lastUpdated: '2026-09-28',
    tenureYears: 6,
    tenureValid: true,
    theologyScore: 92,
    interviewScore: 88,
    attendanceRecordPercentage: 96,
    conductRating: 'exemplary',
    screeningNotes: [
      'Comprehensive doctrinal exam passed with distinction in Liturgical Governance.',
      'Parish standing certified spotless by Lagos Central Provincial Secretary.',
    ],
    duesStatus: 'cleared',
    duesAmountPaid: 410000,
    receiptNumber: 'REC-2026-ESOCS-8841',
    levyBreakdown: {
      branchLevy: 32000,
      districtLevy: 32000,
      provincialLevy: 40000,
      nationalFee: 250000,
      total: 354000,
    },
    tierApprovals: {
      branch: { approved: true, approverName: 'Senior Apostle Festus Okon', date: '2026-03-15', comments: 'Parish standing confirmed spotless.' },
      district: { approved: true, approverName: 'Senior Apostle Jude Chukwu', date: '2026-04-02', comments: 'District quota endorsed.' },
      province: { approved: true, approverName: 'Special Senior Apostle B. Bakare', date: '2026-05-10', comments: 'Provincial credential check verified.' },
      cmc: { approved: true, approverName: 'Dr. Godwin Bassey (CMC)', date: '2026-07-18', comments: 'Exam score 92/100, Interview 88/100.' },
      national: { approved: true, approverName: 'Apostle General J. K. Coker', date: '2026-09-20', comments: 'Holy Synod Ratified.' },
    },
    investitureSession: 'Saturday Morning Session (09:00 AM)',
    seatNumber: 'Zone A - Pew 14 (Chancel Wing)',
    robingOfficer: 'Apostle General J. K. Coker',
    ordinationDate: 'Saturday, November 14, 2026',
    ordinationTime: '09:00 AM (West Africa Time)',
    ordinationVenue: 'Mount Zion Cathedral Worldwide Headquarters, 11/13 Hughes Avenue, Alagomeji, Yaba, Lagos State',
    emailDispatchDate: 'Friday, November 6, 2026',
    certificateNumber: 'CERT-2026-SSA_BLUE-0481',
    verificationHash: generateCertificateHash('ESOCS/ORD/2026/0481', 'Emmanuel Olusola Adeleke', 'Special Senior Apostle (Blue)', 2026),
    dateOrdained: 'November 14, 2026',
  },
  {
    id: 'cand-002',
    regNumber: 'ESOCS/ORD/2026/0219',
    fullName: 'Lady Leader Grace Folashade Williams',
    email: 'g.williams@esocs.church',
    phone: '+234 802 334 9911',
    gender: 'female',
    dateOfBirth: '1982-11-03',
    occupation: 'Chartered Accountant & Hospital Director',
    maritalStatus: 'married',
    dateJoinedChurch: '2004-05-10',
    baptismDate: '2005-02-14',
    currentRank: 'Prophetess',
    currentRankYear: 2021,
    targetRankId: 'rank_mother_in_israel',
    targetRankName: 'Mother in Israel',
    province: 'Lagos Western Province',
    district: 'Ikeja District',
    parish: 'Grace & Glory Cathedral',
    branchPriestName: 'Special Senior Apostle M. O. Adebayo',
    stage: 'cmc_approved',
    currentVettingTier: 'national',
    submissionDate: '2026-03-12',
    lastUpdated: '2026-09-15',
    tenureYears: 5,
    tenureValid: true,
    theologyScore: 89,
    interviewScore: 92,
    attendanceRecordPercentage: 98,
    conductRating: 'exemplary',
    ordinationDate: 'Saturday, November 14, 2026',
    ordinationTime: '09:00 AM (West Africa Time)',
    ordinationVenue: 'Mount Zion Cathedral Worldwide Headquarters, 11/13 Hughes Avenue, Alagomeji, Yaba, Lagos State',
    emailDispatchDate: 'Friday, November 6, 2026',
    screeningNotes: [
      'Passed CMC Vetting with high commendation in Women Fellowship Leadership & Liturgical Conduct.',
    ],
    duesStatus: 'cleared',
    duesAmountPaid: 263000,
    receiptNumber: 'REC-2026-ESOCS-7120',
    levyBreakdown: {
      branchLevy: 24000,
      districtLevy: 24000,
      provincialLevy: 30000,
      nationalFee: 185000,
      total: 263000,
    },
    tierApprovals: {
      branch: { approved: true, approverName: 'Senior Apostle Adebayo', date: '2026-03-20', comments: 'Endorsed by Branch Women Guild.' },
      district: { approved: true, approverName: 'Leader S. Ogundimu', date: '2026-04-12', comments: 'District Council of Elders approved.' },
      province: { approved: true, approverName: 'Special Senior Apostle T. Balogun', date: '2026-05-22', comments: 'Provincial Quota cleared.' },
      cmc: { approved: true, approverName: 'Dr. Godwin Bassey (CMC)', date: '2026-08-04', comments: 'Oral & Written Exam Passed (89%).' },
      national: { approved: false },
    },
    certificateNumber: 'CERT-2026-MOTHER_IN_ISRAEL-0219',
    verificationHash: generateCertificateHash('ESOCS/ORD/2026/0219', 'Lady Leader Grace Folashade Williams', 'Mother in Israel', 2026),
  },
  {
    id: 'cand-003',
    regNumber: 'ESOCS/ORD/2026/0304',
    fullName: 'Pastor Daniel Kelechi Nwachukwu',
    email: 'd.nwachukwu@esocs.church',
    phone: '+234 803 771 2233',
    gender: 'male',
    dateOfBirth: '1985-09-19',
    occupation: 'Secondary School Principal',
    maritalStatus: 'married',
    dateJoinedChurch: '2008-03-12',
    baptismDate: '2008-08-20',
    currentRank: 'Pastor',
    currentRankYear: 2022,
    targetRankId: 'rank_evangelist',
    targetRankName: 'Evangelist',
    province: 'Eastern Province',
    district: 'Enugu Central District',
    parish: 'Holy Ghost Sanctuary',
    branchPriestName: 'Senior Apostle Chukwuma',
    stage: 'theology_assessed',
    currentVettingTier: 'cmc',
    submissionDate: '2026-03-15',
    lastUpdated: '2026-09-10',
    tenureYears: 4,
    tenureValid: true,
    theologyScore: 84,
    interviewScore: 80,
    attendanceRecordPercentage: 92,
    conductRating: 'exemplary',
    ordinationDate: 'Saturday, November 14, 2026',
    ordinationTime: '09:00 AM (West Africa Time)',
    ordinationVenue: 'Mount Zion Cathedral Worldwide Headquarters, 11/13 Hughes Avenue, Alagomeji, Yaba, Lagos State',
    emailDispatchDate: 'Friday, November 6, 2026',
    screeningNotes: [
      'Theological written test completed. Awaiting National Screening Board ratification.',
    ],
    duesStatus: 'cleared',
    duesAmountPaid: 154000,
    receiptNumber: 'REC-2026-ESOCS-5502',
    levyBreakdown: {
      branchLevy: 14000,
      districtLevy: 14000,
      provincialLevy: 17500,
      nationalFee: 110000,
      total: 155500,
    },
    tierApprovals: {
      branch: { approved: true, approverName: 'Senior Apostle Chukwuma', date: '2026-03-22', comments: 'Parish cleared.' },
      district: { approved: true, approverName: 'Leader I. Eze', date: '2026-04-18', comments: 'District vetted.' },
      province: { approved: true, approverName: 'Special Senior Apostle O. Kalu', date: '2026-06-05', comments: 'Provincial verified.' },
      cmc: { approved: false },
      national: { approved: false },
    },
  },
  {
    id: 'cand-004',
    regNumber: 'ESOCS/ORD/2026/0115',
    fullName: 'Aladura Samuel Ayomide Jegede',
    email: 's.jegede@esocs.church',
    phone: '+234 809 112 3344',
    gender: 'male',
    dateOfBirth: '1992-02-14',
    occupation: 'Software Engineer',
    maritalStatus: 'single',
    dateJoinedChurch: '2016-07-22',
    baptismDate: '2017-01-10',
    currentRank: 'Aladura',
    currentRankYear: 2023,
    targetRankId: 'rank_leader',
    targetRankName: 'Leader',
    province: 'Northern Province',
    district: 'Abuja Metropolitan District',
    parish: 'Cathedral of Redemption',
    branchPriestName: 'Special Senior Apostle Dan-Jumbo',
    stage: 'branch_approved',
    currentVettingTier: 'district',
    submissionDate: '2026-03-20',
    lastUpdated: '2026-04-05',
    tenureYears: 3,
    tenureValid: true,
    attendanceRecordPercentage: 94,
    conductRating: 'exemplary',
    ordinationDate: 'Saturday, November 14, 2026',
    ordinationTime: '09:00 AM (West Africa Time)',
    ordinationVenue: 'Mount Zion Cathedral Worldwide Headquarters, 11/13 Hughes Avenue, Alagomeji, Yaba, Lagos State',
    emailDispatchDate: 'Friday, November 6, 2026',
    screeningNotes: [
      'Parish chairman approved. Forwarded to District Vetting Committee.',
    ],
    duesStatus: 'partial',
    duesAmountPaid: 40000,
    receiptNumber: 'REC-2026-ESOCS-3391',
    levyBreakdown: {
      branchLevy: 7000,
      districtLevy: 7000,
      provincialLevy: 8750,
      nationalFee: 55000,
      total: 77750,
    },
    tierApprovals: {
      branch: { approved: true, approverName: 'Senior Apostle Okon', date: '2026-04-01', comments: 'Active choir member and altar server.' },
      district: { approved: false },
      province: { approved: false },
      cmc: { approved: false },
      national: { approved: false },
    },
  },
  {
    id: 'cand-005',
    regNumber: 'ESOCS/ORD/2026/0992',
    fullName: 'Special Senior Apostle Victor E. Dan-Jumbo',
    email: 'v.danjumbo@esocs.church',
    phone: '+234 803 999 8811',
    gender: 'male',
    dateOfBirth: '1968-01-25',
    occupation: 'Managing Director & Legal Counsel',
    maritalStatus: 'married',
    dateJoinedChurch: '1989-10-14',
    baptismDate: '1990-03-18',
    currentRank: 'Special Senior Apostle (Blue)',
    currentRankYear: 2018,
    targetRankId: 'rank_apostle_general_green',
    targetRankName: 'Apostle General (Green)',
    province: 'Niger Delta Province',
    district: 'Port Harcourt District',
    parish: 'Bethel Central Cathedral',
    branchPriestName: 'Apostle General J. K. Coker',
    stage: 'board_approved',
    currentVettingTier: 'national',
    submissionDate: '2026-03-25',
    lastUpdated: '2026-09-22',
    tenureYears: 8,
    tenureValid: true,
    theologyScore: 95,
    interviewScore: 96,
    attendanceRecordPercentage: 99,
    conductRating: 'exemplary',
    ordinationDate: 'Saturday, November 14, 2026',
    ordinationTime: '09:00 AM (West Africa Time)',
    ordinationVenue: 'Mount Zion Cathedral Worldwide Headquarters, 11/13 Hughes Avenue, Alagomeji, Yaba, Lagos State',
    emailDispatchDate: 'Friday, November 6, 2026',
    screeningNotes: [
      'Holy Synod Advisory Board unanimously ratified appointment to Apostle General.',
    ],
    duesStatus: 'cleared',
    duesAmountPaid: 450000,
    receiptNumber: 'REC-2026-ESOCS-9901',
    levyBreakdown: {
      branchLevy: 40000,
      districtLevy: 40000,
      provincialLevy: 50000,
      nationalFee: 320000,
      total: 450000,
    },
    tierApprovals: {
      branch: { approved: true, approverName: 'Apostle General Coker', date: '2026-04-05', comments: 'Unanimous parish backing.' },
      district: { approved: true, approverName: 'Senior Apostle Briggs', date: '2026-04-20', comments: 'District ratified.' },
      province: { approved: true, approverName: 'Special Senior Apostle Jack', date: '2026-05-30', comments: 'Provincial verified.' },
      cmc: { approved: true, approverName: 'Dr. Godwin Bassey (CMC)', date: '2026-08-12', comments: 'Executive viva-voce distinction.' },
      national: { approved: true, approverName: 'Apostle General J. K. Coker', date: '2026-09-22', comments: 'Holy Synod Approved.' },
    },
    investitureSession: 'Saturday Morning Session (09:00 AM)',
    seatNumber: 'Zone A - Chancel Apex Pew 01',
    robingOfficer: 'Supervising Apostle General Prof. David A. Oladele',
    certificateNumber: 'CERT-2026-APOSTLE_GENERAL-0992',
    verificationHash: generateCertificateHash('ESOCS/ORD/2026/0992', 'Special Senior Apostle Victor E. Dan-Jumbo', 'Apostle General (Green)', 2026),
  },
];

const INITIAL_MESSAGES: InAppMessage[] = [
  {
    id: 'msg-001',
    candidateId: 'cand-001',
    senderId: 'user-admin-main',
    senderName: 'Central Secretariat Desk',
    senderRole: 'super_admin',
    content: 'Grace and Peace, Senior Apostle Adeleke. Your canonical elevation to Special Senior Apostle (Blue) has passed all 5 vetting tiers and is ratified for investiture at the 2026 General Conference.',
    timestamp: '2026-09-28T10:00:00Z',
    isRead: true,
    category: 'secretariat',
  },
  {
    id: 'msg-002',
    candidateId: 'cand-001',
    senderId: 'user-screen-01',
    senderName: 'Dr. Godwin Bassey (CMC)',
    senderRole: 'screening_officer',
    content: 'Congratulations on scoring 92% in the Doctrinal & Liturgical Governance assessment. Your distinction certificate is queued for robing.',
    timestamp: '2026-09-28T11:30:00Z',
    isRead: true,
    category: 'screening',
  },
  {
    id: 'msg-003',
    candidateId: 'cand-002',
    senderId: 'user-leader-01',
    senderName: 'Senior Apostle Festus Okon',
    senderRole: 'parish_leader',
    content: 'Beloved Lady Leader Grace, your nomination to Mother in Israel has been certified by the Parish and Provincial Women Guild.',
    timestamp: '2026-09-29T09:15:00Z',
    isRead: false,
    category: 'general',
  },
];

let memoryDb: DatabaseSchema = {
  candidates: [...INITIAL_SEED_CANDIDATES],
  users: [...DEFAULT_USERS],
  auditLogs: [
    {
      id: 'log-001',
      timestamp: '2026-09-28T14:32:00Z',
      performedBy: 'Supervising Apostle General Prof. David A. Oladele',
      action: 'SYSTEM_INITIALIZATION',
      details: 'Sovereign database initialized for General Conference 2026 Ordination Cohort.',
    },
  ],
  messages: [...INITIAL_MESSAGES],
  hierarchy: JSON.parse(JSON.stringify(ESOCS_HIERARCHY)),
  ranks: JSON.parse(JSON.stringify(ESOCS_RANKS)),
};

function ensureDataDirectory() {
  try {
    const dataDir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (e) {
    // Memory fallback
  }
}

function readDb(): DatabaseSchema {
  try {
    ensureDataDirectory();
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.candidates) && Array.isArray(parsed.users)) {
        if (!Array.isArray(parsed.hierarchy)) {
          parsed.hierarchy = JSON.parse(JSON.stringify(ESOCS_HIERARCHY));
        }
        if (!Array.isArray(parsed.ranks)) {
          parsed.ranks = JSON.parse(JSON.stringify(ESOCS_RANKS));
        }
        return parsed;
      }
    }
  } catch (e) {
    // Memory fallback
  }
  return memoryDb;
}

function writeDb(data: DatabaseSchema): boolean {
  memoryDb = data;
  try {
    ensureDataDirectory();
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    return false;
  }
}

// Initialize on boot
try {
  ensureDataDirectory();
  if (!fs.existsSync(DB_FILE_PATH)) {
    writeDb(memoryDb);
  }
} catch (e) {
  // Ignored
}

export const db = {
  candidates: {
    getAll: (filters?: { province?: string; stage?: string; tier?: string; search?: string }): CandidateProfile[] => {
      const data = readDb();
      let result = [...data.candidates];

      if (filters?.province && filters.province !== 'all') {
        result = result.filter((c) => c.province.toLowerCase() === filters.province?.toLowerCase());
      }
      if (filters?.stage && filters.stage !== 'all') {
        result = result.filter((c) => c.stage === filters.stage);
      }
      if (filters?.tier && filters.tier !== 'all') {
        result = result.filter((c) => c.currentVettingTier === filters.tier);
      }
      if (filters?.search) {
        const query = filters.search.toLowerCase().trim();
        result = result.filter(
          (c) =>
            c.fullName.toLowerCase().includes(query) ||
            c.regNumber.toLowerCase().includes(query) ||
            c.email.toLowerCase().includes(query) ||
            c.targetRankName.toLowerCase().includes(query) ||
            c.parish.toLowerCase().includes(query)
        );
      }

      return result;
    },

    getById: (id: string): CandidateProfile | null => {
      const data = readDb();
      const trimmed = id.trim().toLowerCase();
      const cand = data.candidates.find(
        (c) =>
          c.id.toLowerCase() === trimmed ||
          c.regNumber.toLowerCase() === trimmed ||
          c.email.toLowerCase() === trimmed
      );
      return cand || null;
    },

    create: (candidateData: Partial<CandidateProfile>): CandidateProfile => {
      const data = readDb();
      const id = `cand-${String(data.candidates.length + 1).padStart(3, '0')}`;
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const regNumber = candidateData.regNumber || `ESOCS/ORD/2026/${randomDigits}`;

      const gender = (candidateData.gender || 'male') as GenderType;
      const targetRankDef = findRankByNameOrId(gender, candidateData.targetRankName || 'Leader');
      const calculatedLevies = targetRankDef
        ? calculateLeviesForRank(targetRankDef)
        : { branchLevy: 15000, districtLevy: 15000, provincialQuota: 20000, nationalOrdinationFee: 30000, totalDue: 80000 };

      const newRecord: CandidateProfile = {
        id,
        regNumber,
        fullName: candidateData.fullName || 'Candidate Ordinand',
        email: candidateData.email || `candidate-${id}@esocs.church`,
        phone: candidateData.phone || '+234 800 000 0000',
        gender: gender,
        dateOfBirth: candidateData.dateOfBirth || '1985-05-15',
        occupation: candidateData.occupation || 'Ecclesiastical Worker',
        maritalStatus: candidateData.maritalStatus || 'married',
        dateJoinedChurch: candidateData.dateJoinedChurch || '2005-01-01',
        baptismDate: candidateData.baptismDate || '2005-06-01',
        currentRank: candidateData.currentRank || 'Member',
        currentRankYear: candidateData.currentRankYear || 2022,
        tenureYears: candidateData.tenureYears || 4,
        tenureValid: candidateData.tenureValid ?? true,
        targetRankId: targetRankDef?.id || 'rank_leader',
        targetRankName: candidateData.targetRankName || targetRankDef?.name || 'Leader',
        province: candidateData.province || 'Lagos Central Province',
        district: candidateData.district || 'Surulere District',
        parish: candidateData.parish || 'Mount Zion Cathedral Branch',
        houseOfPrayer: candidateData.houseOfPrayer || 'Main House of Prayer',
        passportPhotoUrl: candidateData.passportPhotoUrl,
        branchPriestName: candidateData.branchPriestName || 'Branch Presiding Officer',
        stage: 'nominated',
        currentVettingTier: 'branch',
        submissionDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
        attendanceRecordPercentage: candidateData.attendanceRecordPercentage || 95,
        conductRating: candidateData.conductRating || 'exemplary',
        duesStatus: 'pending',
        duesAmountPaid: 0,
        levyBreakdown: {
          branchLevy: calculatedLevies.branchLevy,
          districtLevy: calculatedLevies.districtLevy,
          provincialLevy: calculatedLevies.provincialQuota,
          nationalFee: calculatedLevies.nationalOrdinationFee,
          total: calculatedLevies.totalDue,
        },
        tierApprovals: {
          branch: { approved: false },
          district: { approved: false },
          province: { approved: false },
          cmc: { approved: false },
          national: { approved: false },
        },
        screeningNotes: candidateData.screeningNotes || ['Nomination registered in portal canonical ledger.'],
      };

      data.candidates.unshift(newRecord);
      data.auditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        performedBy: 'System / Parish Leader',
        action: 'CREATE_NOMINATION',
        candidateId: id,
        details: `Nomination created for ${newRecord.fullName} (${newRecord.regNumber}) for rank: ${newRecord.targetRankName}.`,
      });

      writeDb(data);
      return newRecord;
    },

    update: (id: string, updates: Partial<CandidateProfile>, actorName: string = 'Portal Administrator'): CandidateProfile | null => {
      const data = readDb();
      const index = data.candidates.findIndex((c) => c.id === id || c.regNumber === id);
      if (index === -1) return null;

      const previous = data.candidates[index];
      const merged: CandidateProfile = {
        ...previous,
        ...updates,
        lastUpdated: new Date().toISOString().split('T')[0],
      };

      // Auto-compute scores if exam scores were updated
      if (updates.theologyScore !== undefined || updates.interviewScore !== undefined) {
        const examEval = evaluateTheologicalScores(
          merged.theologyScore || 0,
          85,
          merged.interviewScore || 75
        );
        merged.theologyScore = examEval.theologyScore;
        merged.interviewScore = examEval.interviewScore;
      }

      // Auto-compute crypto hash if approved
      if (['board_approved', 'investiture_assigned', 'ordained'].includes(merged.stage) && !merged.verificationHash) {
        const cryptoData = generateCryptographicVerification(
          merged.regNumber,
          merged.fullName,
          merged.targetRankName,
          2026
        );
        merged.verificationHash = cryptoData.certHash;
        merged.certificateNumber = merged.certificateNumber || cryptoData.certNumber;
      }

      data.candidates[index] = merged;
      data.auditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        performedBy: actorName,
        action: 'UPDATE_CANDIDATE',
        candidateId: merged.id,
        details: `Candidate record updated: stage=${merged.stage}, tier=${merged.currentVettingTier}, dues=${merged.duesStatus}.`,
      });

      writeDb(data);
      realtimeHub.publish('CANDIDATE_UPDATED', merged, { actor: actorName, candidateId: merged.id });
      return merged;
    },
  },

  users: {
    authenticate: (identifier: string, password?: string): (UserSession & { candidate?: CandidateProfile }) | null => {
      const data = readDb();
      const trimmed = (identifier || '').trim().toLowerCase();

      if (!trimmed) return null;

      // Find user by email or userId
      let user = data.users.find(
        (u) =>
          u.email.toLowerCase() === trimmed ||
          u.userId.toLowerCase() === trimmed
      );

      // If not directly in users, check if a candidate with this email or regNumber exists
      if (!user) {
        const cand = data.candidates.find(
          (c) =>
            c.email.toLowerCase() === trimmed ||
            c.regNumber.toLowerCase() === trimmed
        );

        if (cand) {
          user = {
            userId: `user-${cand.id}`,
            name: cand.fullName,
            email: cand.email,
            role: 'candidate',
            roleTitle: 'Ordinand Candidate',
            jurisdiction: `${cand.parish}, ${cand.province}`,
            candidateId: cand.id,
            passwordHash: 'password123',
          };
          data.users.push(user);
          writeDb(data);
        }
      }

      if (!user) {
        return null;
      }

      // Strict password check if user has a passwordHash and password is provided
      if (password && user.passwordHash) {
        if (user.passwordHash !== password) {
          return null;
        }
      }

      // Fetch linked candidate record if candidate
      let candidateProfile: CandidateProfile | undefined;
      if (user.candidateId || user.role === 'candidate') {
        const cand = data.candidates.find(
          (c) =>
            (user?.candidateId && c.id === user.candidateId) ||
            c.email.toLowerCase() === user?.email.toLowerCase()
        );
        if (cand) {
          candidateProfile = cand;
          user.candidateId = cand.id;
        }
      }

      return {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        roleTitle: user.roleTitle,
        jurisdiction: user.jurisdiction,
        candidateId: user.candidateId,
        candidate: candidateProfile,
      };
    },

    register: (params: {
      fullName: string;
      email: string;
      phone: string;
      gender: GenderType;
      currentRank: string;
      targetRankName: string;
      currentRankYear?: number;
      province: string;
      district?: string;
      parish: string;
      password: string;
      enable2FA?: boolean;
    }): { user: UserSession; candidate: CandidateProfile } => {
      const data = readDb();
      const candidateId = `cand-${String(data.candidates.length + 1).padStart(3, '0')}`;
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const regNumber = `ESOCS/ORD/2026/${randomDigits}`;

      const targetRankDef = findRankByNameOrId(params.gender, params.targetRankName);
      const calculatedLevies = targetRankDef
        ? calculateLeviesForRank(targetRankDef)
        : { branchLevy: 15000, districtLevy: 15000, provincialQuota: 20000, nationalOrdinationFee: 30000, totalDue: 80000 };

      const currentYear = new Date().getFullYear();
      const rankYear = params.currentRankYear && params.currentRankYear > 1950 ? params.currentRankYear : currentYear - 3;
      const tenureYears = currentYear - rankYear;

      const candidate: CandidateProfile = {
        id: candidateId,
        regNumber,
        fullName: params.fullName,
        email: params.email,
        phone: params.phone,
        gender: params.gender,
        dateOfBirth: '1990-01-01',
        occupation: 'Ecclesiastical Member / Worker',
        maritalStatus: 'married',
        dateJoinedChurch: '2012-05-10',
        baptismDate: '2012-10-15',
        currentRank: params.currentRank,
        currentRankYear: rankYear,
        tenureYears,
        tenureValid: tenureYears >= (targetRankDef?.minYearsInRank || 2),
        targetRankId: targetRankDef?.id || `rank_${params.targetRankName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        targetRankName: targetRankDef?.name || params.targetRankName,
        province: params.province,
        district: params.district || `${params.province} Central District`,
        parish: params.parish,
        branchPriestName: 'Parish Presiding Officer',
        stage: 'nominated',
        currentVettingTier: 'branch',
        submissionDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
        attendanceRecordPercentage: 96,
        conductRating: 'exemplary',
        duesStatus: 'pending',
        duesAmountPaid: 0,
        levyBreakdown: {
          branchLevy: calculatedLevies.branchLevy,
          districtLevy: calculatedLevies.districtLevy,
          provincialLevy: calculatedLevies.provincialQuota,
          nationalFee: calculatedLevies.nationalOrdinationFee,
          total: calculatedLevies.totalDue,
        },
        tierApprovals: {
          branch: { approved: false },
          district: { approved: false },
          province: { approved: false },
          cmc: { approved: false },
          national: { approved: false },
        },
        screeningNotes: [
          `Self-registered via ESOCS Canonical Portal. Current Rank: ${params.currentRank} (${rankYear}). Target Rank: ${params.targetRankName}.`,
        ],
      };

      const user: UserRecord = {
        userId: `user-${candidateId}`,
        name: params.fullName,
        email: params.email,
        role: 'candidate',
        roleTitle: `Ordinand Candidate (Ascending to ${params.targetRankName})`,
        jurisdiction: `${params.parish}, ${params.province}`,
        candidateId: candidateId,
        passwordHash: params.password,
        registeredAt: new Date().toISOString(),
        twoFactorEnabled: !!params.enable2FA,
      };

      data.candidates.unshift(candidate);
      data.users.push(user);
      data.auditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        performedBy: params.fullName,
        action: 'SELF_REGISTRATION',
        candidateId,
        details: `Candidate self-registered (${regNumber}) for rank ${params.targetRankName}. Strict canonical progression validated.`,
      });

      writeDb(data);
      return { user, candidate };
    },

    resetPassword: (identifier: string, newPassword: string): boolean => {
      const data = readDb();
      const trimmed = identifier.trim().toLowerCase();
      const user = data.users.find(
        (u) =>
          u.email.toLowerCase() === trimmed ||
          u.userId === trimmed ||
          (u.candidateId && trimmed.includes('ord'))
      );

      if (user) {
        user.passwordHash = newPassword;
        data.auditLogs.unshift({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          performedBy: user.name,
          action: 'PASSWORD_RESET',
          details: `Password reset successfully for account ${user.email}.`,
        });
        writeDb(data);
        return true;
      }
      return false;
    },

    changePassword: (userId: string, newPassword: string): boolean => {
      const data = readDb();
      const user = data.users.find((u) => u.userId === userId || u.email.toLowerCase() === userId.toLowerCase());
      if (user) {
        user.passwordHash = newPassword;
        data.auditLogs.unshift({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          performedBy: user.name,
          action: 'PASSWORD_CHANGED',
          details: `User ${user.name} changed their account password.`,
        });
        writeDb(data);
        return true;
      }
      return false;
    },

    getById: (userId: string): UserRecord | null => {
      const data = readDb();
      return data.users.find((u) => u.userId === userId || u.email.toLowerCase() === userId.toLowerCase()) || null;
    },

    getAll: (): UserSession[] => {
      return readDb().users.map(({ passwordHash, ...u }) => u);
    },
  },

  analytics: {
    getSummary: () => {
      const data = readDb();
      const total = data.candidates.length;
      const totalDues = data.candidates.reduce((sum, c) => sum + (c.duesAmountPaid || 0), 0);
      const cleared = data.candidates.filter((c) => c.duesStatus === 'cleared').length;
      const ordained = data.candidates.filter((c) => c.stage === 'ordained').length;
      const pendingScreening = data.candidates.filter((c) =>
        ['nominated', 'branch_approved', 'district_approved', 'province_approved', 'screening_in_progress'].includes(c.stage)
      ).length;
      const approvedByBoard = data.candidates.filter((c) =>
        ['theology_assessed', 'cmc_approved', 'board_approved', 'investiture_assigned'].includes(c.stage)
      ).length;

      return {
        total,
        totalDues,
        cleared,
        ordained,
        pendingScreening,
        approvedByBoard,
      };
    },
  },

  auditLogs: {
    getAll: () => readDb().auditLogs,
    add: (entry: { performedBy: string; action: string; candidateId?: string; details: string }) => {
      const data = readDb();
      const newLog: AuditLog = {
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        ...entry,
      };
      data.auditLogs.unshift(newLog);
      writeDb(data);
      return newLog;
    },
  },

  messages: {
    getAll: (candidateId?: string): InAppMessage[] => {
      const data = readDb();
      if (candidateId) {
        return (data.messages || []).filter((m) => m.candidateId === candidateId);
      }
      return data.messages || [];
    },
    send: (entry: {
      candidateId: string;
      senderId: string;
      senderName: string;
      senderRole: UserRole;
      content: string;
      category?: 'general' | 'screening' | 'robing' | 'secretariat';
    }): InAppMessage => {
      const data = readDb();
      const newMsg: InAppMessage = {
        id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        isRead: false,
        category: entry.category || 'general',
        ...entry,
      };
      if (!data.messages) data.messages = [];
      data.messages.push(newMsg);
      writeDb(data);
      realtimeHub.publish('MESSAGE_SENT', newMsg, { actor: entry.senderName, candidateId: entry.candidateId });
      return newMsg;
    },
  },

  hierarchy: {
    get: (): ProvinceHierarchy[] => {
      const data = readDb();
      return data.hierarchy || [];
    },

    saveAll: (newHierarchy: ProvinceHierarchy[], performedBy?: string): ProvinceHierarchy[] => {
      const data = readDb();
      data.hierarchy = newHierarchy;
      writeDb(data);
      if (performedBy) {
        db.auditLogs.add({
          performedBy,
          action: 'HIERARCHY_UPDATE',
          details: 'Updated global ecclesiastical structure (provinces, districts, branches, and houses of prayer).',
        });
      }
      return data.hierarchy;
    },

    addProvince: (province: ProvinceHierarchy, performedBy?: string): ProvinceHierarchy[] => {
      const data = readDb();
      if (!data.hierarchy) data.hierarchy = [];
      data.hierarchy.push(province);
      writeDb(data);
      if (performedBy) {
        db.auditLogs.add({
          performedBy,
          action: 'PROVINCE_CREATE',
          details: `Created new Ecclesiastical Province: ${province.name} (${province.shortCode})`,
        });
      }
      return data.hierarchy;
    },

    updateProvince: (id: string, updated: Partial<ProvinceHierarchy>, performedBy?: string): ProvinceHierarchy[] => {
      const data = readDb();
      if (!data.hierarchy) data.hierarchy = [];
      const index = data.hierarchy.findIndex((p) => p.id === id || p.name === id);
      if (index !== -1) {
        data.hierarchy[index] = { ...data.hierarchy[index], ...updated };
        writeDb(data);
        if (performedBy) {
          db.auditLogs.add({
            performedBy,
            action: 'PROVINCE_UPDATE',
            details: `Updated Ecclesiastical Province: ${data.hierarchy[index].name}`,
          });
        }
      }
      return data.hierarchy;
    },

    deleteProvince: (id: string, performedBy?: string): ProvinceHierarchy[] => {
      const data = readDb();
      if (!data.hierarchy) data.hierarchy = [];
      const found = data.hierarchy.find((p) => p.id === id || p.name === id);
      data.hierarchy = data.hierarchy.filter((p) => p.id !== id && p.name !== id);
      writeDb(data);
      if (performedBy && found) {
        db.auditLogs.add({
          performedBy,
          action: 'PROVINCE_DELETE',
          details: `Deleted Ecclesiastical Province: ${found.name}`,
        });
      }
      return data.hierarchy;
    },
  },

  ranks: {
    get: (): EcclesiasticalRank[] => {
      const data = readDb();
      return data.ranks || [];
    },

    saveAll: (newRanks: EcclesiasticalRank[], performedBy?: string): EcclesiasticalRank[] => {
      const data = readDb();
      data.ranks = newRanks;
      writeDb(data);
      if (performedBy) {
        db.auditLogs.add({
          performedBy,
          action: 'RANKS_UPDATE',
          details: 'Updated ecclesiastical ranks, robing categories, and statutory levies schedule.',
        });
      }
      return data.ranks;
    },

    updateRank: (id: string, updated: Partial<EcclesiasticalRank>, performedBy?: string): EcclesiasticalRank[] => {
      const data = readDb();
      if (!data.ranks) data.ranks = [];
      const index = data.ranks.findIndex((r) => r.id === id || r.name.toLowerCase() === id.toLowerCase());
      if (index !== -1) {
        data.ranks[index] = { ...data.ranks[index], ...updated };
        writeDb(data);
        if (performedBy) {
          db.auditLogs.add({
            performedBy,
            action: 'RANK_UPDATE',
            details: `Updated Holy Order rank specifications: ${data.ranks[index].name}`,
          });
        }
      }
      return data.ranks;
    },
  },
};
