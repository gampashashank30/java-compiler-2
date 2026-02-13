
export interface InputRequirement {
    prompt: string;
    type: string;
}

export const analyzeRequirements = async (code: string): Promise<{ requiresInput: boolean; inputs: InputRequirement[] }> => {
    const requiresInput = code.includes("scanf");
    return {
        requiresInput,
        inputs: requiresInput ? [{ prompt: "Enter value:", type: "text" }] : []
    };
};
