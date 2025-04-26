// Study Data Types
export interface TestResult {
  id: string;
  score: number;
  totalPossible: number;
  date: string;
}

export interface Subject {
  id: string;
  name: string;
  testResults: TestResult[];
}

export interface StudyHabits {
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  sessionDuration: number;
  daysPerWeek: number;
  focusLevel: 'low' | 'medium' | 'high';
}

export interface StudyData {
  name: string;
  subjects: Subject[];
  studyHabits: StudyHabits;
}

// Schedule Data Types
export interface SubjectSchedule {
  subject: string;
  startTime: string;
  endTime: string;
  focusArea: string;
  priority: 'low' | 'medium' | 'high';
}

export interface DailySchedule {
  date: string;
  schedule: SubjectSchedule[];
}

export interface SubjectAnalysis {
  name: string;
  timeAllocation: number; // hours
  currentPerformance: number; // percentage
  weakAreas: string[];
  expectedImprovement: number; // percentage points increase
}

export interface ScheduleData {
  weeklySchedules: DailySchedule[][];
  subjectAnalysis: SubjectAnalysis[];
  recommendation: string;
  overallImprovement: number; // percentage
}