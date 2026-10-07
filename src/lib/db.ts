import { CandidateProfile, UserRole, UserSession, VettingTier } from '@/types';
import { generateCertificateHash } from '@/utils/certificate';
import { ESOCS_RANKS } from '@/lib/constants';
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

interface DatabaseSchema {
  candidates: CandidateProfile[];
  users: (UserSession & { passwordHash?: string })[];
  auditLogs: AuditLog[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'db.json');

const DEFAULT_USERS: (UserSession & { passwordHash?: string })[] = [
  {
    userId: 'user-cand-01',
    name: 'Senior Apostle (Yellow) Emmanuel O. Adeleke',
    email: 'e.adeleke@esocs.church',
    role: 'candidate',
    roleTitle: 'Ordinand Candidate (Ascending to SSA Blue)',
    jurisdiction: 'Mount Zion Cathedral, Lagos Central Province',
    candidateId: 'cand-001',
  },
  {
    userId: 'user-admin-main',
    name: 'Supervising Apostle General (Green) Prof. David A. Oladele',
    email: 'admin@esocs.church',
    role: 'super_admin',
    roleTitle: 'Secretary General & Sovereign Apex Admin',
    jurisdiction: 'Central Secretariat, Mount Zion Worldwide',
  },
  {
    userId: 'user-leader-01',
    name: 'Senior Apostle (Yellow) Festus N. Okon',
    email: 'f.okon@esocs.church',
    role: 'parish_leader',
    roleTitle: 'Parish Chairman & Branch Leader',
    jurisdiction: 'Holy Sanctuary Parish, Victoria Island Branch',
  },
  {
    userId: 'user-screen-01',
    name: 'Special Senior Apostle (Blue) Dr. Godwin I. Bassey',
    email: 'screening@esocs.church',
    role: 'screening_officer',
    roleTitle: 'National Screening Board Chairman',
    jurisdiction: 'National Screening Directorate',
  },
  {
    userId: 'user-board-01',
    name: 'His Eminence, Apostle General (Green) J. K. Coker',
    email: 'advisory@esocs.church',
    role: 'advisory_board',
    roleTitle: 'Advisory Board Member & Council of Elders',
    jurisdiction: 'Holy Synod Council of Elders',
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
    branchPriestName: 'Senior Apostle (Yellow) Festus N. Okon',
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
    duesAmountPaid: 170000,
    receiptNumber: 'REC-2026-ESOCS-8841',
    levyBreakdown: {
      branchLevy: 30000,
      districtLevy: 30000,
      provincialLevy: 45000,
      nationalFee: 65000,
      total: 170000,
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
    certificateNumber: 'CERT-2026-SSA-0481',
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
    dateJoinedChurch: '2001-04-10',
    baptismDate: '2001-09-02',
    currentRank: 'Prophetess',
    currentRankYear: 2021,
    targetRankId: 'rank_mother_in_israel',
    targetRankName: 'Mother in Israel',
    province: 'Lagos Western Province',
    district: 'Ikeja / Maryland District',
    parish: 'Grace & Glory Cathedral',
    branchPriestName: 'Special Senior Apostle B. A. Bakare',
    stage: 'cmc_approved',
    currentVettingTier: 'national',
    submissionDate: '2026-04-02',
    lastUpdated: '2026-09-15',
    tenureYears: 5,
    tenureValid: true,
    theologyScore: 94,
    interviewScore: 90,
    attendanceRecordPercentage: 98,
    conductRating: 'exemplary',
    screeningNotes: [
      'Top scorer in Biblical Hermeneutics & Women Ministry Pastoral Leadership.',
    ],
    duesStatus: 'cleared',
    duesAmountPaid: 115000,
    receiptNumber: 'REC-2026-ESOCS-5512',
    levyBreakdown: {
      branchLevy: 20000,
      districtLevy: 20000,
      provincialLevy: 30000,
      nationalFee: 45000,
      total: 115000,
    },
    tierApprovals: {
      branch: { approved: true, approverName: 'Special Senior Apostle B. A. Bakare', date: '2026-04-10', comments: 'Certified active matriarch.' },
      district: { approved: true, approverName: 'District Overseer Ikeja', date: '2026-05-02', comments: 'District endorsement granted.' },
      province: { approved: true, approverName: 'Provincial Council Lagos West', date: '2026-06-15', comments: 'Zonal verification passed.' },
      cmc: { approved: true, approverName: 'National Screening Board', date: '2026-08-22', comments: 'Exam 94/100. Recommended for Synod.' },
    },
    investitureSession: 'Saturday Afternoon Session (02:00 PM)',
    seatNumber: 'Zone B - Pew 08 (Matriarch Gallery)',
    robingOfficer: 'Sp. Snr. Mother in Israel Esther Agboola',
    certificateNumber: 'CERT-2026-MII-0219',
    verificationHash: generateCertificateHash('ESOCS/ORD/2026/0219', 'Grace Folashade Williams', 'Mother in Israel', 2026),
  },
  {
    id: 'cand-003',
    regNumber: 'ESOCS/ORD/2026/0612',
    fullName: 'Pastor Daniel Kelechi Nwachukwu',
    email: 'd.nwachukwu@esocs.church',
    phone: '+234 814 555 1209',
    gender: 'male',
    dateOfBirth: '1990-07-22',
    occupation: 'Software Engineer & University Lecturer',
    maritalStatus: 'married',
    dateJoinedChurch: '2012-03-18',
    baptismDate: '2012-10-14',
    currentRank: 'Pastor',
    currentRankYear: 2022,
    targetRankId: 'rank_evangelist',
    targetRankName: 'Evangelist',
    province: 'Eastern Province (Enugu / Aba / Owerri)',
    district: 'Enugu Urban District',
    parish: 'Holy Ghost Sanctuary, Independence Layout',
    branchPriestName: 'Senior Apostle Jude Chukwu',
    stage: 'screening_in_progress',
    currentVettingTier: 'cmc',
    submissionDate: '2026-05-18',
    lastUpdated: '2026-08-30',
    tenureYears: 4,
    tenureValid: true,
    theologyScore: 78,
    interviewScore: 82,
    attendanceRecordPercentage: 89,
    conductRating: 'good',
    screeningNotes: [
      'Theology score passed cutoff. Sequential rank Pastor → Evangelist confirmed.',
    ],
    duesStatus: 'pending',
    duesAmountPaid: 0,
    levyBreakdown: {
      branchLevy: 15000,
      districtLevy: 15000,
      provincialLevy: 20000,
      nationalFee: 30000,
      total: 80000,
    },
    tierApprovals: {
      branch: { approved: true, approverName: 'Senior Apostle Jude Chukwu', date: '2026-05-25', comments: 'Parish priest attested.' },
      district: { approved: true, approverName: 'District Committee Enugu', date: '2026-06-18', comments: 'District clearance signed.' },
      province: { approved: true, approverName: 'Eastern Provincial Secretariat', date: '2026-07-20', comments: 'Transferred to CMC for testing.' },
    },
  },
  {
    id: 'cand-004',
    regNumber: 'ESOCS/ORD/2026/0890',
    fullName: 'Aladura Samuel Ayomide Jegede',
    email: 's.jegede@esocs.church',
    phone: '+234 701 987 6543',
    gender: 'male',
    dateOfBirth: '1995-02-14',
    occupation: 'Bio-medical Lab Scientist',
    maritalStatus: 'single',
    dateJoinedChurch: '2018-06-20',
    baptismDate: '2018-12-09',
    currentRank: 'Aladura',
    currentRankYear: 2023,
    targetRankId: 'rank_leader_male',
    targetRankName: 'Leader',
    province: 'Northern Province (Abuja / Kaduna / Kano)',
    district: 'Abuja Metropolitan District',
    parish: 'Cathedral of Redemption, Garki',
    branchPriestName: 'Special Senior Apostle C. N. Ibrahim',
    stage: 'branch_approved',
    currentVettingTier: 'district',
    submissionDate: '2026-06-01',
    lastUpdated: '2026-07-22',
    tenureYears: 3,
    tenureValid: true,
    attendanceRecordPercentage: 92,
    conductRating: 'exemplary',
    duesStatus: 'pending',
    duesAmountPaid: 0,
    levyBreakdown: {
      branchLevy: 9000,
      districtLevy: 9000,
      provincialLevy: 12000,
      nationalFee: 15000,
      total: 45000,
    },
    tierApprovals: {
      branch: { approved: true, approverName: 'Special Senior Apostle C. N. Ibrahim', date: '2026-06-05', comments: 'Parish endorsement forwarded to District.' },
    },
  },
  {
    id: 'cand-005',
    regNumber: 'ESOCS/ORD/2026/0105',
    fullName: 'Special Senior Apostle (Blue) Victor E. Dan-Jumbo',
    email: 'v.danjumbo@esocs.church',
    phone: '+234 809 111 2233',
    gender: 'male',
    dateOfBirth: '1965-09-19',
    occupation: 'Maritime Law Arbitrator & Senior Advocate',
    maritalStatus: 'married',
    dateJoinedChurch: '1985-02-10',
    baptismDate: '1985-07-07',
    currentRank: 'Special Senior Apostle (Blue)',
    currentRankYear: 2018,
    targetRankId: 'rank_apostle_general_green',
    targetRankName: 'Apostle General (Green)',
    province: 'Niger Delta Province (Port Harcourt / Bayelsa)',
    district: 'Port Harcourt Apex District',
    parish: 'Bethel Central Cathedral',
    branchPriestName: 'Supervising Apostle General (Green) T. A. Briggs',
    stage: 'board_approved',
    currentVettingTier: 'national',
    submissionDate: '2026-02-14',
    lastUpdated: '2026-09-30',
    tenureYears: 8,
    tenureValid: true,
    theologyScore: 98,
    interviewScore: 97,
    attendanceRecordPercentage: 100,
    conductRating: 'exemplary',
    screeningNotes: [
      'Unanimous recommendation by the Niger Delta Synod.',
    ],
    duesStatus: 'cleared',
    duesAmountPaid: 200000,
    receiptNumber: 'REC-2026-ESOCS-0012',
    levyBreakdown: {
      branchLevy: 35000,
      districtLevy: 35000,
      provincialLevy: 50000,
      nationalFee: 80000,
      total: 200000,
    },
    tierApprovals: {
      branch: { approved: true, approverName: 'Supervising Apostle General T. A. Briggs', date: '2026-02-20', comments: 'High recommendation.' },
      district: { approved: true, approverName: 'Port Harcourt Apex District Council', date: '2026-03-12', comments: 'Approved.' },
      province: { approved: true, approverName: 'Niger Delta Provincial Synod', date: '2026-04-15', comments: 'Unanimous provincial endorsement.' },
      cmc: { approved: true, approverName: 'National Screening Directorate', date: '2026-06-10', comments: 'Score: 98/100.' },
      national: { approved: true, approverName: 'His Most Eminence & Holy Synod', date: '2026-09-30', comments: 'Decreed for High Altar investiture.' },
    },
    seatNumber: 'High Altar - Chancel Row 1',
    robingOfficer: 'His Most Eminence, Baba Aladura (Prelate)',
    certificateNumber: 'CERT-2026-AG-0105',
    verificationHash: generateCertificateHash('ESOCS/ORD/2026/0105', 'Victor E. Dan-Jumbo', 'Apostle General (Green)', 2026),
  },
];

let memoryStore: DatabaseSchema = {
  candidates: [...INITIAL_SEED_CANDIDATES],
  users: [...DEFAULT_USERS],
  auditLogs: [
    {
      id: 'log-001',
      timestamp: new Date().toISOString(),
      performedBy: 'System Bootstrapper',
      action: 'INITIALIZE_DATABASE',
      details: 'Ecclesiastical database initialized with Cohort 2026 records & 5-tier vetting pipeline.',
    },
  ],
};

function readDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    // Fall back to memoryStore
  }
  return memoryStore;
}

