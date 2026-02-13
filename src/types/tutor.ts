export type TutorPhase =
    | 'welcome'
    | 'concept'
    | 'quiz'
    | 'logic'
    | 'code'
    | 'success';

export interface ConceptData {
    title: string;
    explanation: string;
    examples: string[];
}

export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

export interface LogicValidation {
    is_correct: boolean;
    correct_approach?: string;
    feedback?: string;
}

export interface CodeEvaluation {
    status: 'success' | 'error';
    feedback: string;
}

export interface TutorSession {
    topic: string;
    phase: TutorPhase;
    startedAt: Date;
    completedAt?: Date;
    conceptData?: ConceptData;
    quizQuestions: QuizQuestion[];
    quizAnswers: Record<number, number>;
    quizScore: number;
    logicSubmission: string;
    logicValidation?: LogicValidation;
    codeSubmission: string;
    codeEvaluation?: CodeEvaluation;
}
