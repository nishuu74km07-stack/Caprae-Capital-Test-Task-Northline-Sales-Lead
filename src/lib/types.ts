export const SOURCE_NAMES = ["Google Maps", "State Registry", "Industry Directory"] as const;

export type SourceName = (typeof SOURCE_NAMES)[number];

export type RawRecord = {
  id: string;
  source: SourceName;
  listedName: string;
  website: string;
  domain: string;
  industry: string;
  city: string;
  state: string;
  employees: number | null;
  founded: number | null;
  ownerName: string;
  ownerTitle: string;
  publicPhone: string;
  description: string;
  signal: string;
  isFranchise: boolean;
  email: string;
  directPhone: string;
  linkedin: string;
  ownerTenure: number | null;
};

export type BuyBox = {
  searcherName: string;
  firmName: string;
  industries: string[];
  states: string[];
  revenueMin: number;
  revenueMax: number;
  employeesMin: number;
  employeesMax: number;
  minYears: number;
  ownerOnly: boolean;
  creditAllowance: number;
};

export type LeadStatus = "new" | "shortlisted" | "outreach" | "conversation" | "passed";

export type ScoreReason = {
  label: string;
  points: number;
  applied: boolean;
};

export type RevenueEstimate = {
  low: number | null;
  high: number | null;
  midpoint: number | null;
  confidence: "low" | "medium" | "high";
};

export type EmailCheck = {
  valid: boolean;
  roleAccount: boolean;
  note: string;
};

export type LeadSource = {
  id: string;
  source: SourceName;
  listedName: string;
  position: number;
};

export type CompanyFacts = {
  id: string;
  name: string;
  website: string;
  domain: string;
  industry: string;
  city: string;
  state: string;
  employees: number | null;
  founded: number | null;
  ownerName: string;
  ownerTitle: string;
  publicPhone: string;
  description: string;
  signal: string;
  isFranchise: boolean;
  email: string;
  directPhone: string;
  linkedin: string;
  ownerTenure: number | null;
  sources: LeadSource[];
};

export type SavedLeadState = {
  status: LeadStatus;
  enriched: boolean;
  outreachDraft: string;
};

export type Lead = {
  id: string;
  name: string;
  website: string;
  domain: string;
  industry: string;
  city: string;
  state: string;
  employees: number | null;
  founded: number | null;
  yearsOperating: number | null;
  ownerName: string;
  ownerTitle: string;
  publicPhone: string;
  phoneValid: boolean;
  description: string;
  signal: string;
  isFranchise: boolean;
  sources: LeadSource[];
  status: LeadStatus;
  enriched: boolean;
  revenue: RevenueEstimate;
  fitScore: number;
  fitReasons: ScoreReason[];
  qualityScore: number;
  qualityNotes: string[];
  email: string;
  directPhone: string;
  linkedin: string;
  ownerTenure: number | null;
  outreachDraft: string;
};

export type PublicLead = Omit<Lead, "email" | "directPhone" | "linkedin" | "ownerTenure"> & {
  email: string | null;
  directPhone: string | null;
  linkedin: string | null;
  ownerTenure: number | null;
  emailCheck: EmailCheck | null;
};

export type CreditComparison = {
  budget: number;
  scrapeOrderInBox: number;
  rankedInBox: number;
  duplicateSpend: number;
  scrapeOrderInBoxIds: string[];
};

export type IndustryStat = {
  industry: string;
  total: number;
  inBox: number;
};

export type Stats = {
  rawCount: number;
  companyCount: number;
  duplicatesRemoved: number;
  inBox: number;
  stillToCall: number;
  shortlisted: number;
  outreach: number;
  conversations: number;
  passed: number;
  enriched: number;
  withOwner: number;
  credits: { allowance: number; used: number; remaining: number };
  creditComparison: CreditComparison;
  comparisonSentence: string;
  byIndustry: IndustryStat[];
  queue: PublicLead[];
};

export type SimulationCompany = {
  id: string;
  name: string;
  fitScore: number;
  industry: string;
  state: string;
};

export type SimulationBase = {
  scrapeOrder: string[];
  companies: SimulationCompany[];
};

export type Workspace = {
  buyBox: BuyBox;
  leads: PublicLead[];
  stats: Stats;
  simulation: SimulationBase;
};
