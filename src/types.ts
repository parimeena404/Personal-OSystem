export type ModuleId =
  | 'dashboard'
  | 'brain'
  | 'projects'
  | 'factory'
  | 'automation'
  | 'graph'
  | 'voice'
  | 'settings';

export interface ModuleInfo {
  id: ModuleId;
  label: string;
  description: string;
  iconName: string;
}

export interface MemoryNode {
  id: string;
  title: string;
  category: 'pdf' | 'note' | 'web' | 'idea' | 'voice';
  content: string;
  createdAt: string;
  connections: string[]; // Related node IDs
  tags: string[];
}

export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  estimatedHours: number;
  aiRiskText?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  tasks: Task[];
  timeline: string;
  riskRating: 'low' | 'medium' | 'critical';
  aiReport?: string;
}

export interface ContentFactoryOutput {
  linkedin: string;
  twitter: string;
  newsletter: string;
  executiveSummary: string;
  marketingPitch: string;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  active: boolean;
  lastExecuted?: string;
}

export interface ExecutiveInsight {
  highRoiTask: string;
  roiExplanation: string;
  greatestRisk: string;
  bottleneck: string;
  learningRecommendation: string;
  careerOpportunity: string;
  decisionRecommendation: string;
  weeklyGoalProgress: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
}
