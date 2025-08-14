export interface Classroom {
  id: number;
  name: string;
  grade: string;
  section: string;
  year: string;
  createdDate: string;
}

export interface Student {
  id: number;
  studentId: string;
  name: string;
  grade: string;
  age: string | number;
  gender?: string;
  fullNameWithTitle?: string;
  birthDate?: any;
  citizenId?: string;
  classroomId: number;
  createdDate: string;
}

export interface Assessment {
  id: number;
  studentId: number;
  studentName: string;
  classroomId: number;
  date: string;
  responses: Record<number, number>;
  impactResponses?: {
    hasProblems: number;
    duration?: number;
    distress?: number;
    impactFriends?: number;
    impactLearning?: number;
    burdenOthers?: number;
  };
  completed: boolean;
  scores?: SDQScores;
  interpretations?: SDQInterpretations;
  completedDate?: string;
}

export interface SDQScores {
  emotional: number;
  conduct: number;
  hyperactivity: number;
  peer: number;
  prosocial: number;
  totalDifficulties: number;
}

export interface SDQInterpretations {
  emotional: string;
  conduct: string;
  hyperactivity: string;
  peer: string;
  prosocial: string;
  totalDifficulties: string;
}

export interface PreviewStudent {
  id: number;
  studentId: string;
  name: string;
  grade: string;
  age: string | number;
  gender: string;
}

export interface AssessmentStatus {
  status: 'completed' | 'pending-impact' | 'in-progress' | 'not-started';
  label: string;
  color: string;
  date: string;
  progress?: string;
}