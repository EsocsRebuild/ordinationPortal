export type UserRole =
  | 'candidate'
  | 'parish_leader'
  | 'screening_officer'
  | 'advisory_board'
  | 'super_admin';

export type Gender = 'male' | 'female';

export type VettingTier = 'branch' | 'district' | 'province' | 'cmc' | 'national';

export type OrdinationStage =
  | 'draft'
  | 'nominated'
  | 'parish_endorsed'
  | 'branch_approved'
  | 'district_approved'
  | 'province_approved'
  | 'screening_in_progress'
  | 'theology_assessed'
  | 'cmc_approved'
  | 'board_approved'
  | 'clearance_completed'
  | 'investiture_assigned'
  | 'ordained'
  | 'deferred'
  | 'rejected';

export interface MandatoryLevyBreakdown {
  branchLevy: number;
  districtLevy: number;
  provincialLevy: number;
  nationalFee: number;
  total: number;
}

export interface EcclesiasticalRank {
  id: string;
  name: string;
  shortCode: string;
  orderLevel: number;
  genderEligibility: 'male' | 'female' | 'both';
  prerequisiteRankId?: string;
  prerequisiteRankName?: string;
  minimumYearsInCurrentRank: number;
  robingCategory: 'White_Gold' | 'Purple_Gold' | 'Red_Gold' | 'Black_Gold' | 'Special_Insignia' | 'White' | 'Pink' | 'Yellow' | 'Blue' | 'Green';
  liturgicalColor?: string;
  badgeColor?: string;
  theologicalRequirements: string[];
  description: string;
  levyBreakdown: MandatoryLevyBreakdown;
}

export interface TierApprovalRecord {
  approved: boolean;
  approverName?: string;
  approverRole?: string;
  date?: string;
  comments?: string;
}

export interface ParishBranch {
  id: string;
  name: string;
  housesOfPrayer: string[];
}

export interface DistrictHierarchy {
  id: string;
  name: string;
  branches: ParishBranch[];
}

export interface ProvinceHierarchy {
  id: string;
  name: string;
  shortCode: string;
  districts: DistrictHierarchy[];
}

export interface CandidateProfile {
  id: string;
  regNumber: string; // e.g. "ESOCS/ORD/2026/0481"
  fullName: string;
  email: string;
  phone: string;
  gender: Gender;
  dateOfBirth: string;
  occupation: string;
  maritalStatus: 'single' | 'married' | 'widowed';
  dateJoinedChurch: string;
  baptismDate: string;
  currentRank: string;
  currentRankYear: number;
  targetRankId: string;
  targetRankName: string;
  province: string;
  district: string;
  parish: string;
  houseOfPrayer?: string;
  branchPriestName: string;
  avatarUrl?: string;
  
  // Progress & Multi-Tier Governance
  stage: OrdinationStage;
  currentVettingTier: VettingTier;
  submissionDate: string;
  lastUpdated: string;
  
  // Multi-Tier Approvals
  tierApprovals?: {
    branch?: TierApprovalRecord;
    district?: TierApprovalRecord;
    province?: TierApprovalRecord;
    cmc?: TierApprovalRecord;
    national?: TierApprovalRecord;
  };

  // Tenure Validation
  tenureYears?: number;
  tenureValid?: boolean;
  tenureWarning?: string;
  
  // Vetting & Scores
  theologyScore?: number; // out of 100
  interviewScore?: number; // out of 100
  attendanceRecordPercentage: number;
  conductRating: 'exemplary' | 'good' | 'average' | 'needs_improvement';
  screeningNotes?: string[];
  flaggedIssues?: string[];
  
  // Clearance & Fees
  duesStatus: 'cleared' | 'pending' | 'partial' | 'exempted';
  duesAmountPaid: number;
  receiptNumber?: string;
  levyBreakdown?: MandatoryLevyBreakdown;
  
  // Robing & Investiture
  investitureSession?: string;
  seatNumber?: string;
  robingOfficer?: string;
  ordinationDate?: string;
  ordinationTime?: string;
  ordinationVenue?: string;
  emailDispatchDate?: string;
  passportPhotoUrl?: string;
  
  // Certificate & Anti-forgery
  certificateNumber?: string;
  verificationHash?: string;
  dateOrdained?: string;

  // Live Ordination Day Accreditation & Attendance
  isCheckedIn?: boolean;
  checkInTimestamp?: string;
  accreditedBy?: string;
  accreditationNotes?: string;
}

export interface NominationRequest {
  id: string;
  candidateId: string;
  candidateName: string;
  parish: string;
  district: string;
  province: string;
  currentRank: string;
  proposedRank: string;
  parishLeaderName: string;
  parishLeaderNotes: string;
  submissionDate: string;
  status: 'pending_review' | 'endorsed' | 'rejected';
}

export interface ScreeningReview {
  candidateId: string;
  reviewerId: string;
  reviewerName: string;
  reviewedAt: string;
  theologyExamScore: number;
  oralInterviewScore: number;
  spiritualDisciplineScore: number;
  liturgicalCompetenceScore: number;
  totalScore: number;
  decision: 'recommend' | 'defer' | 'reject';
  committeeComments: string;
  prerequisitesVerified: {
    baptismalCertificate: boolean;
    priorOrdinationCredential: boolean;
    marriageCertificateOrVow: boolean;
    parishStandingLetter: boolean;
    theologySchoolDiploma: boolean;
  };
}

export interface CertificateRecord {
  certificateNumber: string;
  candidateId: string;
  fullName: string;
  rankConferred: string;
  province: string;
  dateOfConferment: string;
  supremeHeadSignature: string;
  secretaryGeneralSignature: string;
  tamperProofHash: string;
  qrPayload: string;
  status: 'valid' | 'revoked' | 'suspended';
}

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  jurisdiction: string; // e.g. "Mount Zion Cathedral, Lagos Central Province"
  candidateId?: string; // If candidate role
}

export interface InAppMessage {
  id: string;
  candidateId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  isRead: boolean;
  category?: 'general' | 'screening' | 'robing' | 'secretariat';
}
