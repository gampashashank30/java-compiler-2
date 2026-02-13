import { ConceptData } from "@/types/tutor";

export const generateConceptIntroductionPrompt = (topic: string) => {
    return `Explain the concept of "${topic}" in Java programming.
    Return JSON ONLY:
    {
      "title": "Topic Title",
      "explanation": "Clear, simple explanation.",
      "examples": ["Example code or analogy 1", "Example code or analogy 2"]
    }`;
};

export const generateQuizQuestionsPrompt = (topic: string, concept: ConceptData) => {
    return `Generate 3 multiple-choice quiz questions about ${topic} in Java.
    Return JSON ONLY:
    {
      "questions": [
        {
          "id": 1,
          "question": "Question text?",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": 0, // index of correct option
          "explanation": "Why it is correct"
        }
      ]
    }`;
};

export const validateLogicPrompt = (topic: string, logic: string) => {
    return `Validate this logic for solving ${topic} in Java: "${logic}"
    Return JSON ONLY:
    {
      "is_correct": boolean,
      "correct_approach": "Better approach if needed, else same",
      "feedback": "Constructive feedback"
    }`;
};

export const evaluateCodePrompt = (topic: string, code: string, expectedLogic: string) => {
    return `Evaluate this Java code for ${topic}. Expected logic: ${expectedLogic}. 
    Code:
    ${code}
    
    Return JSON ONLY:
    {
      "status": "success" | "error",
      "feedback": "Specific feedback on syntax, logic, or style. Be encouraging."
    }`;
};

export const createSystemPrompt = (phase: string) => {
    return `You are a helpful and supportive Java programming tutor assisting with the ${phase} phase. Always return strictly valid JSON. No markdown formatting.`;
};
