export interface SelfCareItem {
  id: string;
  title: string;
  desc: string;
  checked: boolean;
}

export interface MoodEntry {
  date: string;
  score: number;
}

export interface ReframeEntry {
  id: string;
  thought: string;
  challenge: string;
  balanced: string;
  createdAt: number;
}

export interface LetterEntry {
  id: string;
  text: string;
  createdAt: number;
  unlockAt: number;
  duration: number;
  isOpen: boolean;
  moodTag: string;
}

export interface IdentityData {
  values: string[];
  reclaim: string[];
  becoming: string;
}

export interface UrgeEntry {
  id: string;
  category: string;
  timestamp: number;
}

export interface ProfileCheck {
  id: string;
  timestamp: number;
}

export interface UnsentLetter {
  id: string;
  text: string;
  category: string;
  createdAt: number;
}

export interface VoiceEntry {
  id: string;
  title: string;
  duration: number;
  timestamp: number;
}

export interface DashboardDay {
  date: string;
  sleep?: number;
  meals?: number;
  exercised?: boolean;
}

export interface MendState {
  streak: number;
  lastActiveDate: string | null;
  griefStage: string | null;
  ncStart: string | null;
  moodHistory: MoodEntry[];
  reframes: ReframeEntry[];
  realityChecks: string[];
  selfCareItems: SelfCareItem[];
  customChecklistItems: SelfCareItem[];
  letters: LetterEntry[];
  identity: IdentityData;
}
