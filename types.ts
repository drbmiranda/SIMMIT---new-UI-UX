import { Chat } from "@google/genai";

export type UserRole = 'aluno' | 'question_generator' | 'pathway';

export interface GameMessage {
  id: string;
  sender: 'Jogador' | 'Paciente' | 'SIMMIT';
  text: string;
  imageUrl?: string;
  isLoadingImage?: boolean;
  imagePrompt?: string; // Store the prompt that triggered image generation
  timestamp: number;
  scoreChange?: { change: number; reason: string };
}

export enum ModelNames {
  GEMINI = 'gemini-2.5-flash',
  IMAGEN = 'imagen-3.0-generate-002',
}

export interface OsceCaseData {
  cenarioDoAluno: string;
  tarefasDoAluno: string[];
  instrucoesDoPaciente: string;
  criteriosDeAvaliacao: string[];
}

export interface MultipleChoiceQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface PerformanceAnalysis {
  strengths: string[];
  improvements: string[];
}

export type MedicalSubject = 'Clínica Médica' | 'Clínica Cirúrgica' | 'Medicina Preventiva' | 'Pediatria' | 'Ginecologia e Obstetrícia';
export type UserStatus = 'Estudante' | 'Médico(a)';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          updated_at: string;
          full_name: string;
          status: UserStatus;
          crm: string | null;
          registration_number: string | null;
          university: string | null;
        };
        Insert: {
          id: string;
          updated_at?: string;
          full_name: string;
          status: UserStatus;
          crm: string | null;
          registration_number: string | null;
          university: string | null;
        };
        Update: {
          id?: string;
          updated_at?: string;
          full_name?: string;
          status?: UserStatus;
          crm?: string | null;
          registration_number?: string | null;
          university?: string | null;
        };
        Relationships: [];
      };
      simulation_results: {
        Row: {
          id: number;
          created_at: string;
          user_id: string;
          subject: MedicalSubject;
          final_score: number;
          feedback_text: string;
          osce_case: string;
        };
        Insert: {
          id?: number;
          created_at?: string;
          user_id: string;
          subject: MedicalSubject;
          final_score: number;
          feedback_text: string;
          osce_case: string;
        };
        Update: {
          id?: number;
          created_at?: string;
          user_id?: string;
          subject?: MedicalSubject;
          final_score?: number;
          feedback_text?: string;
          osce_case?: string;
        };
        Relationships: [];
      };
      error_reports: {
        Row: {
          id: number;
          created_at: string;
          user_role: UserRole | null;
          subject: string | null;
          game_log: GameMessage[] | null;
          osce_case: string | null;
          user_id: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          user_role?: UserRole | null;
          subject?: string | null;
          game_log?: GameMessage[] | null;
          osce_case?: string | null;
          user_id?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          user_role?: UserRole | null;
          subject?: string | null;
          game_log?: GameMessage[] | null;
          osce_case?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      gamification_state: {
        Row: {
          user_id: string;
          updated_at: string;
          state: any;
        };
        Insert: {
          user_id: string;
          updated_at?: string;
          state: any;
        };
        Update: {
          user_id?: string;
          updated_at?: string;
          state?: any;
        };
        Relationships: [];
      };
      pathway_checkpoints: {
        Row: {
          id: string;
          user_id: string;
          sort_order: number;
          title: string;
          focus: string;
          status: string;
          window_label: string;
          note: string;
          source: string;
          generated_for_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          sort_order: number;
          title: string;
          focus: string;
          status: string;
          window_label: string;
          note: string;
          source?: string;
          generated_for_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          sort_order?: number;
          title?: string;
          focus?: string;
          status?: string;
          window_label?: string;
          note?: string;
          source?: string;
          generated_for_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      medical_subject: MedicalSubject;
      user_status: UserStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export interface Profile {
  id: string;
  updated_at: string;
  full_name: string;
  status: UserStatus;
  crm: string | null;
  registration_number: string | null;
  university: string | null;
}

export interface AppState {
  chatSession: Chat | null;
  gameLog: GameMessage[];
  userInput: string;
  isLoading: boolean; // For Gemini text response
  isGameStarted: boolean;
  error: string | null;
  userRole: UserRole | null;
  selectedSubject: MedicalSubject | null; // Added this line
  isCaseFinished: boolean;
  showFeedback: boolean;
  feedbackText: string | null;
  currentOsceCase: string | null; // Stores the full text for the teacher/feedback
  runningScore: number;
  scoreNotification: { change: number; reason: string } | null;
  activeActivity: 'simulation' | 'flashcards' | 'question_bank' | 'pdf_questions' | 'pdf_flashcards' | null;
  rewardedForCurrentCase: boolean;
  isTutorialActive: boolean;
}

export type SimulationResult = Database['public']['Tables']['simulation_results']['Row'];







