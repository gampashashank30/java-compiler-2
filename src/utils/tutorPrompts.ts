import { ConceptData } from "@/types/tutor";

export const generateConceptIntroductionPrompt = (topic: string) => {
    return `Explain the concept of "${topic}" in C programming...`;
};

export const generateQuizQuestionsPrompt = (topic: string, concept: ConceptData) => {
    return `Generate 3 quiz questions about ${topic}...`;
};

export const validateLogicPrompt = (topic: string, logic: string) => {
    return `Validate this logic for solving ${topic}: ${logic}`;
};

export const evaluateCodePrompt = (topic: string, code: string, expectedLogic: string) => {
    return `Evaluate this C code for ${topic}: ${code}`;
};

export const createSystemPrompt = (phase: string) => {
    return `You are a helpful C programming tutor assisting with the ${phase} phase.`;
};