function writeDb(data: DatabaseSchema): void {
  memoryStore = data;
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // Non-fatal, memoryStore holds data
  }
}

export const db = {
  candidates: {
    getAll: (params?: { province?: string; stage?: string; tier?: string; search?: string }): CandidateProfile[] => {
      const data = readDb();
      let list = [...data.candidates];

      if (params?.province && params.province !== 'all') {
        list = list.filter((c) => c.province === params.province);
      }
      if (params?.stage && params.stage !== 'all') {
        list = list.filter((c) => c.stage === params.stage);
      }
      if (params?.tier && params.tier !== 'all') {
        list = list.filter((c) => c.currentVettingTier === params.tier);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (c) =>
            c.fullName.toLowerCase().includes(q) ||
            c.regNumber.toLowerCase().includes(q) ||
            c.targetRankName.toLowerCase().includes(q) ||
            c.currentRank.toLowerCase().includes(q)
        );
      }
      return list;
    },

    getById: (id: string): CandidateProfile | null => {
      const data = readDb();
      return (
        data.candidates.find(
          (c) =>
            c.id === id ||
            c.regNumber.replace(/[^A-Za-z0-9]/g, '') === id.replace(/[^A-Za-z0-9]/g, '') ||
            c.email.toLowerCase() === id.toLowerCase()
        ) || null
      );
    },

    create: (candidateData: Partial<CandidateProfile>): CandidateProfile => {
      const data = readDb();
      const id = `cand-${String(data.candidates.length + 1).padStart(3, '0')}`;
      const regNumber = `ESOCS/ORD/2026/${String(Math.floor(100 + Math.random() * 900)).padStart(4, '0')}`;

      const matchedRank = ESOCS_RANKS.find((r) => r.name.toLowerCase() === (candidateData.targetRankName || '').toLowerCase());
      const rankYear = candidateData.currentRankYear || 2022;
      const tenure = 2026 - rankYear;

      const newRecord: CandidateProfile = {
        id,
        regNumber,
        fullName: candidateData.fullName || 'New Ordinand',
        email: candidateData.email || 'candidate@esocs.church',
        phone: candidateData.phone || '+234 800 000 0000',
        gender: candidateData.gender || 'male',
        dateOfBirth: candidateData.dateOfBirth || '1985-05-15',
        occupation: candidateData.occupation || 'Civil Servant & Church Worker',
        maritalStatus: candidateData.maritalStatus || 'married',
        dateJoinedChurch: candidateData.dateJoinedChurch || '2005-06-12',
        baptismDate: candidateData.baptismDate || '2005-11-20',
        currentRank: candidateData.currentRank || 'Pastor',
        currentRankYear: rankYear,
        tenureYears: tenure,
        tenureValid: tenure >= (matchedRank?.minimumYearsInCurrentRank || 3),
        targetRankId: candidateData.targetRankId || matchedRank?.id || 'rank_evangelist',
        targetRankName: candidateData.targetRankName || 'Evangelist',
        province: candidateData.province || 'Lagos Central Province',
        district: candidateData.district || 'Surulere District',
        parish: candidateData.parish || 'Mount Zion Cathedral Branch',
        branchPriestName: candidateData.branchPriestName || 'Senior Apostle Festus Okon',
        stage: 'nominated',
        currentVettingTier: 'branch',
        submissionDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
        attendanceRecordPercentage: 94,
        conductRating: 'exemplary',
        duesStatus: 'pending',
        duesAmountPaid: 0,
        levyBreakdown: matchedRank?.levyBreakdown || {
          branchLevy: 15000,
          districtLevy: 15000,
          provincialLevy: 20000,
          nationalFee: 30000,
          total: 80000,
        },
        tierApprovals: {
          branch: { approved: false },
          district: { approved: false },
          province: { approved: false },
          cmc: { approved: false },
          national: { approved: false },
        },
        screeningNotes: candidateData.screeningNotes || ['Nomination created in portal.'],
      };

      data.candidates.unshift(newRecord);
      data.auditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        performedBy: 'Parish Leader / System',
        action: 'CREATE_NOMINATION',
        candidateId: id,
        details: `Nomination created for ${newRecord.fullName} (${newRecord.regNumber}) for rank: ${newRecord.targetRankName}.`,
      });

      writeDb(data);
      return newRecord;
    },

    update: (id: string, updates: Partial<CandidateProfile>): CandidateProfile | null => {
      const data = readDb();
      const index = data.candidates.findIndex((c) => c.id === id);
      if (index === -1) return null;

      data.candidates[index] = {
        ...data.candidates[index],
        ...updates,
        lastUpdated: new Date().toISOString().split('T')[0],
      };

      data.auditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        performedBy: 'Portal Administrator',
        action: 'UPDATE_CANDIDATE',
        candidateId: id,
        details: `Updated stage to ${data.candidates[index].stage} / tier: ${data.candidates[index].currentVettingTier}`,
      });

      writeDb(data);
      return data.candidates[index];
    },
  },

  users: {
    authenticate: (identifier: string, section?: 'candidate' | 'admin', password?: string): (UserSession & { requires2FA?: boolean }) | null => {
      const data = readDb();
      const trimmed = (identifier || '').trim().toLowerCase();

      // Find user by email or candidateId or regNumber
      let user = data.users.find(
        (u) =>
          u.email.toLowerCase() === trimmed ||
          u.userId === trimmed ||
          (u.candidateId && trimmed.includes('ord'))
      );

      if (!user) {
        // Match candidate record if exists
        const cand = data.candidates.find(
          (c) =>
            c.email.toLowerCase() === trimmed ||
            c.regNumber.toLowerCase() === trimmed ||
            c.id.toLowerCase() === trimmed
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
          };
          data.users.push(user);
          writeDb(data);
        } else if (section === 'admin') {
          user = data.users.find((u) => u.role === 'super_admin') || data.users[1];
        } else {
          user = data.users.find((u) => u.role === 'candidate') || data.users[0];
        }
      }

      return user ? { ...user } : null;
    },

    register: (params: {
      fullName: string;
      email: string;
      phone: string;
      gender: 'male' | 'female';
      currentRank: string;
      targetRankName: string;
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

      const matchedRank = ESOCS_RANKS.find((r) => r.name.toLowerCase() === params.targetRankName.toLowerCase());

      const candidate: CandidateProfile = {
        id: candidateId,
        regNumber,
        fullName: params.fullName,
        email: params.email,
        phone: params.phone,
        gender: params.gender,
        dateOfBirth: '1988-06-15',
        occupation: 'Ecclesiastical Worker / Member',
        maritalStatus: 'married',
        dateJoinedChurch: '2010-04-12',
        baptismDate: '2010-09-18',
        currentRank: params.currentRank,
        currentRankYear: 2022,
        tenureYears: 4,
        tenureValid: true,
        targetRankId: matchedRank?.id || `rank_${params.targetRankName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        targetRankName: params.targetRankName,
        province: params.province,
        district: params.district || 'General District',
        parish: params.parish,
        branchPriestName: 'Parish Presiding Officer',
        stage: 'nominated',
        currentVettingTier: 'branch',
        submissionDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
        attendanceRecordPercentage: 95,
        conductRating: 'exemplary',
        duesStatus: 'pending',
        duesAmountPaid: 0,
        levyBreakdown: matchedRank?.levyBreakdown || {
          branchLevy: 15000,
          districtLevy: 15000,
          provincialLevy: 20000,
          nationalFee: 30000,
          total: 80000,
        },
        tierApprovals: {
          branch: { approved: false },
          district: { approved: false },
          province: { approved: false },
          cmc: { approved: false },
          national: { approved: false },
        },
        screeningNotes: ['Self-registered through ESOCS Ordination Portal. Queued for Branch / Parish Leader initial review.'],
      };

      const user: UserSession & { passwordHash?: string } = {
        userId: `user-${candidateId}`,
        name: params.fullName,
        email: params.email,
        role: 'candidate',
        roleTitle: 'Ordinand Candidate',
        jurisdiction: `${params.parish}, ${params.province}`,
        candidateId: candidateId,
        passwordHash: params.password,
      };

      data.candidates.unshift(candidate);
      data.users.push(user);
      data.auditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        performedBy: params.fullName,
        action: 'SELF_REGISTRATION',
        candidateId,
        details: `Candidate self-registered with Reg Number ${regNumber} for ordination rank: ${params.targetRankName}.`,
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
          details: `Password reset successfully for ${user.email}.`,
        });
        writeDb(data);
        return true;
      }
      return false;
    },

    changePassword: (userId: string, newPassword: string): boolean => {
      const data = readDb();
      const user = data.users.find((u) => u.userId === userId);
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

    getAll: (): UserSession[] => {
      return readDb().users;
    },
  },

  analytics: {
    getSummary: () => {
      const data = readDb();
      const total = data.candidates.length;
      const totalDues = data.candidates.reduce((sum, c) => sum + (c.duesAmountPaid || 0), 0);
      const cleared = data.candidates.filter((c) => c.duesStatus === 'cleared').length;
      const ordained = data.candidates.filter((c) => c.stage === 'ordained').length;
      const pendingScreening = data.candidates.filter((c) => ['nominated', 'branch_approved', 'district_approved', 'province_approved', 'screening_in_progress'].includes(c.stage)).length;
      const approvedByBoard = data.candidates.filter((c) => ['theology_assessed', 'cmc_approved', 'board_approved', 'investiture_assigned'].includes(c.stage)).length;

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
  },
};
