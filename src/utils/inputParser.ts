export interface InputRequirement {
    prompt: string;
    type: "text" | "number";
}

export const analyzeRequirements = async (code: string): Promise<{ requiresInput: boolean; inputs: InputRequirement[] }> => {
    const requiresInput = code.includes("Scanner") && (code.includes("next") || code.includes("nextInt") || code.includes("nextLine"));
    return {
        requiresInput,
        inputs: requiresInput ? [{ prompt: "Enter input for Scanner:", type: "text" }] : []
    };
};
