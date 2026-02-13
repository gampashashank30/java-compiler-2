import { useState, useRef, useEffect } from "react";
import CodeEditor from "@/components/CodeEditor";
import ConsoleOutput from "@/components/ConsoleOutput";
import AIExplanation from "@/components/AIExplanation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Sparkles, BookOpen, Code2, Download, Wand2 } from "lucide-react";
import { analyzeCode } from "@/utils/codeAnalysis"; // IMPORT NEW UTIL
import InputModal from "@/components/InputModal";
import { InputRequirement } from "@/utils/inputParser";
import { useLocalStorage } from "@/hooks/useLocalStorage"; // IMPORT PERSISTENT STATE HOOK

import { toast } from "sonner";
import { Link } from "react-router-dom";


const defaultCode = `public class Main {
    public static void main(String[] args) {
        int a = 10;
        int b = 20;
        int sum = a + b;
        
        System.out.println("Sum = " + sum);
    }
}`;

// Reusable Lexical Scan Function for Java
const lexicalScan = (sourceCode: string) => {
    const lines = sourceCode.split('\n');
    const errors: string[] = [];
    const warnings: string[] = [];

    let parenCount = 0; // ()
    let braceCount = 0; // {}
    let bracketCount = 0; // []

    const keywords = ["public", "class", "static", "void", "main", "String", "int", "float", "double", "if", "else", "for", "while", "return", "System", "out", "println"];

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        const lineNum = index + 1;

        if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*")) return;

        // 0. ENTRY POINT CHECK (Priority)
        const isMainLine = trimmed.includes("public static void main");
        if (trimmed.includes("class Main") && !trimmed.includes("public")) errors.push(`Line ${lineNum}: Class 'Main' should be public.`);

        // Check for Typos in Keywords
        let hasTypo = false;
        if (trimmed.includes("sytem") || trimmed.includes("Sytem")) { errors.push(`Syntax Error on Line ${lineNum}: Typo in 'System'.`); hasTypo = true; }
        if (trimmed.includes("printl ") && !trimmed.includes("println")) { errors.push(`Syntax Error on Line ${lineNum}: Typo 'printl' detected.`); hasTypo = true; }

        // Check for Missing Semicolon
        const needsSemicolon = !hasTypo &&
            (trimmed.includes("=") || trimmed.startsWith("return") || trimmed.includes("System.out") || trimmed.includes("int ") || trimmed.includes("String "))
            && !trimmed.endsWith(";")
            && !trimmed.endsWith("{")
            && !trimmed.endsWith("}")
            && !trimmed.endsWith(")")
            && !trimmed.startsWith("if")
            && !trimmed.startsWith("for")
            && !trimmed.startsWith("while")
            && !trimmed.startsWith("public class")
            && !trimmed.startsWith("package")
            && !trimmed.startsWith("import")
            && !trimmed.startsWith("//")
            && !trimmed.startsWith("@") // Annotations
            && !trimmed.startsWith("public static void");

        if (needsSemicolon) {
            errors.push(`Missing Semicolon Error on Line ${lineNum}: Statements must end with ';'`);
        }

        // Balance Checking
        for (const char of line) {
            if (char === '(') parenCount++;
            if (char === ')') parenCount--;
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
            if (char === '[') bracketCount++;
            if (char === ']') bracketCount--;
        }
    });

    if (parenCount !== 0) errors.push(`Unbalanced Delimiter: Found ${Math.abs(parenCount)} unclosed/extra parentheses '()'`);
    if (braceCount !== 0) errors.push(`Unbalanced Delimiter: Found ${Math.abs(braceCount)} unclosed/extra braces '{}'`);
    if (bracketCount !== 0) errors.push(`Unbalanced Delimiter: Found ${Math.abs(bracketCount)} unclosed/extra brackets '[]'`);

    return { errors };
};

