import { useState, useEffect } from 'react';
import { TutorSession, TutorPhase, ConceptExplanation, QuizQuestion, LogicValidation, CodeEvaluation } from '@/types/tutor';

const STORAGE_KEY = 'tutor_session';

const createEmptySession = (): TutorSession => ({
    phase: 'welcome',
    topic: '',
    conceptData: null,
    quizQuestions: [],
    quizAnswers: {},
    quizScore: 0,
    logicSubmission: '',
    logicValidation: null,
    codeSubmission: '',
    codeEvaluation: null,
    startedAt: new Date().toISOString(),
});

export const useTutorSession = () => {
    const [session, setSession] = useState<TutorSession>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);

                // Validate session state - ensure phase matches available data
                if (parsed.phase === 'concept' && !parsed.conceptData) {
                    return createEmptySession();
                }
                if (parsed.phase === 'quiz' && (!parsed.quizQuestions || parsed.quizQuestions.length === 0)) {
                    return createEmptySession();
                }
                if (parsed.phase === 'logic' && !parsed.topic) {
                    return createEmptySession();
                }
                if (parsed.phase === 'code' && !parsed.topic) {
                    return createEmptySession();
                }
                if (parsed.phase === 'success' && !parsed.completedAt) {
                    return createEmptySession();
                }

                return parsed;
            }
        } catch (e) {
            console.error('Failed to load tutor session:', e);
        }
        return createEmptySession();
    });

    // Persist session to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        } catch (e) {
            console.error('Failed to save tutor session:', e);
        }
    }, [session]);

    const startNewSession = (topic: string, conceptData: ConceptExplanation) => {
        setSession({
            ...createEmptySession(),
            topic,
            conceptData,
            phase: 'concept',
            startedAt: new Date().toISOString(),
        });
    };

    const setPhase = (phase: TutorPhase) => {
        setSession(prev => ({ ...prev, phase }));
    };

    const setConceptData = (data: ConceptExplanation) => {
        setSession(prev => ({ ...prev, conceptData: data }));
    };

    const setQuizQuestions = (questions: QuizQuestion[]) => {
        setSession(prev => ({ ...prev, quizQuestions: questions }));
    };

    const submitQuizAnswer = (questionIndex: number, answerIndex: number) => {
        setSession(prev => ({
            ...prev,
            quizAnswers: {
                ...prev.quizAnswers,
                [questionIndex]: answerIndex,
            },
        }));
    };

    const calculateQuizScore = (): number => {
        const correct = session.quizQuestions.filter(
            (q, idx) => session.quizAnswers[idx] === q.correct_answer
        ).length;

        setSession(prev => ({ ...prev, quizScore: correct }));
        return correct;
    };

    const setLogicSubmission = (logic: string) => {
        setSession(prev => ({ ...prev, logicSubmission: logic }));
    };

    const setLogicValidation = (validation: LogicValidation) => {
        setSession(prev => ({ ...prev, logicValidation: validation }));
    };

    const setCodeSubmission = (code: string) => {
        setSession(prev => ({ ...prev, codeSubmission: code }));
    };

    const setCodeEvaluation = (evaluation: CodeEvaluation) => {
        setSession(prev => ({ ...prev, codeEvaluation: evaluation }));
    };

    const completeSession = () => {
        setSession(prev => ({
            ...prev,
            phase: 'success',
            completedAt: new Date().toISOString(),
        }));
    };

    const resetSession = () => {
        setSession(createEmptySession());
    };

    return {
        session,
        startNewSession,
        setPhase,
        setConceptData,
        setQuizQuestions,
        submitQuizAnswer,
        calculateQuizScore,
        setLogicSubmission,
        setLogicValidation,
        setCodeSubmission,
        setCodeEvaluation,
        completeSession,
        resetSession,
    };
};
