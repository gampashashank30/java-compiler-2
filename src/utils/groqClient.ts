
export const callGroqAPI = async (messages: any[]) => {
    // Mock response to prevent API key errors during preview
    return {
        status: "OPTIMAL",
        message: "AI analysis mock response.",
        summary: "Code looks good.",
        explanation: "This is a placeholder response from the reconstructed project.",
        root_cause: []
    };
};
