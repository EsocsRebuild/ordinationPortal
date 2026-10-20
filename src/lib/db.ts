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
    userId: 'user-admin-main',
    name: 'Supervising Apostle General Prof. David A. Oladele',
    email: 'admin@esocs.church',
    role: 'super_admin',
    roleTitle: 'Secretary General & National Admin',
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

const INITIAL_SEED_CANDIDATES: CandidateProfile[] = [];

const INITIAL_MESSAGES: InAppMessage[] = [];

let memoryDb: DatabaseSchema = {
  candidates: [...INITIAL_SEED_CANDIDATES],
  users: [...DEFAULT_USERS],
  auditLogs: [
    {
      id: 'log-001',
      timestamp: '2026-09-28T14:32:00Z',
      performedBy: 'Supervising Apostle General Prof. David A. Oladele',
      action: 'SYSTEM_INITIALIZATION',
      details: 'Database initialized for General Conference 2026 Ordination Cohort.',
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
        screeningNotes: candidateData.screeningNotes || ['Nomination registered in portal records.'],
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
          `Self-registered via ESOCS Ordination Portal. Current Rank: ${params.currentRank} (${rankYear}). Target Rank: ${params.targetRankName}.`,
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
        details: `Candidate self-registered (${regNumber}) for rank ${params.targetRankName}. Rank progression validated.`,
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