const Index = () => {
    const [code, setCode] = useState(defaultCode);

    // PERSISTENT STATE: These persist across navigation
    const [output, setOutput] = useLocalStorage<string>("editor_output", "");
    const [programOutput, setProgramOutput] = useLocalStorage<string>("editor_programOutput", "");  // NEW: Actual program execution output
    const [outputType, setOutputType] = useLocalStorage<"success" | "error" | "info" | "warning">("editor_outputType", "info");
    const [exitCode, setExitCode] = useLocalStorage<number | undefined>("editor_exitCode", undefined);
    const [showAIExplanation, setShowAIExplanation] = useLocalStorage<boolean>("editor_showAI", false);
    const [aiExplanation, setAiExplanation] = useLocalStorage<any>("editor_aiExplanation", null);
    const [showNotificationDot, setShowNotificationDot] = useLocalStorage<boolean>("editor_notificationDot", false);
    const [errorLines, setErrorLines] = useLocalStorage<number[]>("editor_errorLines", []);
    const [fixedLines, setFixedLines] = useLocalStorage<number[]>("editor_fixedLines", []);

    // TRANSIENT STATE: Reset on remount (these don't need to persist)
    const [isRunning, setIsRunning] = useState(false);
    const [userInputs, setUserInputs] = useState<string[]>([]);
    const [runId, setRunId] = useState(0); // Force re-render of ConsoleOutput on each run

    // Advanced Input Handling
    const [inputRequirements, setInputRequirements] = useState<InputRequirement[]>([]);
    const [showInputModal, setShowInputModal] = useState(false);

    const [userId] = useState(() => {
        let id = localStorage.getItem('user_id');
        if (!id) {
            id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('user_id', id);
        }
        return id;
    });
    const currentJobRef = useRef<string | null>(null);

    // New state for language detection and visual feedback
    const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);

    // GLOBAL STATE RESET: Clears all red dots, warnings, and previous analysis
    const clearAllStates = () => {
        setOutput("");
        setProgramOutput("");  // Also clear program output
        setOutputType("info");
        setExitCode(undefined);
        setShowAIExplanation(false);
        setAiExplanation(null);
        setIsRunning(true);
        setShowNotificationDot(false);
        setErrorLines([]);
        setFixedLines([]);
        setRunId(prev => prev + 1); // Force ConsoleOutput to remount
        toast.dismiss();
    };

    // Clear output states on component mount (handles page refresh)
    useEffect(() => {
        // Clear persisted output states to ensure clean state on mount/refresh
        setOutput("");
        setProgramOutput("");
        setOutputType("info");
        setExitCode(undefined);
        setShowAIExplanation(false);
        setAiExplanation(null);
        setShowNotificationDot(false);
        setErrorLines([]);
        setFixedLines([]);
    }, []);

    // Load code from localStorage if available (from compile history)
    useEffect(() => {
        const savedCode = localStorage.getItem('editor_code');
        if (savedCode) {
            setCode(savedCode);
            localStorage.removeItem('editor_code'); // Clear after loading

            // Clear output states when loading a new file
            setOutput("");
            setProgramOutput("");
            setOutputType("info");
            setExitCode(undefined);
            setShowAIExplanation(false);
            setAiExplanation(null);
            setShowNotificationDot(false);
            setErrorLines([]);
            setFixedLines([]);
        }
    }, []);

    const handleRunCode = async () => {
        clearAllStates(); // <--- RESET EVERYTHING ON CLICK

        try {
            toast.loading("Analyzing code requirements...");
            const { analyzeRequirements } = await import("@/utils/inputParser");
            const requirements = await analyzeRequirements(code);
            toast.dismiss();

            if (requirements.requiresInput) {
                setIsRunning(false); // Pause to allow input
                setInputRequirements(requirements.inputs);
                setShowInputModal(true);
                return;
            }

            executeCode([]);
        } catch (e) {
            console.error(e);
            toast.error("Analysis failed");
            setIsRunning(false);
        }
    };

    const handleInputSubmit = (inputs: string[]) => {
        setShowInputModal(false);
        setUserInputs(inputs);
        executeCode(inputs);
    };

    const executeCode = async (currentInputs: string[]) => {
        setIsRunning(true);
        let currentHighlightLines: number[] = [];

        toast.loading("Compiling code...");

        try {
            const { runJavaCompilerSimulation } = await import("@/utils/compiler");
            const { trackCompilation } = await import("@/utils/mistakeTracker");

            const result = await runJavaCompilerSimulation(code, currentInputs);

            // Update Output State
            setOutput(result.output);  // Error analysis for AI tab
            setProgramOutput(result.programOutput || result.output);  // Actual execution output for console
            setExitCode(result.exitCode);
            setOutputType(result.outputType as "success" | "error" | "info" | "warning");

            // Debug logging to diagnose console output issues
            console.log('🔍 Program Output Debug:', {
                programOutput: result.programOutput,
                output: result.output,
                exitCode: result.exitCode,
                outputType: result.outputType,
                programOutputLength: result.programOutput?.length || 0
            });

            // Handle Foreign Language Detection
            // REMOVED: We are now a Java-only env, and the simulator returns 'java' as detected.
            setDetectedLanguage("java");

            // STRICT ERROR HANDLING & ENTRY POINT CHECK
            const scanResult = lexicalScan(code);
            const entryPointError = scanResult.errors.find(e => e.includes("Entry Point Error"));

            if (entryPointError) {
                // ENTRY POINT PRIORITY: If main is wrong, nothing else matters.
                const match = entryPointError.match(/Line (\d+)/);
                const line = match ? parseInt(match[1]) : 1;
                currentHighlightLines = [line];
                setErrorLines([line]);
                setAiExplanation({
                    status: "ERROR",
                    message: "Entry Point Error",
                    summary: "The main function is misspelled.",
                    explanation: "The compiler cannot run your code because it can't find 'main'. You typed '" + (entryPointError.includes("man") ? "man" : "mian") + "'.",
                    corrected_code: code.replace(/void (man|mian)\(/, "void main("),
                    confidence: 1.0
                });
                setShowAIExplanation(true);
            }
            else if (result.logicalErrors.length > 0 && result.exitCode !== 0) { // Only show logical errors if it actually failed? Or strict mode?
                // Actually strict rule says: if ExitCode 0, ignore these. But here exitCode might be != 0.
                const lines = result.logicalErrors.map(e => e.line).filter(l => l > 0);
                currentHighlightLines = lines;
                setErrorLines(lines);
            }
            else if (result.exitCode !== 0) {
                // Parse GCC errors with strict SHIFT-BACK logic
                const errorLineRegex = /:(\d+):(?:\d+:)?\s+error:(.*)/g;
                const newErrorLines: number[] = [];
                let match;
                const codeLines = code.split('\n');

                while ((match = errorLineRegex.exec(result.output)) !== null) {
                    let lineNum = parseInt(match[1]);
                    const msg = match[2];

                    // SHIFT-BACK RULE: "expected ';'" or "expected token" usually refers to PREVIOUS line
                    if (msg.includes("expected") && (msg.includes(";") || msg.includes("token") || msg.includes("before"))) {
                        // Check if current line is just a closing brace or empty?
                        const currentLineContent = codeLines[lineNum - 1]?.trim();

                        // If current line is '}' or empty, definitely look back.
                        // Or if it says "expected ; before return", and return is on lineNum, the missing ; is on previous line.
                        if (lineNum > 1) {
                            // Simple heuristic: Move back to previous non-empty line
                            let prevLineIdx = lineNum - 2; // 0-indexed prev line
                            while (prevLineIdx >= 0 && !codeLines[prevLineIdx].trim()) {
                                prevLineIdx--;
                            }
                            if (prevLineIdx >= 0) {
                                lineNum = prevLineIdx + 1; // Convert back to 1-indexed
                            }
                        }
                    }
                    if (lineNum > 0) newErrorLines.push(lineNum);
                }

                // Deduplicate
                const uniqueLines = Array.from(new Set(newErrorLines));
                currentHighlightLines = uniqueLines;
                setErrorLines(uniqueLines);
            } else {
                setErrorLines([]);
            }

            // --- LOCAL STORAGE TRACKING ---
            try {
                const historyItem = {
                    id: Date.now().toString(),
                    created_at: new Date().toISOString(),
                    status: result.exitCode === 0 && result.logicalErrors.length === 0 ? "done" : "error",
                    code: code,
                    run_output: result.exitCode === 0 ? result.output : null,
                    raw_compiler_output: result.exitCode !== 0 ? result.output : null,
                    logical_errors: result.logicalErrors
                };
                const existingHistory = JSON.parse(localStorage.getItem('compile_history') || '[]');
                const newHistory = [historyItem, ...existingHistory].slice(0, 20);
                localStorage.setItem('compile_history', JSON.stringify(newHistory));
            } catch (e) {
                console.error("Failed to save history:", e);
            }

            trackCompilation(result.output, result.exitCode === 0);

            // -------------------------------------------------------
            // COMPREHENSIVE AI ANALYSIS FOR ALL SCENARIOS
            // -------------------------------------------------------

            // 1. Analyze Core Status using the strict utility
            const analysisResult = analyzeCode(code, {
                exitCode: result.exitCode,
                output: result.output,
                logicalErrors: result.logicalErrors.map(e => ({
                    line: e.line,
                    message: e.message,
                    type: e.errorType || "LOGIC"
                }))
            });

            // 2. Control Notification Dot (only for errors/warnings, not success)
            setShowNotificationDot(analysisResult.showNotification);

            // 3. Determine Analysis Type and Input
            let analysisType: 'error' | 'warning' | 'success';
            let analysisInput: string;

            if (result.exitCode !== 0) {
                // SCENARIO 1: Compilation failed
                analysisType = 'error';
                analysisInput = result.output;
                toast.dismiss();
                toast.error("Compilation Failed");
            } else if (result.output && result.output.trim() !== '' && result.output.toLowerCase().includes('warning')) {
                // SCENARIO 2: Compiled with warnings
                analysisType = 'warning';
                analysisInput = result.output;
                toast.dismiss();
                toast.warning("Warnings Detected");
            } else {
                // SCENARIO 3: Clean compilation - analyze for logical errors
                analysisType = 'success';
                analysisInput = '';
                toast.dismiss();
                toast.success("Compilation Successful");
            }

            // 4. ALWAYS run AI Analysis (for ALL three scenarios)
            try {
                const { callGroqAPI } = await import("@/utils/groqClient");

                // Show loading state
                const loadingAI = {
                    status: analysisType === 'success' ? "OPTIMAL" : "ERROR",
                    summary: analysisType === 'error' ? "Analyzing compilation errors..." :
                        analysisType === 'warning' ? "Analyzing warnings..." :
                            "Analyzing code for potential issues...",
                    message: "AI analysis in progress..."
                };
                setAiExplanation(loadingAI);
                setShowAIExplanation(true);

                // Build appropriate prompt based on scenario
                let prompt: string;
                let systemPrompt: string;

                if (analysisType === 'error') {
                    // ERROR SCENARIO: Analyze compilation error
                    systemPrompt = "You are a Java compiler error explanation expert. Provide clear, concise analysis. Return JSON only.";
                    prompt = `Compilation error detected:
${analysisInput}

Code:
${code.split('\n').filter(l => l.trim()).join('\n')}

Analyze the error and provide:
1. What went wrong (brief explanation)
2. How to fix it (specific steps)
3. Corrected code

Return JSON: { "status": "ERROR", "topic": "Error Type", "summary": "Brief explanation", "explanation": "Detailed explanation", "fix_summary": "How to fix", "corrected_code": "Fixed code", "root_cause": [line numbers], "hints": ["helpful tips"] }`;

                } else if (analysisType === 'warning') {
                    // WARNING SCENARIO: Explain why warning is dangerous
                    systemPrompt = "You are a Java compiler warning expert. Explain dangers and fixes clearly. Return JSON only.";
                    prompt = `Compiler warning detected:
${analysisInput}

Code:
${code.split('\n').filter(l => l.trim()).join('\n')}

Explain:
1. What the warning means
2. Why it's dangerous (potential runtime crash/bug)
3. How to fix it properly

Return JSON: { "status": "ERROR", "topic": "Warning Type", "summary": "What this warning means", "explanation": "Why it's dangerous", "fix_summary": "How to fix", "corrected_code": "Fixed code", "root_cause": [line numbers], "hints": ["safety tips"] }`;

                } else {
                    // SUCCESS SCENARIO: Analyze for logical errors
                    systemPrompt = "You are a Java code quality analyzer. Check for logical errors, bugs, and edge cases. Return JSON only.";
                    prompt = `Code compiled successfully. Analyze for logical errors or bugs:

Code:
${code.split('\n').filter(l => l.trim()).join('\n')}

Check for:
1. Logical errors (wrong calculations, inverted conditions, etc.)
2. Potential bugs or edge cases
3. Runtime issues

If code is perfect, return: { "status": "OPTIMAL", "message": "Code looks good! No issues found." }
If issues found, return: { "status": "ERROR", "topic": "Logic Error", "summary": "Brief issue", "explanation": "Details", "fix_summary": "How to fix", "corrected_code": "Fixed code", "root_cause": [line numbers], "hints": ["tips"] }`;
                }

                const aiData = await callGroqAPI([
                    { role: "system", content: systemPrompt },
                    { role: "user", content: prompt }
                ]);

                // Update with actual AI analysis
                setAiExplanation(aiData);
                setShowAIExplanation(true);

                // Update error lines based on AI analysis
                if (aiData.status === 'OPTIMAL') {
                    // CRITICAL FIX: Clear error lines when code is perfect
                    setErrorLines([]);
                    setShowNotificationDot(false);
                    console.log('✅ Code is optimal - clearing error decorations');
                } else if (aiData.root_cause && Array.isArray(aiData.root_cause) && aiData.root_cause.length > 0) {
                    // Only set error lines if AI found actual issues
                    setErrorLines(aiData.root_cause);
                    // Also update notification dot if AI found issues in "success" compilation
                    if (analysisType === 'success' && aiData.status === 'ERROR') {
                        setShowNotificationDot(true);
                    }
                    console.log('⚠️ Issues found - showing error lines:', aiData.root_cause);
                }

                toast.dismiss();

            } catch (e: any) {
                console.error("AI Analysis Error:", e);
                toast.dismiss();

                // Fallback based on scenario
                if (analysisType === 'success') {
                    // For success, show optimistic message if AI fails
                    setAiExplanation({
                        status: "OPTIMAL",
                        message: "Code compiled successfully! (AI analysis unavailable)",
                        confidence: 0.8
                    });
                    // Clear error lines on success fallback too
                    setErrorLines([]);
                    setShowNotificationDot(false);
                } else {
                    // For errors/warnings, show basic info
                    toast.error("AI Analysis Failed");
                    setAiExplanation({
                        status: "ERROR",
                        summary: "AI Service Unavailable",
                        explanation: result.output || "Please check the console output for details.",
                        message: analysisType === 'error' ? "Compilation failed" : "Warning detected"
                    });
                }
                setShowAIExplanation(true);
            }

        } catch (err) {
            console.error("Runner error:", err);
            toast.dismiss();
            toast.error("System Error: " + (err as Error).message);
        } finally {
            setIsRunning(false);
        }
    };

    const handleDeepAnalysis = async () => {
        if (!code) return;
        toast.dismiss();
        toast.loading("Running deep code analysis...");

        try {
            const { callGroqAPI } = await import("@/utils/groqClient");
            const scanResult = lexicalScan(code);
            const lexicalErrors = scanResult.errors;
            const currentOutput = output || "No output";
            const currentExit = exitCode ?? 0;
            const currentLines = errorLines;

            const prompt = `
                You are an AI code explanation assistant. DEEP ANALYSIS REQUESTED.
                User specifically requested "Analyze Deeper".
                
                CRITICAL CONTEXT:
                1. Compiler Exit Code: ${currentExit}
                2. Compiler Output: ${currentOutput}
                3. Focused Error Lines: ${JSON.stringify(currentLines)}

                Required JSON Structure:
                { 
                  "status": "OPTIMAL" | "ERROR", 
                  "message": "Only if OPTIMAL",
                  "topic": "Topic Name", 
                  "root_cause": [List of Line Numbers], 
                  "summary": "Brief summary", 
                  "explanation": "Detailed explanation", 
                  "corrected_code": "Full fixed code",
                  "fix_summary": "Bullet points",
                  "hints": ["Hint 1"]
                }
                
                CODE:
                ${code}
                `;

            const aiData = await callGroqAPI([
                { role: "system", content: "You are a specialized Error Analysis Engine. Strict JSON. No fluff." },
                { role: "user", content: prompt }
            ]);

            setAiExplanation(aiData);
            setShowAIExplanation(true);
            if (aiData.root_cause && Array.isArray(aiData.root_cause) && aiData.root_cause.length > 0) {
                setErrorLines(aiData.root_cause);
            }
            toast.dismiss();
            toast.success("Analysis Complete");

        } catch (e) {
            console.error("Deep Analysis Failed", e);
            toast.error("Analysis Failed");
        }
    };

    const handleApplyPatch = () => {
        if (!aiExplanation) return;

        // Priority 1: Use corrected_code if available (full file replacement)
        if (aiExplanation.corrected_code) {
            setCode(aiExplanation.corrected_code);

            const lines = aiExplanation.corrected_code.split('\n');
            const allLines = lines.map((_: any, i: number) => i + 1);
            setFixedLines(allLines);
            setTimeout(() => setFixedLines([]), 3000);

            toast.success("Corrected code has been applied!");
            return;
        }

        // Priority 2: Use minimal_fix_patch for line-based replacement
        if (aiExplanation.minimal_fix_patch) {
            const patch = aiExplanation.minimal_fix_patch;
            const lines = code.split('\n');

            // Get lines before the error (0-indexed, so line_start-1)
            const before = lines.slice(0, patch.line_start - 1);

            // Get lines after the error (0-indexed, so line_end because we want to skip line_end)
            const after = lines.slice(patch.line_end);

            // Split replacement by newlines in case it's multi-line
            const replacementLines = patch.replacement.split('\n');

            // Combine: before + replacement lines + after
            const newCode = [...before, ...replacementLines, ...after].join('\n');

            setCode(newCode);

            // Calculate new range for highlighting
            const startLine = patch.line_start;
            const endLine = startLine + replacementLines.length - 1;
            const fixedRange = [];
            for (let i = startLine; i <= endLine; i++) fixedRange.push(i);

            setFixedLines(fixedRange);
            setTimeout(() => setFixedLines([]), 3000);

            toast.success("Code updated with suggested fix!");
        }
    };

    const handleAutoConvert = async (sourceLang: string) => {
        setIsTranslating(true);
        toast.loading(`Converting from ${sourceLang} to C...`);

        try {
            const { convertToJava } = await import("@/utils/compiler");
            const convertedCode = await convertToJava(code, sourceLang);

            // Calculate Highlighted Lines (Green) - Simple diff: All new lines are "fixed"
            // Ideally we could diff properly, but for conversion entire file changes basically.
            // Let's mark all non-empty lines as fixed for visual feedback.
            const lines = convertedCode.split('\n');
            const nonEmptyLines = lines.map((_, i) => i + 1); // Mark all lines

            setCode(convertedCode);
            setFixedLines(nonEmptyLines);
            setDetectedLanguage(null);
            setErrorLines([]); // Clear errors

            toast.dismiss();
            toast.success("Converted to Java Successfully!", {
                description: "Changed lines are highlighted in green."
            });

            // Remove green highlight after 3 seconds
            setTimeout(() => setFixedLines([]), 3000);

        } catch (error) {
            console.error(error);
            toast.dismiss();
            toast.error("Conversion failed.");
        } finally {
            setIsTranslating(false);
        }
    };

    const handleDownload = () => {
        const blob = new Blob([code], { type: "text/x-java-source" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Main.java";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("File downloaded successfully");
    };

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header */}
            <header className="flex-shrink-0 border-b border-border/50 bg-card">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Code2 className="h-6 w-6 text-primary" />
                                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    Java Compiler Studio
                                </h1>
                            </div>
                            <span className="text-xs text-muted-foreground hidden sm:block">
                                with AI-powered debugging
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link to="/settings">
                                <Button variant="ghost" size="sm">
                                    <span className="hidden sm:inline">Settings</span>
                                    <span className="sm:hidden">⚙️</span>
                                </Button>
                            </Link>
                            <Link to="/tutor">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    <span className="hidden sm:inline">AI Tutor</span>
                                    <span className="sm:hidden">Tutor</span>
                                </Button>
                            </Link>
                            <Link to="/aiask">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    <span className="hidden sm:inline">AI Study Assistant</span>
                                    <span className="sm:hidden">AI Ask</span>
                                </Button>
                            </Link>

                            {(aiExplanation?.corrected_code || aiExplanation?.minimal_fix_patch) && (
                                <Button
                                    onClick={handleApplyPatch}
                                    variant="default"
                                    size="sm"
                                    className="gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 text-white"
                                >
                                    <Wand2 className="h-4 w-4" />
                                    <span className="hidden sm:inline">Auto Fix</span>
                                </Button>
                            )}

                            <Button
                                onClick={handleDownload}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">Download</span>
                            </Button>
                            <Button
                                onClick={handleRunCode}
                                disabled={isRunning}
                                size="sm"
                                className="gap-2 bg-gradient-to-r from-success to-success/80 hover:opacity-90"
                            >
                                <Play className="h-4 w-4" />
                                Run Code
                            </Button>
                        </div>

                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
                <div className="h-full grid md:grid-cols-2 gap-4 p-4">
                    {/* Editor Section */}
                    <div className="h-full overflow-hidden relative group">
                        <CodeEditor
                            value={code}
                            onChange={(value) => setCode(value || "")}
                            errorLines={errorLines}
                            fixedLines={fixedLines}
                        />

                        {detectedLanguage && (
                            <div className="absolute bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2">
                                <Card className="p-4 border-red-500/50 bg-[#1a1d2e] shadow-lg backdrop-blur-sm flex flex-col gap-2 max-w-xs">
                                    <div className="flex items-center gap-2 text-red-400 font-semibold">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="8" x2="12" y2="12" />
                                            <line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                        Detected {detectedLanguage} code
                                    </div>
                                    <p className="text-xs text-gray-400">This compiler only supports Java.</p>
                                    <Button
                                        onClick={() => handleAutoConvert(detectedLanguage)}
                                        disabled={isTranslating}
                                        size="sm"
                                        className="bg-gradient-to-r from-success to-success/80 hover:opacity-90 text-white w-full shadow-md"
                                    >
                                        {isTranslating ? (
                                            <><Sparkles className="w-3 h-3 mr-2 animate-spin" /> Converting...</>
                                        ) : (
                                            <><Wand2 className="w-3 h-3 mr-2" /> Auto Fix</>
                                        )}
                                    </Button>
                                </Card>
                            </div>
                        )}
                    </div>

                    {/* Output Section */}
                    <div className="h-full overflow-hidden">
                        <Tabs defaultValue="console" className="h-full flex flex-col">
                            <div className="border-b border-border bg-card/50 backdrop-blur pb-px">
                                <TabsList className="h-auto p-0 bg-transparent flex justify-start gap-0 w-full rounded-none">
                                    <TabsTrigger
                                        value="console"
                                        className="
                                           relative h-11 px-6 rounded-none border-b-2 border-transparent 
                                           text-[14px] font-medium text-muted-foreground 
                                           hover:text-foreground hover:bg-muted/30
                                           data-[state=active]:border-blue-500 data-[state=active]:text-foreground
                                           transition-all duration-200 gap-2
                                        "
                                    >
                                        <BookOpen className="h-4 w-4" />
                                        Console
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="ai"
                                        className="
                                           relative h-11 px-6 rounded-none border-b-2 border-transparent 
                                           text-[14px] font-medium text-muted-foreground 
                                           hover:text-foreground hover:bg-muted/30
                                           data-[state=active]:border-purple-500 data-[state=active]:text-foreground
                                           transition-all duration-200 gap-2
                                        "
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        AI Explanation
                                        {showNotificationDot && (
                                            <span className="absolute top-2 right-1 flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                                            </span>
                                        )}
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                            <TabsContent value="console" className="flex-1 m-0 overflow-hidden">
                                <ConsoleOutput key={runId} output={programOutput || output} type={outputType} exitCode={exitCode} />
                            </TabsContent>
                            <TabsContent value="ai" className="flex-1 m-0 overflow-hidden">
                                {showAIExplanation && aiExplanation ? (
                                    <AIExplanation
                                        explanation={aiExplanation}
                                        onApplyPatch={handleApplyPatch}
                                        onDeepAnalyze={handleDeepAnalysis}
                                    />
                                ) : (
                                    <Card className="h-full overflow-hidden border-border/50 bg-card">
                                        <div className="p-8 text-center text-muted-foreground">
                                            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p className="text-lg font-medium mb-2">No AI analysis yet</p>
                                            <p className="text-sm">Run your code to get AI-powered explanations and insights</p>
                                            {output && (
                                                <Button
                                                    onClick={handleDeepAnalysis}
                                                    variant="outline"
                                                    className="mt-4 gap-2"
                                                >
                                                    <Sparkles className="w-4 h-4" />
                                                    Analyze Now
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main >

            {/* Footer */}
            < footer className="flex-shrink-0 border-t border-border/50 bg-card px-4 py-2" >
                <div className="container mx-auto">
                    <p className="text-xs text-muted-foreground text-center">
                        Educational C compiler with AI-powered error explanations
                    </p>
                </div>
            </footer >

            <InputModal
                isOpen={showInputModal}
                onClose={() => setShowInputModal(false)}
                requirements={inputRequirements}
                onSubmit={handleInputSubmit}
            />
        </div >
    );
};

export default Index;
